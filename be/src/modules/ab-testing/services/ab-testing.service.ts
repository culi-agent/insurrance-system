import { AppDataSource } from '../../../config/database';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  feature_key: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  variants: Variant[];
  traffic_percentage: number; // % of users included in experiment
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface Variant {
  id: string;
  name: string;
  weight: number; // percentage 0-100
  config: Record<string, any>;
  metrics?: {
    impressions: number;
    conversions: number;
    conversion_rate: number;
  };
}

export interface ExperimentAssignment {
  experiment_id: string;
  variant_id: string;
  variant_name: string;
  config: Record<string, any>;
}

export interface CreateExperimentInput {
  name: string;
  description: string;
  feature_key: string;
  traffic_percentage?: number;
  variants: Array<{
    name: string;
    weight: number;
    config: Record<string, any>;
  }>;
  start_date?: string;
  end_date?: string;
}

export interface TrackEventInput {
  experiment_id: string;
  variant_id: string;
  user_id: string;
  event_type: 'impression' | 'conversion' | 'click' | 'custom';
  event_name?: string;
  metadata?: Record<string, any>;
}

export class ABTestingService {
  /**
   * Create a new A/B test experiment
   */
  async createExperiment(input: CreateExperimentInput): Promise<Experiment> {
    // Validate variant weights sum to 100
    const totalWeight = input.variants.reduce((sum, v) => sum + v.weight, 0);
    if (totalWeight !== 100) {
      throw new ValidationError('Tổng weight các variant phải bằng 100%');
    }

    const id = uuidv4();
    const variants: Variant[] = input.variants.map(v => ({
      id: uuidv4(),
      name: v.name,
      weight: v.weight,
      config: v.config,
    }));

    await AppDataSource.query(
      `INSERT INTO ab_experiment (id, name, description, feature_key, status, variants, traffic_percentage, start_date, end_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'draft', $5, $6, $7, $8, NOW(), NOW())`,
      [
        id, input.name, input.description, input.feature_key,
        JSON.stringify(variants),
        input.traffic_percentage || 100,
        input.start_date || null,
        input.end_date || null,
      ]
    );

    logger.info(`[AB] Created experiment: ${input.name} (${input.feature_key})`);

    return {
      id,
      name: input.name,
      description: input.description,
      feature_key: input.feature_key,
      status: 'draft',
      variants,
      traffic_percentage: input.traffic_percentage || 100,
      start_date: input.start_date,
      end_date: input.end_date,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Get variant assignment for a user
   */
  async getAssignment(featureKey: string, userId: string): Promise<ExperimentAssignment | null> {
    // Find active experiment for this feature
    const experiments = await AppDataSource.query(
      `SELECT * FROM ab_experiment WHERE feature_key = $1 AND status = 'active'`,
      [featureKey]
    );

    if (experiments.length === 0) return null;
    const experiment = experiments[0];

    // Check if user is in traffic percentage
    const userHash = this.hashUser(userId, experiment.id);
    const userBucket = userHash % 100;

    if (userBucket >= experiment.traffic_percentage) {
      return null; // User not included in experiment
    }

    // Check if user already has an assignment
    const existing = await AppDataSource.query(
      `SELECT variant_id FROM ab_assignment WHERE experiment_id = $1 AND user_id = $2`,
      [experiment.id, userId]
    );

    const variants: Variant[] = experiment.variants;

    if (existing.length > 0) {
      const variant = variants.find(v => v.id === existing[0].variant_id);
      if (variant) {
        return {
          experiment_id: experiment.id,
          variant_id: variant.id,
          variant_name: variant.name,
          config: variant.config,
        };
      }
    }

    // Assign variant based on weights
    const assignedVariant = this.assignVariant(variants, userHash);

    // Save assignment
    await AppDataSource.query(
      `INSERT INTO ab_assignment (id, experiment_id, user_id, variant_id, assigned_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (experiment_id, user_id) DO NOTHING`,
      [uuidv4(), experiment.id, userId, assignedVariant.id]
    );

    return {
      experiment_id: experiment.id,
      variant_id: assignedVariant.id,
      variant_name: assignedVariant.name,
      config: assignedVariant.config,
    };
  }

  /**
   * Track an event for an experiment
   */
  async trackEvent(input: TrackEventInput): Promise<void> {
    await AppDataSource.query(
      `INSERT INTO ab_event (id, experiment_id, variant_id, user_id, event_type, event_name, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        uuidv4(), input.experiment_id, input.variant_id,
        input.user_id, input.event_type, input.event_name || null,
        JSON.stringify(input.metadata || {}),
      ]
    );
  }

  /**
   * Get experiment results/metrics
   */
  async getExperimentResults(experimentId: string) {
    const experiments = await AppDataSource.query(
      `SELECT * FROM ab_experiment WHERE id = $1`, [experimentId]
    );

    if (experiments.length === 0) throw new NotFoundError('Experiment không tìm thấy');
    const experiment = experiments[0];
    const variants: Variant[] = experiment.variants;

    // Get metrics per variant
    const metrics = await AppDataSource.query(`
      SELECT 
        variant_id,
        COUNT(*) FILTER (WHERE event_type = 'impression') as impressions,
        COUNT(*) FILTER (WHERE event_type = 'conversion') as conversions,
        COUNT(*) FILTER (WHERE event_type = 'click') as clicks,
        COUNT(DISTINCT user_id) as unique_users
      FROM ab_event
      WHERE experiment_id = $1
      GROUP BY variant_id
    `, [experimentId]);

    const variantsWithMetrics = variants.map(v => {
      const m = metrics.find((row: any) => row.variant_id === v.id);
      const impressions = parseInt(m?.impressions) || 0;
      const conversions = parseInt(m?.conversions) || 0;

      return {
        ...v,
        metrics: {
          impressions,
          conversions,
          clicks: parseInt(m?.clicks) || 0,
          unique_users: parseInt(m?.unique_users) || 0,
          conversion_rate: impressions > 0 ? (conversions / impressions) * 100 : 0,
        },
      };
    });

    // Determine winner (highest conversion rate with statistical significance)
    const sorted = [...variantsWithMetrics].sort(
      (a, b) => (b.metrics?.conversion_rate || 0) - (a.metrics?.conversion_rate || 0)
    );

    return {
      experiment: {
        id: experiment.id,
        name: experiment.name,
        feature_key: experiment.feature_key,
        status: experiment.status,
        traffic_percentage: experiment.traffic_percentage,
      },
      variants: variantsWithMetrics,
      winner: sorted[0]?.metrics?.conversions > 10 ? sorted[0] : null,
      total_participants: metrics.reduce((sum: number, m: any) => sum + parseInt(m.unique_users || 0), 0),
    };
  }

  /**
   * List all experiments
   */
  async listExperiments(status?: string) {
    let query = `SELECT * FROM ab_experiment`;
    const params: any[] = [];

    if (status) {
      query += ` WHERE status = $1`;
      params.push(status);
    }
    query += ` ORDER BY created_at DESC`;

    const experiments = await AppDataSource.query(query, params);

    return experiments.map((e: any) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      feature_key: e.feature_key,
      status: e.status,
      variants_count: (e.variants as Variant[]).length,
      traffic_percentage: e.traffic_percentage,
      start_date: e.start_date,
      end_date: e.end_date,
      created_at: e.created_at,
    }));
  }

  /**
   * Update experiment status
   */
  async updateStatus(experimentId: string, status: 'active' | 'paused' | 'completed'): Promise<void> {
    await AppDataSource.query(
      `UPDATE ab_experiment SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, experimentId]
    );
    logger.info(`[AB] Experiment ${experimentId} status changed to ${status}`);
  }

  private hashUser(userId: string, experimentId: string): number {
    const hash = crypto.createHash('md5').update(`${userId}:${experimentId}`).digest('hex');
    return parseInt(hash.slice(0, 8), 16);
  }

  private assignVariant(variants: Variant[], hash: number): Variant {
    const bucket = hash % 100;
    let cumulative = 0;

    for (const variant of variants) {
      cumulative += variant.weight;
      if (bucket < cumulative) return variant;
    }

    return variants[variants.length - 1]; // fallback
  }
}
