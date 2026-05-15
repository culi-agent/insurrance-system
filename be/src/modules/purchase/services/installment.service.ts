import { AppDataSource } from '../../../config/database';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface InstallmentPlan {
  id: string;
  policy_id: string;
  total_amount: number;
  frequency: 'monthly' | 'quarterly' | 'semi_annual';
  total_installments: number;
  paid_installments: number;
  next_payment_date: string;
  next_payment_amount: number;
  status: string;
  installments: InstallmentDetail[];
}

export interface InstallmentDetail {
  number: number;
  due_date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'upcoming';
  paid_at?: string;
  transaction_ref?: string;
}

export interface CreateInstallmentInput {
  policy_id: string;
  frequency: 'monthly' | 'quarterly' | 'semi_annual';
  payment_method?: string;
}

export class InstallmentService {
  /**
   * Create installment plan for a policy
   */
  async createInstallmentPlan(customerId: string, input: CreateInstallmentInput): Promise<InstallmentPlan> {
    // Get policy
    const policies = await AppDataSource.query(
      `SELECT * FROM policy WHERE id = $1 AND customer_id = $2`, [input.policy_id, customerId]
    );

    if (policies.length === 0) throw new NotFoundError('Hợp đồng không tìm thấy');
    const policy = policies[0];

    if (policy.payment_frequency !== 'one_time' && policy.payment_frequency !== 'annual') {
      throw new ValidationError('Hợp đồng đã có lịch trả góp');
    }

    const annualPremium = parseFloat(policy.premium_amount);
    const { totalInstallments, installmentAmount, modalFactor } = this.calculateInstallments(
      annualPremium, input.frequency
    );

    // Generate installment schedule
    const startDate = new Date();
    const installments: InstallmentDetail[] = [];

    for (let i = 1; i <= totalInstallments; i++) {
      const dueDate = new Date(startDate);
      switch (input.frequency) {
        case 'monthly': dueDate.setMonth(dueDate.getMonth() + i); break;
        case 'quarterly': dueDate.setMonth(dueDate.getMonth() + i * 3); break;
        case 'semi_annual': dueDate.setMonth(dueDate.getMonth() + i * 6); break;
      }

      installments.push({
        number: i,
        due_date: dueDate.toISOString().split('T')[0],
        amount: installmentAmount,
        status: i === 1 ? 'pending' : 'upcoming',
      });
    }

    // Save installment plan
    const planId = uuidv4();
    await AppDataSource.query(
      `INSERT INTO installment_plan (id, policy_id, customer_id, total_amount, frequency, total_installments, paid_installments, next_payment_date, next_payment_amount, modal_factor, installments, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', NOW(), NOW())`,
      [
        planId, input.policy_id, customerId,
        annualPremium * modalFactor, input.frequency,
        totalInstallments, 0,
        installments[0].due_date, installmentAmount, modalFactor,
        JSON.stringify(installments),
      ]
    );

    // Update policy payment frequency
    await AppDataSource.query(
      `UPDATE policy SET payment_frequency = $1, updated_at = NOW() WHERE id = $2`,
      [input.frequency, input.policy_id]
    );

    logger.info(`[Installment] Created plan ${planId} for policy ${input.policy_id}, ${totalInstallments} ${input.frequency} payments`);

    return {
      id: planId,
      policy_id: input.policy_id,
      total_amount: annualPremium * modalFactor,
      frequency: input.frequency,
      total_installments: totalInstallments,
      paid_installments: 0,
      next_payment_date: installments[0].due_date,
      next_payment_amount: installmentAmount,
      status: 'active',
      installments,
    };
  }

  /**
   * Get installment plan for a policy
   */
  async getInstallmentPlan(policyId: string, customerId: string): Promise<InstallmentPlan | null> {
    const plans = await AppDataSource.query(
      `SELECT * FROM installment_plan WHERE policy_id = $1 AND customer_id = $2 AND status = 'active'`,
      [policyId, customerId]
    );

    if (plans.length === 0) return null;

    const plan = plans[0];
    return {
      id: plan.id,
      policy_id: plan.policy_id,
      total_amount: parseFloat(plan.total_amount),
      frequency: plan.frequency,
      total_installments: plan.total_installments,
      paid_installments: plan.paid_installments,
      next_payment_date: plan.next_payment_date,
      next_payment_amount: parseFloat(plan.next_payment_amount),
      status: plan.status,
      installments: plan.installments,
    };
  }

  /**
   * Record installment payment
   */
  async recordPayment(planId: string, customerId: string, transactionRef: string): Promise<{ success: boolean; next_payment?: InstallmentDetail }> {
    const plans = await AppDataSource.query(
      `SELECT * FROM installment_plan WHERE id = $1 AND customer_id = $2`,
      [planId, customerId]
    );

    if (plans.length === 0) throw new NotFoundError('Kế hoạch trả góp không tìm thấy');

    const plan = plans[0];
    const installments: InstallmentDetail[] = plan.installments;

    // Find next pending installment
    const nextPending = installments.find(i => i.status === 'pending');
    if (!nextPending) throw new ValidationError('Không có kỳ thanh toán nào đang chờ');

    // Mark as paid
    nextPending.status = 'paid';
    nextPending.paid_at = new Date().toISOString();
    nextPending.transaction_ref = transactionRef;

    // Update next installment to pending
    const nextUpcoming = installments.find(i => i.status === 'upcoming');
    if (nextUpcoming) nextUpcoming.status = 'pending';

    const paidCount = plan.paid_installments + 1;
    const nextPaymentDate = nextUpcoming?.due_date || null;
    const nextPaymentAmount = nextUpcoming?.amount || 0;

    await AppDataSource.query(
      `UPDATE installment_plan SET 
        installments = $1, paid_installments = $2, 
        next_payment_date = $3, next_payment_amount = $4,
        status = $5, updated_at = NOW()
       WHERE id = $6`,
      [
        JSON.stringify(installments), paidCount,
        nextPaymentDate, nextPaymentAmount,
        paidCount >= plan.total_installments ? 'completed' : 'active',
        planId,
      ]
    );

    logger.info(`[Installment] Payment recorded for plan ${planId}, installment ${nextPending.number}`);

    return {
      success: true,
      next_payment: nextUpcoming || undefined,
    };
  }

  private calculateInstallments(annualPremium: number, frequency: 'monthly' | 'quarterly' | 'semi_annual') {
    let totalInstallments: number;
    let modalFactor: number;

    switch (frequency) {
      case 'monthly':
        totalInstallments = 12;
        modalFactor = 1.05; // 5% surcharge
        break;
      case 'quarterly':
        totalInstallments = 4;
        modalFactor = 1.03; // 3% surcharge
        break;
      case 'semi_annual':
        totalInstallments = 2;
        modalFactor = 1.02; // 2% surcharge
        break;
    }

    const totalAmount = annualPremium * modalFactor;
    const installmentAmount = Math.round(totalAmount / totalInstallments);

    return { totalInstallments, installmentAmount, modalFactor };
  }
}
