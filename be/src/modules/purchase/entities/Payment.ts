import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'payment_number', unique: true })
  paymentNumber!: string;

  @Column({ name: 'order_id' })
  orderId!: string;

  @Column({ name: 'customer_id' })
  customerId!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @Column({ default: 'VND' })
  currency!: string;

  @Column({ name: 'payment_method' })
  paymentMethod!: string;

  @Column({ name: 'payment_gateway' })
  paymentGateway!: string;

  @Column({ name: 'gateway_transaction_id', nullable: true })
  gatewayTransactionId?: string;

  @Column({ name: 'gateway_response', type: 'jsonb', default: '{}' })
  gatewayResponse!: Record<string, any>;

  @Column({ name: 'gateway_url', nullable: true })
  gatewayUrl?: string;

  @Column({ default: 'pending' })
  status!: string;

  @Column({ name: 'paid_at', nullable: true })
  paidAt?: Date;

  @Column({ name: 'failed_at', nullable: true })
  failedAt?: Date;

  @Column({ name: 'refunded_at', nullable: true })
  refundedAt?: Date;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  refundAmount?: number;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata!: Record<string, any>;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'vnpay' | 'momo' | 'bank_transfer' | 'credit_card';
export type PaymentGateway = 'vnpay' | 'momo' | 'zalopay';
