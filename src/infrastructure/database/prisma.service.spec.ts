import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new PrismaService();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    // Mock the PrismaClient methods
    service.$connect = jest.fn().mockResolvedValue(undefined);
    service.$disconnect = jest.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('onModuleInit', () => {
    it('should connect to database and log connection', async () => {
      await service.onModuleInit();

      expect(service.$connect).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        '🗄️  Connected to PostgreSQL database',
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from database and log disconnection', async () => {
      await service.onModuleDestroy();

      expect(service.$disconnect).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        '🔌 Disconnected from PostgreSQL database',
      );
    });
  });
});
