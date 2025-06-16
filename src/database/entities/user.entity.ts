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

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Viewer,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: true })
  @IsBoolean()
  isActive: boolean;

  @OneToMany(() => Document, (document) => document.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  documents: Document[];
}
