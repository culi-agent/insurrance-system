import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../auth/entities/Customer';
import { Product } from '../../products/entities/Product';
import { Insurer } from '../../products/entities/Insurer';
import { Beneficiary } from './Beneficiary';

@Entity('policy')
export class Policy {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 30, name: 'policy_number', unique: true })
  policyNumber!: string;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId!: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @Column({ type: 'uuid', name: 'insurer_id' })
  insurerId!: string;

  @Column({ type: 'uuid', name: 'quote_id', nullable: true })
  quoteId?: string;

  @Column({ type: 'varchar', length: 30, name: 'product_type' })
  productType!: string; // motor, health, travel, life

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status!: string; // pending, active, expired, cancelled, lapsed, renewed

  @Column({ type: 'jsonb', name: 'insured_info' })
  insuredInfo!: Record<string, any>;

  @Column({ type: 'jsonb', name: 'coverage_details' })
  coverageDetails!: Record<string, any>;

  @Column({ type: 'bigint', name: 'premium_annual' })
  premiumAnnual!: number;

  @Column({ type: 'bigint', name: 'premium_monthly', nullable: true })
  premiumMonthly?: number;

  @Column({ type: 'varchar', length: 20, name: 'payment_frequency', default: 'annual' })
  paymentFrequency!: string; // annual, semi_annual, quarterly, monthly

  @Column({ type: 'bigint', name: 'sum_insured' })
  sumInsured!: number;

  @Column({ type: 'bigint', default: 0 })
  deductible!: number;

  @Column({ type: 'date', name: 'start_date' })
  startDate!: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate!: Date;

  @Column({ type: 'timestamptz', name: 'activated_at', nullable: true })
  activatedAt?: Date;

  @Column({ type: 'timestamptz', name: 'cancelled_at', nullable: true })
  cancelledAt?: Date;

  @Column({ type: 'varchar', length: 255, name: 'cancellation_reason', nullable: true })
  cancellationReason?: string;

  @Column({ type: 'varchar', length: 500, name: 'document_url', nullable: true })
  documentUrl?: string;

  @Column({ type: 'varchar', length: 500, name: 'certificate_url', nullable: true })
  certificateUrl?: string;

  @Column({ type: 'uuid', name: 'payment_id', nullable: true })
  paymentId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => Insurer)
  @JoinColumn({ name: 'insurer_id' })
  insurer!: Insurer;

  @OneToMany(() => Beneficiary, (b) => b.policy)
  beneficiaries!: Beneficiary[];
}
