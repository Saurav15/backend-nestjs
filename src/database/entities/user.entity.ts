/**
 * Entity representing an application user.
 * Includes email, password, full name, role, and related documents.
 */
import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import {
  IsEnum,
  IsEmail,
  IsString,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { UserRole } from '../../common/enums';
import { Exclude } from 'class-transformer';
import { Document } from './document.entity';

@Entity('users')
export class User extends BaseEntity {
  /** Unique email address (indexed) */
  @Index('idx_user_email')
  @Column({ unique: true })
  @IsEmail()
  email: string;

  /** Hashed password (excluded from serialization) */
  @Exclude()
  @Column()
  @IsString()
  @MinLength(8)
  password: string;

  /** Full name of the user */
  @Column({ name: 'full_name' })
  @IsString()
  @MinLength(2)
  fullName: string;

  /** User role (admin, editor, viewer) */
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Viewer,
  })
  @IsEnum(UserRole)
  role: UserRole;

  /** Whether the user is active */
  @Column({ default: true })
  @IsBoolean()
  isActive: boolean;

  /** Documents uploaded by the user */
  @OneToMany(() => Document, (document) => document.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  documents: Document[];
}
