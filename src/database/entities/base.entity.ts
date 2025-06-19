/**
 * Abstract base entity with common fields for all entities.
 * Includes UUID primary key, created/updated/deleted timestamps.
 */
import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export abstract class BaseEntity {
  /** UUID primary key */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Timestamp when the entity was created */
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  /** Timestamp when the entity was last updated */
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  /** Timestamp when the entity was soft-deleted (nullable) */
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt: Date | null;
}
