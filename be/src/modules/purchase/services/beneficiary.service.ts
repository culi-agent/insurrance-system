import { AppDataSource } from '../../../config/database';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { logger } from '../../../shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface Beneficiary {
  id: string;
  full_name: string;
  relationship: string;
  id_number: string;
  date_of_birth?: string;
  phone?: string;
  email?: string;
  percentage: number;
  type: 'primary' | 'contingent';
}

export interface BeneficiaryInput {
  full_name: string;
  relationship: string;
  id_number: string;
  date_of_birth?: string;
  phone?: string;
  email?: string;
  percentage: number;
  type: 'primary' | 'contingent';
}

export class BeneficiaryService {
  /**
   * Set beneficiaries for a policy
   */
  async setBeneficiaries(policyId: string, customerId: string, beneficiaries: BeneficiaryInput[]): Promise<Beneficiary[]> {
    // Validate policy ownership
    const policies = await AppDataSource.query(
      `SELECT * FROM policy WHERE id = $1 AND customer_id = $2`, [policyId, customerId]
    );
    if (policies.length === 0) throw new NotFoundError('Hợp đồng không tìm thấy');

    // Validate percentages
    const primaryTotal = beneficiaries
      .filter(b => b.type === 'primary')
      .reduce((sum, b) => sum + b.percentage, 0);

    const contingentTotal = beneficiaries
      .filter(b => b.type === 'contingent')
      .reduce((sum, b) => sum + b.percentage, 0);

    if (primaryTotal !== 100) {
      throw new ValidationError('Tổng tỷ lệ người thụ hưởng chính phải bằng 100%');
    }

    if (beneficiaries.some(b => b.type === 'contingent') && contingentTotal !== 100) {
      throw new ValidationError('Tổng tỷ lệ người thụ hưởng dự phòng phải bằng 100%');
    }

    // Generate IDs
    const enrichedBeneficiaries: Beneficiary[] = beneficiaries.map(b => ({
      id: uuidv4(),
      ...b,
    }));

    // Update policy beneficiary_info
    await AppDataSource.query(
      `UPDATE policy SET beneficiary_info = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(enrichedBeneficiaries), policyId]
    );

    logger.info(`[Beneficiary] Set ${beneficiaries.length} beneficiaries for policy ${policyId}`);

    return enrichedBeneficiaries;
  }

  /**
   * Get beneficiaries for a policy
   */
  async getBeneficiaries(policyId: string, customerId: string): Promise<Beneficiary[]> {
    const policies = await AppDataSource.query(
      `SELECT beneficiary_info FROM policy WHERE id = $1 AND customer_id = $2`,
      [policyId, customerId]
    );

    if (policies.length === 0) throw new NotFoundError('Hợp đồng không tìm thấy');

    return policies[0].beneficiary_info || [];
  }

  /**
   * Update a specific beneficiary
   */
  async updateBeneficiary(policyId: string, customerId: string, beneficiaryId: string, input: Partial<BeneficiaryInput>): Promise<Beneficiary[]> {
    const policies = await AppDataSource.query(
      `SELECT beneficiary_info FROM policy WHERE id = $1 AND customer_id = $2`,
      [policyId, customerId]
    );

    if (policies.length === 0) throw new NotFoundError('Hợp đồng không tìm thấy');

    const beneficiaries: Beneficiary[] = policies[0].beneficiary_info || [];
    const index = beneficiaries.findIndex(b => b.id === beneficiaryId);

    if (index === -1) throw new NotFoundError('Người thụ hưởng không tìm thấy');

    beneficiaries[index] = { ...beneficiaries[index], ...input };

    // Re-validate percentages
    const primaryTotal = beneficiaries
      .filter(b => b.type === 'primary')
      .reduce((sum, b) => sum + b.percentage, 0);

    if (primaryTotal !== 100) {
      throw new ValidationError('Tổng tỷ lệ người thụ hưởng chính phải bằng 100%');
    }

    await AppDataSource.query(
      `UPDATE policy SET beneficiary_info = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(beneficiaries), policyId]
    );

    return beneficiaries;
  }

  /**
   * Remove a beneficiary
   */
  async removeBeneficiary(policyId: string, customerId: string, beneficiaryId: string): Promise<Beneficiary[]> {
    const policies = await AppDataSource.query(
      `SELECT beneficiary_info FROM policy WHERE id = $1 AND customer_id = $2`,
      [policyId, customerId]
    );

    if (policies.length === 0) throw new NotFoundError('Hợp đồng không tìm thấy');

    let beneficiaries: Beneficiary[] = policies[0].beneficiary_info || [];
    beneficiaries = beneficiaries.filter(b => b.id !== beneficiaryId);

    await AppDataSource.query(
      `UPDATE policy SET beneficiary_info = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(beneficiaries), policyId]
    );

    return beneficiaries;
  }
}
