import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('policy')
export class Policy {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'policy_number', unique: true })
  policyNumber!: string;

  @Column({ name: 'order_id' })
  orderId!: string;

  @Column({ name: 'customer_id' })
  customerId!: string;

  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ name: 'insurer_id' })
  insurerId!: string;

  @Column({ name: 'insurance_type' })
  insuranceType!: string;

  @Column({ name: 'plan_name', nullable: true })
  planName?: string;

  @Column({ name: 'coverage_details', type: 'jsonb', default: '{}' })
  coverageDetails!: Record<string, any>;

  @Column({ name: 'insured_info', type: 'jsonb', default: '{}' })
  insuredInfo!: Record<string, any>;

  @Column({ name: 'beneficiary_info', type: 'jsonb', default: '[]' })
  beneficiaryInfo!: Array<Record<string, any>>;

  @Column({ name: 'premium_amount', type: 'decimal', precision: 15, scale: 2 })
  premiumAmount!: number;

  @Column({ name: 'payment_frequency', default: 'one_time' })
  paymentFrequency!: string;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate!: Date;

  @Column({ name: 'expiry_date', type: 'date' })
  expiryDate!: Date;

  @Column({ name: 'issued_date', type: 'date' })
  issuedDate!: Date;

  @Column({ name: 'policy_document_url', nullable: true })
  policyDocumentUrl?: string;

  @Column({ name: 'certificate_url', nullable: true })
  certificateUrl?: string;

  @Column({ default: 'active' })
  status!: string;

  @Column({ name: 'signature_status', default: 'pending' })
  signatureStatus!: string;

  @Column({ name: 'signed_at', nullable: true })
  signedAt?: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata!: Record<string, any>;

  @Column({ name: 'renewed_from_id', nullable: true })
  renewedFromId?: string;

  @Column({ name: 'cancelled_at', nullable: true })
  cancelledAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

export type PolicyStatus = 'active' | 'expired' | 'cancelled' | 'suspended' | 'pending';
