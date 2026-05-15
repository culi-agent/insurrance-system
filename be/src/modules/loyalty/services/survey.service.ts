import { AppDataSource } from '../../../config/database';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface Survey {
  id: string;
  type: 'nps' | 'csat' | 'ces' | 'custom';
  title: string;
  questions: SurveyQuestion[];
  trigger_event: string;
  status: string;
  created_at: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'rating' | 'scale' | 'text' | 'multiple_choice';
  options?: string[];
  required: boolean;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  customer_id: string;
  answers: Array<{ question_id: string; value: any }>;
  nps_score?: number;
  csat_score?: number;
  feedback?: string;
  created_at: string;
}

export class SurveyService {
  /**
   * Create survey
   */
  async createSurvey(input: Partial<Survey>): Promise<Survey> {
    const id = uuidv4();
    await AppDataSource.query(
      `INSERT INTO survey (id, type, title, questions, trigger_event, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'active', NOW(), NOW())`,
      [id, input.type, input.title, JSON.stringify(input.questions), input.trigger_event]
    );
    return { ...input, id, status: 'active', created_at: new Date().toISOString() } as Survey;
  }

  /**
   * Submit survey response
   */
  async submitResponse(surveyId: string, customerId: string, answers: Array<{ question_id: string; value: any }>, feedback?: string): Promise<SurveyResponse> {
    const id = uuidv4();

    // Calculate NPS/CSAT from answers
    let npsScore: number | undefined;
    let csatScore: number | undefined;

    const survey = await AppDataSource.query(`SELECT type, questions FROM survey WHERE id = $1`, [surveyId]);
    if (survey.length > 0) {
      if (survey[0].type === 'nps') {
        const ratingAnswer = answers.find(a => typeof a.value === 'number');
        npsScore = ratingAnswer?.value;
      } else if (survey[0].type === 'csat') {
        const ratingAnswer = answers.find(a => typeof a.value === 'number');
        csatScore = ratingAnswer?.value;
      }
    }

    await AppDataSource.query(
      `INSERT INTO survey_response (id, survey_id, customer_id, answers, nps_score, csat_score, feedback, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [id, surveyId, customerId, JSON.stringify(answers), npsScore || null, csatScore || null, feedback || null]
    );

    logger.info(`[Survey] Response: survey=${surveyId}, customer=${customerId}, nps=${npsScore}, csat=${csatScore}`);

    return { id, survey_id: surveyId, customer_id: customerId, answers, nps_score: npsScore, csat_score: csatScore, feedback, created_at: new Date().toISOString() };
  }

  /**
   * Get survey for trigger event
   */
  async getSurveyForEvent(event: string): Promise<Survey | null> {
    const surveys = await AppDataSource.query(
      `SELECT * FROM survey WHERE trigger_event = $1 AND status = 'active' LIMIT 1`, [event]
    );
    return surveys.length > 0 ? surveys[0] : null;
  }

  /**
   * Get NPS analytics
   */
  async getNPSAnalytics(period: 'week' | 'month' | 'quarter' = 'month'): Promise<any> {
    const intervals: Record<string, string> = { week: '7 days', month: '30 days', quarter: '90 days' };
    const interval = intervals[period];

    const responses = await AppDataSource.query(`
      SELECT nps_score FROM survey_response
      WHERE nps_score IS NOT NULL AND created_at > NOW() - INTERVAL '${interval}'
    `);

    if (responses.length === 0) return { nps: 0, promoters: 0, passives: 0, detractors: 0, total: 0 };

    let promoters = 0, passives = 0, detractors = 0;
    for (const r of responses) {
      if (r.nps_score >= 9) promoters++;
      else if (r.nps_score >= 7) passives++;
      else detractors++;
    }

    const total = responses.length;
    const nps = Math.round(((promoters - detractors) / total) * 100);

    return {
      nps,
      promoters: Math.round((promoters / total) * 100),
      passives: Math.round((passives / total) * 100),
      detractors: Math.round((detractors / total) * 100),
      total_responses: total,
      period,
    };
  }

  /**
   * Get CSAT analytics
   */
  async getCSATAnalytics(period: 'week' | 'month' | 'quarter' = 'month'): Promise<any> {
    const intervals: Record<string, string> = { week: '7 days', month: '30 days', quarter: '90 days' };
    const interval = intervals[period];

    const result = await AppDataSource.query(`
      SELECT 
        COUNT(*) as total,
        COALESCE(AVG(csat_score), 0) as avg_score,
        COUNT(CASE WHEN csat_score >= 4 THEN 1 END) as satisfied
      FROM survey_response
      WHERE csat_score IS NOT NULL AND created_at > NOW() - INTERVAL '${interval}'
    `);

    const r = result[0];
    const total = parseInt(r.total) || 0;
    return {
      avg_score: Math.round(parseFloat(r.avg_score) * 10) / 10,
      satisfaction_rate: total > 0 ? Math.round((parseInt(r.satisfied) / total) * 100) : 0,
      total_responses: total,
      period,
    };
  }
}
