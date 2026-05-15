import { Request, Response } from 'express';
import { SurveyService } from '../services/survey.service';

const service = new SurveyService();

export class SurveyController {
  async createSurvey(req: Request, res: Response) {
    try {
      const result = await service.createSurvey(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: error.message } });
    }
  }

  async submitResponse(req: Request, res: Response) {
    try {
      const customerId = (req as any).user?.id;
      const { survey_id, answers, feedback } = req.body;
      const result = await service.submitResponse(survey_id, customerId, answers, feedback);
      res.status(201).json({ success: true, data: result, message: 'Cảm ơn bạn đã phản hồi!' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'SUBMIT_FAILED', message: error.message } });
    }
  }

  async getSurveyForEvent(req: Request, res: Response) {
    try {
      const survey = await service.getSurveyForEvent(req.params.event);
      if (!survey) return res.json({ success: true, data: null });
      res.json({ success: true, data: survey });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
    }
  }

  async getNPSAnalytics(req: Request, res: Response) {
    try {
      const period = (req.query.period as 'week' | 'month' | 'quarter') || 'month';
      const result = await service.getNPSAnalytics(period);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'NPS_ERROR', message: error.message } });
    }
  }

  async getCSATAnalytics(req: Request, res: Response) {
    try {
      const period = (req.query.period as 'week' | 'month' | 'quarter') || 'month';
      const result = await service.getCSATAnalytics(period);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'CSAT_ERROR', message: error.message } });
    }
  }
}
