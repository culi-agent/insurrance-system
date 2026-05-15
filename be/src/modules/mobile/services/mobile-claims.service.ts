import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid';

export interface MobileClaimSubmission {
  policy_id: string;
  claim_type: 'accident' | 'illness' | 'death' | 'property_damage' | 'theft' | 'natural_disaster' | 'other';
  incident_date: string;
  incident_description: string;
  incident_location?: string;
  claim_amount: number;
  documents: ClaimDocument[];
  contact_phone?: string;
  bank_account?: {
    bank_name: string;
    account_number: string;
    account_holder: string;
    branch?: string;
  };
}

export interface ClaimDocument {
  id?: string;
  type: 'photo' | 'id_card' | 'medical_report' | 'police_report' | 'invoice' | 'receipt' | 'other';
  filename: string;
  file_url: string; // Pre-signed URL or uploaded path
  file_size: number;
  mime_type: string;
  description?: string;
  captured_at?: string; // When photo was taken (for camera capture)
  location?: { lat: number; lng: number }; // GPS of capture
}

export interface MobileClaimResult {
  claim_id: string;
  claim_number: string;
  status: string;
  submitted_at: string;
  estimated_processing_days: number;
  next_steps: string[];
  required_documents: string[]; // Any missing documents
}

export interface DocumentUploadResult {
  document_id: string;
  upload_url: string; // Pre-signed URL for direct upload
  expires_at: string;
}

export class MobileClaimsService {
  /**
   * Submit a claim from mobile (with camera-captured documents)
   */
  async submitClaim(customerId: string, input: MobileClaimSubmission): Promise<MobileClaimResult> {
    // Validate policy belongs to customer and is active
    const policy = await AppDataSource.query(
      `SELECT p.id, p.policy_number, p.status, p.insurer_id, pr.insurance_type, pr.name as product_name
       FROM policy p
       JOIN product pr ON p.product_id = pr.id
       WHERE p.id = $1 AND p.customer_id = $2`,
      [input.policy_id, customerId]
    );

    if (policy.length === 0) {
      throw new NotFoundError('Hợp đồng không tìm thấy');
    }

    if (policy[0].status !== 'active') {
      throw new ValidationError('Hợp đồng không còn hiệu lực. Chỉ hợp đồng đang active mới có thể nộp yêu cầu.');
    }

    // Validate incident date is within policy period
    const incidentDate = new Date(input.incident_date);
    if (incidentDate > new Date()) {
      throw new ValidationError('Ngày xảy ra sự kiện không thể là ngày tương lai');
    }

    // Generate claim number
    const claimNumber = await this.generateClaimNumber(policy[0].insurance_type);

    // Create claim
    const claimId = uuidv4();
    await AppDataSource.query(
      `INSERT INTO claim (id, claim_number, policy_id, customer_id, insurer_id, claim_type, 
       incident_date, incident_description, incident_location, claim_amount, 
       contact_phone, bank_account, status, source, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'submitted', 'mobile', NOW(), NOW())`,
      [
        claimId, claimNumber, input.policy_id, customerId, policy[0].insurer_id,
        input.claim_type, input.incident_date, input.incident_description,
        input.incident_location || null, input.claim_amount,
        input.contact_phone || null, JSON.stringify(input.bank_account || {}),
      ]
    );

    // Save documents
    for (const doc of input.documents) {
      await this.saveClaimDocument(claimId, doc);
    }

    // Determine required documents based on claim type
    const requiredDocs = this.getRequiredDocuments(input.claim_type, policy[0].insurance_type);
    const submittedTypes = input.documents.map(d => d.type);
    const missingDocs = requiredDocs.filter(rd => !submittedTypes.includes(rd.type));

    // Estimate processing time
    const estimatedDays = this.estimateProcessingDays(input.claim_amount, input.claim_type);

    logger.info(`[Mobile Claims] Submitted: claim=${claimNumber}, policy=${policy[0].policy_number}, amount=${input.claim_amount}`);

    return {
      claim_id: claimId,
      claim_number: claimNumber,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      estimated_processing_days: estimatedDays,
      next_steps: this.getNextSteps(missingDocs.length > 0),
      required_documents: missingDocs.map(d => d.label),
    };
  }

  /**
   * Get pre-signed upload URL for document
   */
  async getUploadUrl(customerId: string, claimId: string, documentType: string): Promise<DocumentUploadResult> {
    // Validate claim belongs to customer
    const claim = await AppDataSource.query(
      `SELECT id FROM claim WHERE id = $1 AND customer_id = $2`,
      [claimId, customerId]
    );
    if (claim.length === 0) throw new NotFoundError('Yêu cầu bồi thường không tìm thấy');

    const documentId = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // In production, generate pre-signed S3 URL
    const uploadUrl = `/api/v1/mobile/claims/${claimId}/documents/${documentId}/upload`;

    return {
      document_id: documentId,
      upload_url: uploadUrl,
      expires_at: expiresAt.toISOString(),
    };
  }

  /**
   * Add additional document to existing claim
   */
  async addDocument(customerId: string, claimId: string, document: ClaimDocument): Promise<{ document_id: string; message: string }> {
    const claim = await AppDataSource.query(
      `SELECT id, status FROM claim WHERE id = $1 AND customer_id = $2`,
      [claimId, customerId]
    );

    if (claim.length === 0) throw new NotFoundError('Yêu cầu bồi thường không tìm thấy');
    if (['settled', 'rejected', 'withdrawn'].includes(claim[0].status)) {
      throw new ValidationError('Không thể thêm tài liệu cho yêu cầu đã kết thúc');
    }

    const docId = await this.saveClaimDocument(claimId, document);

    return { document_id: docId, message: 'Đã tải lên tài liệu thành công' };
  }

  /**
   * Get claim documents list
   */
  async getClaimDocuments(customerId: string, claimId: string): Promise<ClaimDocument[]> {
    const claim = await AppDataSource.query(
      `SELECT id FROM claim WHERE id = $1 AND customer_id = $2`,
      [claimId, customerId]
    );
    if (claim.length === 0) throw new NotFoundError('Yêu cầu bồi thường không tìm thấy');

    const documents = await AppDataSource.query(
      `SELECT id, type, filename, file_url, file_size, mime_type, description, captured_at, location, created_at
       FROM claim_document WHERE claim_id = $1 ORDER BY created_at`,
      [claimId]
    );

    return documents.map((d: any) => ({
      id: d.id,
      type: d.type,
      filename: d.filename,
      file_url: d.file_url,
      file_size: d.file_size,
      mime_type: d.mime_type,
      description: d.description,
      captured_at: d.captured_at,
      location: d.location,
    }));
  }

  /**
   * Get eligible policies for claims (active only)
   */
  async getEligiblePolicies(customerId: string): Promise<Array<{ policy_id: string; policy_number: string; product_name: string; insurance_type: string; insurer_name: string }>> {
    const policies = await AppDataSource.query(`
      SELECT p.id as policy_id, p.policy_number, pr.name as product_name,
             pr.insurance_type, COALESCE(i.name, 'N/A') as insurer_name
      FROM policy p
      JOIN product pr ON p.product_id = pr.id
      LEFT JOIN insurer i ON p.insurer_id = i.id
      WHERE p.customer_id = $1 AND p.status = 'active'
      ORDER BY p.created_at DESC
    `, [customerId]);

    return policies;
  }

  /**
   * Get required documents info for a claim type
   */
  getRequiredDocumentsList(claimType: string, insuranceType: string): Array<{ type: string; label: string; required: boolean; description: string }> {
    return this.getRequiredDocuments(claimType, insuranceType);
  }

  // ============ Private Methods ============

  private async saveClaimDocument(claimId: string, doc: ClaimDocument): Promise<string> {
    const docId = doc.id || uuidv4();
    await AppDataSource.query(
      `INSERT INTO claim_document (id, claim_id, type, filename, file_url, file_size, mime_type, description, captured_at, location, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [docId, claimId, doc.type, doc.filename, doc.file_url, doc.file_size, doc.mime_type, doc.description || null, doc.captured_at || null, doc.location ? JSON.stringify(doc.location) : null]
    );
    return docId;
  }

  private async generateClaimNumber(insuranceType: string): Promise<string> {
    const prefix = insuranceType.slice(0, 2).toUpperCase();
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const seq = await AppDataSource.query(`SELECT COUNT(*) + 1 as seq FROM claim WHERE DATE(created_at) = CURRENT_DATE`);
    const seqNum = String(parseInt(seq[0]?.seq) || 1).padStart(4, '0');
    return `CLM-${prefix}${date}-${seqNum}`;
  }

  private getRequiredDocuments(claimType: string, insuranceType: string): Array<{ type: string; label: string; required: boolean; description: string }> {
    const base = [
      { type: 'id_card', label: 'CCCD/CMND', required: true, description: 'Chụp mặt trước và sau CCCD' },
    ];

    const typeSpecific: Record<string, Array<{ type: string; label: string; required: boolean; description: string }>> = {
      accident: [
        { type: 'photo', label: 'Ảnh hiện trường', required: true, description: 'Chụp ảnh hiện trường tai nạn' },
        { type: 'police_report', label: 'Biên bản CSGT', required: false, description: 'Biên bản tai nạn giao thông (nếu có)' },
        { type: 'medical_report', label: 'Giấy khám bệnh', required: true, description: 'Giấy ra viện hoặc kết quả khám' },
        { type: 'invoice', label: 'Hóa đơn viện phí', required: true, description: 'Hóa đơn chi phí điều trị' },
      ],
      illness: [
        { type: 'medical_report', label: 'Giấy khám bệnh', required: true, description: 'Kết quả chẩn đoán và điều trị' },
        { type: 'invoice', label: 'Hóa đơn viện phí', required: true, description: 'Hóa đơn chi phí y tế' },
        { type: 'receipt', label: 'Phiếu thu', required: false, description: 'Phiếu thu chi phí thuốc' },
      ],
      property_damage: [
        { type: 'photo', label: 'Ảnh thiệt hại', required: true, description: 'Chụp ảnh tài sản bị hư hại' },
        { type: 'invoice', label: 'Báo giá sửa chữa', required: true, description: 'Báo giá hoặc hóa đơn sửa chữa' },
        { type: 'police_report', label: 'Biên bản công an', required: false, description: 'Nếu do bên thứ 3 gây ra' },
      ],
      theft: [
        { type: 'police_report', label: 'Biên bản trình báo', required: true, description: 'Biên bản trình báo công an' },
        { type: 'photo', label: 'Ảnh hiện trường', required: true, description: 'Ảnh nơi xảy ra vụ trộm' },
        { type: 'invoice', label: 'Chứng từ giá trị', required: true, description: 'Hóa đơn mua ban đầu' },
      ],
      death: [
        { type: 'medical_report', label: 'Giấy chứng tử', required: true, description: 'Giấy chứng tử chính thức' },
        { type: 'id_card', label: 'CCCD người thụ hưởng', required: true, description: 'CCCD người nhận quyền lợi' },
      ],
      natural_disaster: [
        { type: 'photo', label: 'Ảnh thiệt hại', required: true, description: 'Ảnh tài sản bị ảnh hưởng' },
        { type: 'invoice', label: 'Báo giá sửa chữa', required: true, description: 'Chi phí khắc phục' },
      ],
      other: [
        { type: 'photo', label: 'Ảnh minh chứng', required: false, description: 'Ảnh chụp liên quan' },
        { type: 'other', label: 'Tài liệu bổ sung', required: false, description: 'Tài liệu hỗ trợ yêu cầu' },
      ],
    };

    return [...base, ...(typeSpecific[claimType] || typeSpecific.other)];
  }

  private estimateProcessingDays(amount: number, claimType: string): number {
    // Fast-track for small claims
    if (amount <= 5000000) return 3;
    if (amount <= 20000000) return 7;
    if (claimType === 'death') return 14;
    if (amount <= 100000000) return 10;
    return 15;
  }

  private getNextSteps(hasMissingDocs: boolean): string[] {
    const steps = [
      'Yêu cầu đã được tiếp nhận và đang chờ xử lý',
      'Chuyên viên sẽ xem xét hồ sơ trong 1-2 ngày làm việc',
    ];

    if (hasMissingDocs) {
      steps.push('Vui lòng bổ sung các tài liệu còn thiếu để đẩy nhanh quá trình');
    }

    steps.push('Bạn sẽ nhận thông báo khi có cập nhật mới');
    return steps;
  }
}
