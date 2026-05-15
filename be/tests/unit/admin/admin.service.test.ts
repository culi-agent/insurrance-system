import { AdminService } from '../../../src/modules/admin/services/admin.service';
import { AppDataSource } from '../../../src/config/database';
import { NotFoundError, ConflictError, ValidationError } from '../../../src/shared/errors/AppError';

jest.mock('../../../src/config/database');

describe('AdminService', () => {
  let adminService: AdminService;
  let mockProductRepo: any;
  let mockCategoryRepo: any;
  let mockInsurerRepo: any;
  let mockCustomerRepo: any;

  beforeEach(() => {
    mockProductRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    mockCategoryRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
    mockInsurerRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
    mockCustomerRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity: any) => {
      const name = entity.name || entity.toString();
      if (name.includes('Product')) return mockProductRepo;
      if (name.includes('Category')) return mockCategoryRepo;
      if (name.includes('Insurer')) return mockInsurerRepo;
      if (name.includes('Customer')) return mockCustomerRepo;
      return mockProductRepo;
    });

    adminService = new AdminService();
  });

  describe('updateCustomerStatus', () => {
    it('should update customer status successfully', async () => {
      const customer = { id: 'uuid-1', email: 'user@test.com', status: 'active' };
      mockCustomerRepo.findOne.mockResolvedValue(customer);
      mockCustomerRepo.save.mockResolvedValue({ ...customer, status: 'suspended' });

      const result = await adminService.updateCustomerStatus('uuid-1', 'suspended');

      expect(result.status).toBe('suspended');
      expect(result.message).toContain('suspended');
    });

    it('should throw NotFoundError for non-existent customer', async () => {
      mockCustomerRepo.findOne.mockResolvedValue(null);

      await expect(
        adminService.updateCustomerStatus('uuid-nonexist', 'active'),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for invalid status', async () => {
      const customer = { id: 'uuid-1', status: 'active' };
      mockCustomerRepo.findOne.mockResolvedValue(customer);

      await expect(
        adminService.updateCustomerStatus('uuid-1', 'invalid_status'),
      ).rejects.toThrow(ValidationError);
    });

    it('should accept valid statuses: active, inactive, suspended', async () => {
      const customer = { id: 'uuid-1', email: 'user@test.com', status: 'active' };
      mockCustomerRepo.findOne.mockResolvedValue(customer);
      mockCustomerRepo.save.mockImplementation((c: any) => Promise.resolve(c));

      for (const status of ['active', 'inactive', 'suspended']) {
        customer.status = 'active'; // reset
        const result = await adminService.updateCustomerStatus('uuid-1', status);
        expect(result.status).toBe(status);
      }
    });
  });

  describe('createCategory', () => {
    const categoryData = {
      name: 'Health Insurance',
      slug: 'health-insurance',
      description: 'All health insurance products',
    };

    it('should create category successfully', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);
      const created = { id: 'cat-1', ...categoryData, isActive: true, sortOrder: 0 };
      mockCategoryRepo.create.mockReturnValue(created);
      mockCategoryRepo.save.mockResolvedValue({ ...created, createdAt: new Date(), updatedAt: new Date() });

      const result = await adminService.createCategory(categoryData);

      expect(result.name).toBe(categoryData.name);
      expect(result.slug).toBe(categoryData.slug);
    });

    it('should throw ConflictError for duplicate slug', async () => {
      mockCategoryRepo.findOne.mockResolvedValue({ id: 'existing', slug: categoryData.slug });

      await expect(adminService.createCategory(categoryData)).rejects.toThrow(ConflictError);
    });
  });

  describe('deleteCategory', () => {
    it('should deactivate category when no products exist', async () => {
      mockCategoryRepo.findOne.mockResolvedValue({ id: 'cat-1', isActive: true });
      mockProductRepo.count.mockResolvedValue(0);
      mockCategoryRepo.save.mockResolvedValue({});

      const result = await adminService.deleteCategory('cat-1');
      expect(result.message).toContain('xóa');
    });

    it('should throw ConflictError if category has products', async () => {
      mockCategoryRepo.findOne.mockResolvedValue({ id: 'cat-1', isActive: true });
      mockProductRepo.count.mockResolvedValue(5);

      await expect(adminService.deleteCategory('cat-1')).rejects.toThrow(ConflictError);
    });

    it('should throw NotFoundError for non-existent category', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(adminService.deleteCategory('cat-nonexist')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createInsurer', () => {
    const insurerData = {
      name: 'Bao Viet',
      code: 'BAOVIET',
      slug: 'bao-viet',
      description: 'Bao Viet Insurance',
    };

    it('should create insurer successfully', async () => {
      mockInsurerRepo.findOne.mockResolvedValue(null);
      const created = { id: 'ins-1', ...insurerData, status: 'active', rating: 0 };
      mockInsurerRepo.create.mockReturnValue(created);
      mockInsurerRepo.save.mockResolvedValue({ ...created, createdAt: new Date(), updatedAt: new Date() });

      const result = await adminService.createInsurer(insurerData);

      expect(result.name).toBe(insurerData.name);
      expect(result.code).toBe(insurerData.code);
    });

    it('should throw ConflictError for duplicate code', async () => {
      mockInsurerRepo.findOne
        .mockResolvedValueOnce({ id: 'existing', code: 'BAOVIET' }); // code check

      await expect(adminService.createInsurer(insurerData)).rejects.toThrow(ConflictError);
    });
  });

  describe('deleteInsurer', () => {
    it('should deactivate insurer when no products exist', async () => {
      mockInsurerRepo.findOne.mockResolvedValue({ id: 'ins-1', status: 'active' });
      mockProductRepo.count.mockResolvedValue(0);
      mockInsurerRepo.save.mockResolvedValue({});

      const result = await adminService.deleteInsurer('ins-1');
      expect(result.message).toContain('vô hiệu hóa');
    });

    it('should throw ConflictError if insurer has products', async () => {
      mockInsurerRepo.findOne.mockResolvedValue({ id: 'ins-1', status: 'active' });
      mockProductRepo.count.mockResolvedValue(3);

      await expect(adminService.deleteInsurer('ins-1')).rejects.toThrow(ConflictError);
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      mockCustomerRepo.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80); // active
      mockProductRepo.count
        .mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(30); // active
      mockCategoryRepo.count.mockResolvedValue(10);
      mockInsurerRepo.count.mockResolvedValue(5);

      const result = await adminService.getDashboardStats();

      expect(result.customers.total).toBe(100);
      expect(result.customers.active).toBe(80);
      expect(result.products.total).toBe(50);
      expect(result.products.active).toBe(30);
      expect(result.categories).toBe(10);
      expect(result.insurers).toBe(5);
    });
  });
});
