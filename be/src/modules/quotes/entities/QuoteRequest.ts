import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Customer } from '../../auth/entities/Customer';
import { Quote } from './Quote';

@Entity('quote_request')
export class QuoteRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'customer_id', nullable: true })
  customerId?: string;

  @Column({ type: 'varchar', length: 30, name: 'product_type' })
  productType!: string; // motor, health, travel, life

  @Column({ type: 'jsonb', name: 'input_data' })
  inputData!: Record<string, any>;

  @Column({ type: 'varchar', length: 45, name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ type: 'int', name: 'quotes_count', default: 0 })
  quotesCount!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Customer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;
}
