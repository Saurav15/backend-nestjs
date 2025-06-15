import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import * as bcrypt from 'bcrypt';
import {
  IsEnum,
  IsEmail,
  IsString,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { UserRole } from 'src/common/enums';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User extends BaseEntity {
  @Index('idx_user_email')
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Exclude()
  @Column()
  @IsString()
  @MinLength(8)
  password: string;

  @Column({ name: 'full_name' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.Viewer })
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: true })
  @IsBoolean()
  isActive: boolean;
}
