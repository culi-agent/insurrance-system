import { Request, Response } from 'express';
import { ApiV2Service } from '../services/api-v2.service';
import { AppDataSource } from '../../../config/database';

const apiService = new ApiV2Service();

export class ApiV2Controller {
  /**
   * POST /api/v2/partners/register
   */
  async registerPartner(req: Request, res: Response) {
    try {
      const result = await apiService.registerPartner(req.body);
      res.status(201).json({ success: true, data: result, message: 'API partner registered. Store your API secret securely.' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'REGISTRATION_FAILED', message: error.message } });
    }
  }

  /**
   * GET /api/v2/partners/:partnerId/usage
   */
  async getUsageStats(req: Request, res: Response) {
    try {
      const partnerId = (req as any).apiPartner?.id || req.params.partnerId;
      const period = (req.query.period as 'day' | 'week' | 'month') || 'month';
      const result = await apiService.getUsageStats(partnerId, period);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'USAGE_ERROR', message: error.message } });
    }
  }

  /**
   * GET /api/v2/partners/:partnerId/webhooks
   */
  async getWebhookEvents(req: Request, res: Response) {
    try {
      const partnerId = (req as any).apiPartner?.id || req.params.partnerId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await apiService.getWebhookEvents(partnerId, page, limit);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'WEBHOOK_ERROR', message: error.message } });
    }
  }

  /**
   * POST /api/v2/partners/:partnerId/rotate-key
   */
  async rotateApiKey(req: Request, res: Response) {
    try {
      const partnerId = (req as any).apiPartner?.id || req.params.partnerId;
      const result = await apiService.rotateApiKey(partnerId);
      res.json({ success: true, data: result, message: 'API key rotated successfully. Update your integration.' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'ROTATE_FAILED', message: error.message } });
    }
  }

  /**
   * GET /api/v2/quotes - Get quotes via API
   */
  async getQuotes(req: Request, res: Response) {
    try {
      const partnerId = (req as any).apiPartner?.id;
      const { insurance_type, customer_data } = req.body;

      // Simplified quote endpoint for partners
      const quoteResult = await AppDataSource.query(
        `SELECT p.id, p.name, p.slug, i.name as insurer_name, p.min_premium, p.max_premium, p.insurance_type
         FROM product p JOIN insurer i ON p.insurer_id = i.id
         WHERE p.insurance_type = $1 AND p.status = 'active'
         ORDER BY p.min_premium ASC LIMIT 10`,
        [insurance_type]
      );

      res.json({
        success: true,
        data: {
          insurance_type,
          quotes: quoteResult.map((q: any) => ({
            product_id: q.id,
            product_name: q.name,
            insurer: q.insurer_name,
            estimated_premium: { min: parseFloat(q.min_premium), max: parseFloat(q.max_premium) },
          })),
          partner_id: partnerId,
          requested_at: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'QUOTE_ERROR', message: error.message } });
    }
  }

  /**
   * POST /api/v2/policies - Create policy via API
   */
  async createPolicy(req: Request, res: Response) {
    try {
      const partnerId = (req as any).apiPartner?.id;
      const { product_id, customer_info, coverage_options, payment_info } = req.body;

      // Verify product exists
      const product = await AppDataSource.query(
        `SELECT id, name, insurer_id, insurance_type FROM product WHERE id = $1 AND status = 'active'`, [product_id]
      );
      if (product.length === 0) {
        return res.status(404).json({ success: false, error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found or inactive' } });
      }

      // Create policy via API
      const policyId = require('uuid').v4();
      const policyNumber = `API-${Date.now().toString(36).toUpperCase()}`;

      await AppDataSource.query(
        `INSERT INTO policy (id, policy_number, product_id, insurer_id, insurance_type, insured_info, premium_amount, effective_date, expiry_date, status, metadata, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', $10, NOW(), NOW())`,
        [policyId, policyNumber, product_id, product[0].insurer_id, product[0].insurance_type, JSON.stringify(customer_info), payment_info?.amount || 0, coverage_options?.start_date || new Date().toISOString(), coverage_options?.end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), JSON.stringify({ api_partner: partnerId, source: 'api_v2' })]
      );

      // Send webhook
      await apiService.sendWebhook(partnerId, 'policy.created', { policy_id: policyId, policy_number: policyNumber });

      res.status(201).json({
        success: true,
        data: { policy_id: policyId, policy_number: policyNumber, status: 'active', product: product[0].name },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'POLICY_CREATION_FAILED', message: error.message } });
    }
  }

  /**
   * GET /api/v2/policies/:policyId - Get policy details
   */
  async getPolicyDetails(req: Request, res: Response) {
    try {
      const policy = await AppDataSource.query(
        `SELECT p.*, pr.name as product_name, i.name as insurer_name
         FROM policy p
         JOIN product pr ON p.product_id = pr.id
         JOIN insurer i ON p.insurer_id = i.id
         WHERE p.id = $1`,
        [req.params.policyId]
      );

      if (policy.length === 0) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Policy not found' } });
      }

      res.json({ success: true, data: policy[0] });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
    }
  }

  /**
   * POST /api/v2/claims - Submit claim via API
   */
  async submitClaim(req: Request, res: Response) {
    try {
      const partnerId = (req as any).apiPartner?.id;
      const { policy_id, claim_type, incident_date, description, amount, documents } = req.body;

      const policy = await AppDataSource.query(`SELECT id, insurer_id FROM policy WHERE id = $1`, [policy_id]);
      if (policy.length === 0) {
        return res.status(404).json({ success: false, error: { code: 'POLICY_NOT_FOUND', message: 'Policy not found' } });
      }

      const claimId = require('uuid').v4();
      const claimNumber = `API-CLM-${Date.now().toString(36).toUpperCase()}`;

      await AppDataSource.query(
        `INSERT INTO claim (id, claim_number, policy_id, insurer_id, claim_type, incident_date, incident_description, claim_amount, documents, status, source, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'submitted', 'api_v2', NOW(), NOW())`,
        [claimId, claimNumber, policy_id, policy[0].insurer_id, claim_type, incident_date, description, amount, JSON.stringify(documents || [])]
      );

      await apiService.sendWebhook(partnerId, 'claim.submitted', { claim_id: claimId, claim_number: claimNumber });

      res.status(201).json({ success: true, data: { claim_id: claimId, claim_number: claimNumber, status: 'submitted' } });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'CLAIM_FAILED', message: error.message } });
    }
  }
}
