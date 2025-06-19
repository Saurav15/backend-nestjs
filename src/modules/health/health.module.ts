/**
 * HealthModule provides endpoints for health and readiness checks.
 *
 * Dependencies:
 * - TerminusModule: Supplies health indicators and utilities for system and database checks.
 */
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
