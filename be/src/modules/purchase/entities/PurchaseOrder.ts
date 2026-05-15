import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('purchase_order')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'order_number', unique: true })
  orderNumber!: string;

  @Column({ name: 'customer_id' })
  customerId!: string;

  @Column({ name: 'quotation_id', nullable: true })
  quotationId?: string;

  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ name: 'insurer_id' })
  insurerId!: string;

  @Column({ name: 'insurance_type' })
  insuranceType!: string;

  @Column({ name: 'current_step', default: 1 })
  currentStep!: number;

  @Column({ name: 'total_steps', default: 5 })
  totalSteps!: number;

  @Column({ name: 'wizard_data', type: 'jsonb', default: '{}' })
  wizardData!: Record<string, any>;

  @Column({ name: 'applicant_info', type: 'jsonb', default: '{}' })
  applicantInfo!: Record<string, any>;

  @Column({ name: 'beneficiary_info', type: 'jsonb', default: '[]' })
  beneficiaryInfo!: Array<Record<string, any>>;

  @Column({ name: 'ekyc_status', default: 'pending' })
  ekycStatus!: string;

  @Column({ name: 'ekyc_data', type: 'jsonb', default: '{}' })
  ekycData!: Record<string, any>;

  @Column({ name: 'ekyc_verified_at', nullable: true })
  ekycVerifiedAt?: Date;

  @Column({ name: 'underwriting_status', default: 'pending' })
  underwritingStatus!: string;

  @Column({ name: 'underwriting_result', type: 'jsonb', default: '{}' })
  underwritingResult!: Record<string, any>;

  @Column({ name: 'underwriting_at', nullable: true })
  underwritingAt?: Date;

  @Column({ name: 'premium_amount', type: 'decimal', precision: 15, scale: 2 })
  premiumAmount!: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount!: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount!: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 })
  totalAmount!: number;

  @Column({ default: 'draft' })
  status!: string;

  @Column({ name: 'status_history', type: 'jsonb', default: '[]' })
  statusHistory!: Array<{ status: string; timestamp: string; note?: string }>;

  @Column({ name: 'submitted_at', nullable: true })
  submittedAt?: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt?: Date;

  @Column({ name: 'cancelled_at', nullable: true })
  cancelledAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

export type OrderStatus = 'draft' | 'pending_ekyc' | 'pending_underwriting' | 'pending_payment' | 'paid' | 'issued' | 'completed' | 'cancelled' | 'rejected';
export type EkycStatus = 'pending' | 'processing' | 'verified' | 'failed';
export type UnderwritingStatus = 'pending' | 'auto_approved' | 'referred' | 'declined';
