import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { CustomerSocialAccount } from './CustomerSocialAccount';
import { Session } from './Session';

@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone!: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 100, name: 'full_name' })
  fullName!: string;

  @Column({ type: 'date', name: 'date_of_birth', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender?: string;

  @Column({ type: 'varchar', length: 20, name: 'id_number', nullable: true })
  idNumber?: string;

  @Column({ type: 'varchar', length: 20, name: 'id_number_type', default: 'cccd' })
  idNumberType!: string;

  @Column({ type: 'jsonb', nullable: true })
  address?: Record<string, any>;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'kyc_status',
    default: 'pending',
  })
  kycStatus!: string;

  @Column({ type: 'jsonb', name: 'kyc_data', nullable: true })
  kycData?: Record<string, any>;

  @Column({ type: 'varchar', length: 500, name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column({ type: 'varchar', length: 5, default: 'vi' })
  language!: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string;

  @Column({ type: 'varchar', length: 20, default: 'customer' })
  role!: string;

  @Column({ type: 'boolean', name: 'email_verified', default: false })
  emailVerified!: boolean;

  @Column({ type: 'boolean', name: 'phone_verified', default: false })
  phoneVerified!: boolean;

  @Column({ type: 'timestamptz', name: 'last_login_at', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'int', name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts!: number;

  @Column({ type: 'timestamptz', name: 'locked_until', nullable: true })
  lockedUntil?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt?: Date;

  @OneToMany(() => CustomerSocialAccount, (social) => social.customer)
  socialAccounts!: CustomerSocialAccount[];

  @OneToMany(() => Session, (session) => session.customer)
  sessions!: Session[];
}
