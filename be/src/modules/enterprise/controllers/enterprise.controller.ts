import { Request, Response } from 'express';
import { EnterpriseService } from '../services/enterprise.service';

const enterpriseService = new EnterpriseService();

export class EnterpriseController {
  /**
   * POST /api/v1/enterprise/register
   */
  async register(req: Request, res: Response) {
    try {
      const result = await enterpriseService.register(req.body);
      res.status(201).json({ success: true, data: result, message: 'Đăng ký tài khoản doanh nghiệp thành công. Vui lòng chờ xác minh.' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'REGISTRATION_FAILED', message: error.message } });
    }
  }

  /**
   * GET /api/v1/enterprise/dashboard
   */
  async getDashboard(req: Request, res: Response) {
    try {
      const enterpriseId = (req as any).user.enterprise_id;
      const result = await enterpriseService.getDashboard(enterpriseId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'DASHBOARD_ERROR', message: error.message } });
    }
  }

  /**
   * POST /api/v1/enterprise/employees
   */
  async addEmployees(req: Request, res: Response) {
    try {
      const enterpriseId = (req as any).user.enterprise_id;
      const { employees } = req.body;
      const result = await enterpriseService.addEmployees(enterpriseId, employees);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'ADD_EMPLOYEES_FAILED', message: error.message } });
    }
  }

  /**
   * POST /api/v1/enterprise/employees/import
   */
  async importEmployees(req: Request, res: Response) {
    try {
      const enterpriseId = (req as any).user.enterprise_id;
      const { csv_data } = req.body;
      const result = await enterpriseService.importEmployeesCSV(enterpriseId, csv_data);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'IMPORT_FAILED', message: error.message } });
    }
  }

  /**
   * GET /api/v1/enterprise/employees
   */
  async listEmployees(req: Request, res: Response) {
    try {
      const enterpriseId = (req as any).user.enterprise_id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const department = req.query.department as string;
      const status = req.query.status as string;
      const result = await enterpriseService.listEmployees(enterpriseId, page, limit, department, status);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'LIST_FAILED', message: error.message } });
    }
  }

  /**
   * DELETE /api/v1/enterprise/employees/:employeeId
   */
  async removeEmployee(req: Request, res: Response) {
    try {
      const enterpriseId = (req as any).user.enterprise_id;
      await enterpriseService.removeEmployee(enterpriseId, req.params.employeeId);
      res.json({ success: true, message: 'Đã xóa nhân viên khỏi danh sách' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'REMOVE_FAILED', message: error.message } });
    }
  }

  /**
   * POST /api/v1/enterprise/group-quote
   */
  async getGroupQuote(req: Request, res: Response) {
    try {
      const enterpriseId = (req as any).user.enterprise_id;
      const result = await enterpriseService.getGroupQuote({ ...req.body, enterprise_id: enterpriseId });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'QUOTE_FAILED', message: error.message } });
    }
  }

  /**
   * POST /api/v1/enterprise/group-purchase
   */
  async purchaseGroupInsurance(req: Request, res: Response) {
    try {
      const enterpriseId = (req as any).user.enterprise_id;
      const { quote_id, payment_method } = req.body;
      const result = await enterpriseService.purchaseGroupInsurance(enterpriseId, quote_id, payment_method);
      res.status(201).json({ success: true, data: result, message: 'Mua bảo hiểm nhóm thành công' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'PURCHASE_FAILED', message: error.message } });
    }
  }

  /**
   * GET /api/v1/enterprise/billing
   */
  async getBilling(req: Request, res: Response) {
    try {
      const enterpriseId = (req as any).user.enterprise_id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await enterpriseService.getBilling(enterpriseId, page, limit);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'BILLING_ERROR', message: error.message } });
    }
  }

  /**
   * POST /api/v1/enterprise/billing/invoice
   */
  async generateInvoice(req: Request, res: Response) {
    try {
      const enterpriseId = (req as any).user.enterprise_id;
      const { order_id } = req.body;
      const result = await enterpriseService.generateInvoice(enterpriseId, order_id);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'INVOICE_FAILED', message: error.message } });
    }
  }
}
