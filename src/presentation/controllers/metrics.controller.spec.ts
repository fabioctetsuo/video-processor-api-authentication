import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { NodejsPrometheusService } from '../../infrastructure/metrics/nodejs-prometheus.service';
import { Response } from 'express';

describe('MetricsController', () => {
  let controller: MetricsController;
  let prometheusService: jest.Mocked<NodejsPrometheusService>;

  beforeEach(async () => {
    const mockPrometheusService = {
      getMetrics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        { provide: NodejsPrometheusService, useValue: mockPrometheusService },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
    prometheusService = module.get(NodejsPrometheusService);
  });

  describe('getMetrics', () => {
    it('should return prometheus metrics', async () => {
      const mockMetrics = 'http_requests_total{method="GET",route="/test"} 1';
      prometheusService.getMetrics.mockResolvedValue(mockMetrics);

      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.getMetrics(mockResponse);

      expect(prometheusService.getMetrics).toHaveBeenCalled();
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/plain; version=0.0.4; charset=utf-8',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith(mockMetrics);
    });
  });

  describe('health', () => {
    it('should return health status with system information', () => {
      const originalUptime = process.uptime;
      const originalMemoryUsage = process.memoryUsage;
      const originalVersion = process.version;
      const originalPid = process.pid;

      process.uptime = jest.fn().mockReturnValue(123.456);
      process.memoryUsage = jest.fn().mockReturnValue({
        rss: 50 * 1024 * 1024,
        heapUsed: 30 * 1024 * 1024,
        heapTotal: 40 * 1024 * 1024,
        external: 5 * 1024 * 1024,
        arrayBuffers: 2 * 1024 * 1024,
      });

      const result = controller.health();

      expect(result).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        service: 'auth-service',
        uptime: '123 seconds',
        memory: {
          rss: '50 MB',
          heapUsed: '30 MB',
          heapTotal: '40 MB',
        },
        nodeVersion: originalVersion,
        pid: originalPid,
      });

      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );

      process.uptime = originalUptime;
      process.memoryUsage = originalMemoryUsage;
    });
  });
});
