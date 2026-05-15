import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface FraudScore {
  claim_id: string;
  overall_score: number; // 0-100 (higher = more likely fraud)
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  flags: FraudFlag[];
  recommendation: 'auto_approve' | 'manual_review' | 'investigation_required' | 'reject';
  analyzed_at: string;
}

export interface FraudFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  score_impact: number;
}

export interface DocumentVerification {
  document_id: string;
  status: 'verified' | 'suspicious' | 'forged' | 'inconclusive';
  confidence: number;
  issues: string[];
  metadata: any;
}

export class FraudDetectionService {
  /**
   * Analyze claim for fraud indicators
   */
  async analyzeClaim(claimId: string): Promise<FraudScore> {
    const claim = await AppDataSource.query(
      `SELECT c.*, p.customer_id, p.premium_amount, p.effective_date, p.policy_number,
              cust.created_at as customer_created_at, cust.email
       FROM claim c
       JOIN policy p ON c.policy_id = p.id
       JOIN customer cust ON p.customer_id = cust.id
       WHERE c.id = $1`,
      [claimId]
    );

    if (claim.length === 0) return { claim_id: claimId, overall_score: 0, risk_level: 'low', flags: [], recommendation: 'auto_approve', analyzed_at: new Date().toISOString() };

    const c = claim[0];
    const flags: FraudFlag[] = [];
    let totalScore = 0;

    // Rule 1: Early claim (within 30 days of policy purchase)
    const daysSincePurchase = Math.floor((new Date(c.incident_date).getTime() - new Date(c.effective_date).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSincePurchase < 30) {
      flags.push({ type: 'early_claim', severity: 'medium', description: `Yêu cầu bồi thường trong ${daysSincePurchase} ngày sau mua`, score_impact: 20 });
      totalScore += 20;
    }

    // Rule 2: Claim amount vs premium ratio
    const claimToPremiumRatio = c.claim_amount / c.premium_amount;
    if (claimToPremiumRatio > 10) {
      flags.push({ type: 'high_ratio', severity: 'high', description: `Số tiền yêu cầu gấp ${Math.round(claimToPremiumRatio)}x phí bảo hiểm`, score_impact: 25 });
      totalScore += 25;
    } else if (claimToPremiumRatio > 5) {
      flags.push({ type: 'elevated_ratio', severity: 'medium', description: `Số tiền yêu cầu gấp ${Math.round(claimToPremiumRatio)}x phí bảo hiểm`, score_impact: 10 });
      totalScore += 10;
    }

    // Rule 3: Frequency of claims
    const recentClaims = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM claim c JOIN policy p ON c.policy_id = p.id WHERE p.customer_id = $1 AND c.created_at > NOW() - INTERVAL '6 months'`,
      [c.customer_id]
    );
    const claimCount = parseInt(recentClaims[0]?.count) || 0;
    if (claimCount > 3) {
      flags.push({ type: 'frequent_claims', severity: 'high', description: `${claimCount} yêu cầu trong 6 tháng gần đây`, score_impact: 20 });
      totalScore += 20;
    }

    // Rule 4: New customer (account < 3 months)
    const accountAge = Math.floor((Date.now() - new Date(c.customer_created_at).getTime()) / (1000 * 60 * 60 * 24));
    if (accountAge < 90) {
      flags.push({ type: 'new_account', severity: 'low', description: `Tài khoản mới (${accountAge} ngày)`, score_impact: 10 });
      totalScore += 10;
    }

    // Rule 5: Weekend/holiday incident
    const incidentDay = new Date(c.incident_date).getDay();
    if (incidentDay === 0 || incidentDay === 6) {
      flags.push({ type: 'weekend_incident', severity: 'low', description: 'Sự kiện xảy ra vào cuối tuần', score_impact: 5 });
      totalScore += 5;
    }

    // Rule 6: Large round numbers
    if (c.claim_amount % 1000000 === 0 && c.claim_amount >= 10000000) {
      flags.push({ type: 'round_amount', severity: 'low', description: 'Số tiền yêu cầu là số tròn lớn', score_impact: 5 });
      totalScore += 5;
    }

    // Rule 7: Similar claims pattern
    const similarClaims = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM claim WHERE claim_type = $1 AND claim_amount = $2 AND id != $3 AND created_at > NOW() - INTERVAL '30 days'`,
      [c.claim_type, c.claim_amount, claimId]
    );
    if (parseInt(similarClaims[0]?.count) > 2) {
      flags.push({ type: 'pattern_match', severity: 'medium', description: 'Mẫu yêu cầu tương tự được phát hiện', score_impact: 15 });
      totalScore += 15;
    }

    // Cap score at 100
    totalScore = Math.min(totalScore, 100);

    // Determine risk level and recommendation
    let riskLevel: FraudScore['risk_level'] = 'low';
    let recommendation: FraudScore['recommendation'] = 'auto_approve';

    if (totalScore >= 70) { riskLevel = 'critical'; recommendation = 'reject'; }
    else if (totalScore >= 50) { riskLevel = 'high'; recommendation = 'investigation_required'; }
    else if (totalScore >= 30) { riskLevel = 'medium'; recommendation = 'manual_review'; }

    // Save analysis
    await AppDataSource.query(
      `INSERT INTO fraud_analysis (id, claim_id, overall_score, risk_level, flags, recommendation, analyzed_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (claim_id) DO UPDATE SET overall_score = $3, risk_level = $4, flags = $5, recommendation = $6, analyzed_at = NOW()`,
      [uuidv4(), claimId, totalScore, riskLevel, JSON.stringify(flags), recommendation]
    );

    logger.info(`[Fraud] Analyzed claim ${claimId}: score=${totalScore}, risk=${riskLevel}, rec=${recommendation}`);

    return { claim_id: claimId, overall_score: totalScore, risk_level: riskLevel, flags, recommendation, analyzed_at: new Date().toISOString() };
  }

  /**
   * Verify document authenticity (AI-based)
   */
  async verifyDocument(documentId: string, claimId: string): Promise<DocumentVerification> {
    const doc = await AppDataSource.query(
      `SELECT * FROM claim_document WHERE id = $1 AND claim_id = $2`, [documentId, claimId]
    );
    if (doc.length === 0) {
      return { document_id: documentId, status: 'inconclusive', confidence: 0, issues: ['Document not found'], metadata: {} };
    }

    const d = doc[0];
    const issues: string[] = [];
    let confidence = 85; // Base confidence

    // Simulated AI verification checks
    // In production: call ML model API for document verification

    // Check 1: File size anomaly
    if (d.file_size < 10000) { // < 10KB suspicious for documents
      issues.push('Kích thước file quá nhỏ');
      confidence -= 20;
    }

    // Check 2: MIME type consistency
    const expectedMimes: Record<string, string[]> = {
      photo: ['image/jpeg', 'image/png', 'image/heic'],
      medical_report: ['application/pdf', 'image/jpeg', 'image/png'],
      invoice: ['application/pdf', 'image/jpeg', 'image/png'],
      police_report: ['application/pdf', 'image/jpeg'],
    };
    const validMimes = expectedMimes[d.type] || ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validMimes.includes(d.mime_type)) {
      issues.push(`Loại file không phù hợp: ${d.mime_type}`);
      confidence -= 15;
    }

    // Check 3: Metadata timestamp consistency
    if (d.captured_at) {
      const captureDate = new Date(d.captured_at);
      const uploadDate = new Date(d.created_at);
      const hoursDiff = (uploadDate.getTime() - captureDate.getTime()) / (1000 * 60 * 60);
      if (hoursDiff > 72) {
        issues.push('Tài liệu được chụp hơn 72 giờ trước khi tải lên');
        confidence -= 10;
      }
    }

    let status: DocumentVerification['status'] = 'verified';
    if (confidence < 50) status = 'forged';
    else if (confidence < 70) status = 'suspicious';
    else if (issues.length > 0) status = 'inconclusive';

    // Save verification result
    await AppDataSource.query(
      `UPDATE claim_document SET verification_status = $1, verification_confidence = $2, verification_issues = $3 WHERE id = $4`,
      [status, confidence, JSON.stringify(issues), documentId]
    );

    return { document_id: documentId, status, confidence, issues, metadata: { file_size: d.file_size, mime_type: d.mime_type } };
  }

  /**
   * Get fraud analytics summary (admin)
   */
  async getFraudAnalytics(): Promise<any> {
    const [summary, recentFlags, riskDistribution] = await Promise.all([
      AppDataSource.query(`
        SELECT 
          COUNT(*) as total_analyzed,
          COUNT(CASE WHEN risk_level = 'critical' THEN 1 END) as critical_count,
          COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_count,
          COUNT(CASE WHEN risk_level = 'medium' THEN 1 END) as medium_count,
          COUNT(CASE WHEN risk_level = 'low' THEN 1 END) as low_count,
          COALESCE(AVG(overall_score), 0) as avg_score
        FROM fraud_analysis WHERE analyzed_at > NOW() - INTERVAL '30 days'
      `),
      AppDataSource.query(`
        SELECT fa.claim_id, c.claim_number, fa.overall_score, fa.risk_level, fa.recommendation, fa.analyzed_at
        FROM fraud_analysis fa
        JOIN claim c ON fa.claim_id = c.id
        WHERE fa.risk_level IN ('high', 'critical')
        ORDER BY fa.analyzed_at DESC LIMIT 20
      `),
      AppDataSource.query(`
        SELECT risk_level, COUNT(*) as count
        FROM fraud_analysis WHERE analyzed_at > NOW() - INTERVAL '30 days'
        GROUP BY risk_level
      `),
    ]);

    return {
      summary: summary[0],
      recent_high_risk: recentFlags,
      risk_distribution: riskDistribution,
    };
  }
}
