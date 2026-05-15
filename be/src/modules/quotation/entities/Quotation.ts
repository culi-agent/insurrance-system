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

@Entity('quotation')
export class Quotation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, name: 'quote_number', unique: true })
  quoteNumber!: string;

  @Column({ type: 'uuid', name: 'customer_id', nullable: true })
  customerId?: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @Column({ type: 'uuid', name: 'insurer_id' })
  insurerId!: string;

  @Column({ type: 'varchar', length: 50, name: 'insurance_type' })
  insuranceType!: string; // 'motor', 'health', 'travel', etc.

  @Column({ type: 'jsonb', name: 'input_data' })
  inputData!: Record<string, any>; // Vehicle/person info submitted by user

  @Column({ type: 'jsonb', name: 'coverage_options' })
  coverageOptions!: Record<string, any>; // Selected coverage

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  premium!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'base_premium' })
  basePremium!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  discount?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  tax?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_premium' })
  totalPremium!: number;

  @Column({ type: 'jsonb', name: 'premium_breakdown', nullable: true })
  premiumBreakdown?: Record<string, any>;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: string; // 'pending', 'quoted', 'accepted', 'expired', 'rejected'

  @Column({ type: 'timestamptz', name: 'valid_until' })
  validUntil!: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
