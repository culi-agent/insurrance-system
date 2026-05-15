import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('claim')
export class Claim {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'claim_number', unique: true })
  claimNumber!: string;

  @Column({ name: 'policy_id' })
  policyId!: string;

  @Column({ name: 'customer_id' })
  customerId!: string;

  @Column({ name: 'insurance_type' })
  insuranceType!: string;

  @Column({ name: 'claim_type' })
  claimType!: string;

  @Column({ name: 'incident_date', type: 'date' })
  incidentDate!: Date;

  @Column({ name: 'incident_description', type: 'text' })
  incidentDescription!: string;

  @Column({ name: 'claim_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  claimAmount?: number;

  @Column({ name: 'approved_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  approvedAmount?: number;

  @Column({ default: 'submitted' })
  status!: string;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo?: string;

  @Column({ default: 'normal' })
  priority!: string;

  @Column({ type: 'jsonb', default: '[]' })
  documents!: Array<{ id: string; name: string; url: string; type: string; uploaded_at: string }>;

  @Column({ type: 'jsonb', default: '[]' })
  messages!: Array<{ id: string; sender_type: string; sender_id: string; sender_name: string; message: string; timestamp: string }>;

  @Column({ type: 'jsonb', default: '{}' })
  assessment!: Record<string, any>;

  @Column({ name: 'decision_reason', nullable: true })
  decisionReason?: string;

  @Column({ name: 'decided_at', nullable: true })
  decidedAt?: Date;

  @Column({ name: 'decided_by', nullable: true })
  decidedBy?: string;

  @Column({ name: 'settlement_method', nullable: true })
  settlementMethod?: string;

  @Column({ name: 'settlement_account', type: 'jsonb', default: '{}' })
  settlementAccount!: Record<string, any>;

  @Column({ name: 'settled_at', nullable: true })
  settledAt?: Date;

  @Column({ name: 'submitted_at' })
  submittedAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

export type ClaimStatus = 'submitted' | 'under_review' | 'documents_requested' | 'approved' | 'rejected' | 'settled' | 'closed';
export type ClaimPriority = 'low' | 'normal' | 'high' | 'urgent';
