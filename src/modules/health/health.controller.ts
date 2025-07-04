/**
 * Controller for health and readiness endpoints.
 * Provides system, database, and memory health checks for monitoring and orchestration.
 */
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Health')
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  /**
   * Returns system health status, including database and memory checks.
   * @returns Health check result
   */
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check system health' })
  @ApiResponse({
    status: 200,
    description: 'Health check response',
  })
  async check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
    ]);
  }

  /**
   * Returns application readiness status for orchestration probes.
   * @returns Readiness status and timestamp
   */
  @Get('ready')
  @ApiOperation({ summary: 'Check application readiness' })
  @ApiResponse({
    status: 200,
    description: 'Application is ready to serve traffic',
  })
  async readiness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
