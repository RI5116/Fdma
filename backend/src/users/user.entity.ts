import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  VENDOR = 'vendor',
  DRIVER = 'driver',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role!: UserRole;

  @Column({ nullable: true })
  vendorId?: string; // For drivers

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  mustChangePassword!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  permissions?: Record<string, any>;

  @Column({ unique: true })
  registrationNumber!: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
