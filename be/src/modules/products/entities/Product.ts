import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './Category';
import { Insurer } from './Insurer';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  slug!: string;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId!: string;

  @Column({ type: 'uuid', name: 'insurer_id' })
  insurerId!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 500, name: 'short_description', nullable: true })
  shortDescription?: string;

  @Column({ type: 'jsonb', nullable: true })
  benefits?: Array<{
    name: string;
    description: string;
    coverageAmount: number;
    unit: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  exclusions?: Array<{
    name: string;
    description: string;
  }>;

  @Column({ type: 'jsonb', name: 'pricing_rules', nullable: true })
  pricingRules?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  eligibility?: Record<string, any>;

  @Column({ type: 'varchar', length: 500, name: 'terms_url', nullable: true })
  termsUrl?: string;

  @Column({ type: 'varchar', length: 500, name: 'brochure_url', nullable: true })
  brochureUrl?: string;

  @Column({ type: 'int', name: 'min_age', default: 0 })
  minAge!: number;

  @Column({ type: 'int', name: 'max_age', default: 100 })
  maxAge!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'min_premium', default: 0 })
  minPremium!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'max_premium', nullable: true })
  maxPremium?: number;

  @Column({ type: 'float', default: 0 })
  rating!: number;

  @Column({ type: 'int', name: 'review_count', default: 0 })
  reviewCount!: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'boolean', name: 'is_featured', default: false })
  isFeatured!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @ManyToOne(() => Insurer, (insurer) => insurer.products)
  @JoinColumn({ name: 'insurer_id' })
  insurer!: Insurer;
}
