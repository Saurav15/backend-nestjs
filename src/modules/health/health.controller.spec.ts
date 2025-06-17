import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  HealthCheckStatus,
  HealthIndicatorStatus,
} from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;
  let typeOrmHealthIndicator: jest.Mocked<TypeOrmHealthIndicator>;
  let memoryHealthIndicator: jest.Mocked<MemoryHealthIndicator>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn(),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest.fn(),
          },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get(
      HealthCheckService,
    ) as jest.Mocked<HealthCheckService>;
    typeOrmHealthIndicator = module.get(
      TypeOrmHealthIndicator,
    ) as jest.Mocked<TypeOrmHealthIndicator>;
    memoryHealthIndicator = module.get(
      MemoryHealthIndicator,
    ) as jest.Mocked<MemoryHealthIndicator>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health check result', async () => {
      const mockResult = {
        status: 'up',
        info: {
          database: { status: 'up' },
          memory_heap: { status: 'up' },
        },
        details: {
          database: { status: 'up' },
          memory_heap: { status: 'up' },
        },
      };
      // @ts-ignore
      healthCheckService.check.mockResolvedValue(mockResult);

      const result = await controller.check();
      expect(healthCheckService.check).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should throw error if health check fails', async () => {
      healthCheckService.check.mockRejectedValue(
        new Error('Health check failed'),
      );
      await expect(controller.check()).rejects.toThrow('Health check failed');
    });
  });

  describe('readiness', () => {
    it('should return readiness status', async () => {
      const result = await controller.readiness();
      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
      });
    });
  });
});
