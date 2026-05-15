import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Policy } from './Policy';

@Entity('beneficiary')
export class Beneficiary {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'policy_id' })
  policyId!: string;

  @Column({ type: 'varchar', length: 100, name: 'full_name' })
  fullName!: string;

  @Column({ type: 'varchar', length: 30 })
  relationship!: string; // spouse, child, parent, sibling, other

  @Column({ type: 'date', name: 'date_of_birth', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender?: string;

  @Column({ type: 'varchar', length: 20, name: 'id_number', nullable: true })
  idNumber?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage!: number; // Percentage of benefit (all must sum to 100)

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Policy, (policy) => policy.beneficiaries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'policy_id' })
  policy!: Policy;
}
