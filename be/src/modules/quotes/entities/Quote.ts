import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../auth/entities/Customer';
import { Product } from '../../products/entities/Product';
import { Insurer } from '../../products/entities/Insurer';

@Entity('quote')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'customer_id', nullable: true })
  customerId?: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @Column({ type: 'uuid', name: 'insurer_id' })
  insurerId!: string;

  @Column({ type: 'varchar', length: 30, name: 'quote_number', unique: true })
  quoteNumber!: string;

  @Column({ type: 'varchar', length: 30, name: 'product_type' })
  productType!: string; // motor, health, travel, life

  @Column({ type: 'jsonb', name: 'input_data' })
  inputData!: Record<string, any>;

  @Column({ type: 'jsonb', name: 'coverage_options', nullable: true })
  coverageOptions?: Record<string, any>;

  @Column({ type: 'bigint', name: 'premium_annual' })
  premiumAnnual!: number;

  @Column({ type: 'bigint', name: 'premium_monthly', nullable: true })
  premiumMonthly?: number;

  @Column({ type: 'bigint', name: 'sum_insured' })
  sumInsured!: number;

  @Column({ type: 'bigint', default: 0 })
  deductible!: number;

  @Column({ type: 'jsonb', name: 'benefits_summary', nullable: true })
  benefitsSummary?: Array<string>;

  @Column({ type: 'jsonb', name: 'exclusions_summary', nullable: true })
  exclusionsSummary?: Array<string>;

  @Column({ type: 'jsonb', name: 'pricing_breakdown', nullable: true })
  pricingBreakdown?: Record<string, any>;

  @Column({ type: 'timestamptz', name: 'valid_until' })
  validUntil!: Date;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string; // active, expired, converted

  @Column({ type: 'uuid', name: 'converted_policy_id', nullable: true })
  convertedPolicyId?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Customer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => Insurer)
  @JoinColumn({ name: 'insurer_id' })
  insurer!: Insurer;
}
