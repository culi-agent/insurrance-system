/**
 * Admin Product Management Service
 * Sprint 8: S8-05 - CRUD operations for products
 */
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Product } from '../../products/entities/Product';
import { Category } from '../../products/entities/Category';
import { Insurer } from '../../products/entities/Insurer';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

export interface CreateProductInput {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: string;
  insurer_id: string;
  benefits?: Record<string, any>;
  exclusions?: string[];
  pricing_rules?: Record<string, any>;
  eligibility?: Record<string, any>;
  min_age?: number;
  max_age?: number;
  min_premium?: number;
  max_premium?: number;
  is_featured?: boolean;
  status?: string;
  sort_order?: number;
  metadata?: Record<string, any>;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export class AdminProductService {
  private productRepo: Repository<Product>;
  private categoryRepo: Repository<Category>;
  private insurerRepo: Repository<Insurer>;

  constructor() {
    this.productRepo = AppDataSource.getRepository(Product);
    this.categoryRepo = AppDataSource.getRepository(Category);
    this.insurerRepo = AppDataSource.getRepository(Insurer);
  }

  async createProduct(input: CreateProductInput) {
    // Validate category exists
    const category = await this.categoryRepo.findOne({ where: { id: input.category_id } });
    if (!category) throw new NotFoundError('Danh mục không tồn tại');

    // Validate insurer exists
    const insurer = await this.insurerRepo.findOne({ where: { id: input.insurer_id } });
    if (!insurer) throw new NotFoundError('Nhà bảo hiểm không tồn tại');

    // Check slug uniqueness
    const existing = await this.productRepo.findOne({ where: { slug: input.slug } });
    if (existing) throw new ValidationError('Slug đã tồn tại');

    const product = this.productRepo.create({
      name: input.name,
      slug: input.slug,
      description: input.description,
      shortDescription: input.short_description,
      categoryId: input.category_id,
      insurerId: input.insurer_id,
      benefits: input.benefits || {},
      exclusions: input.exclusions || [],
      pricingRules: input.pricing_rules || {},
      eligibility: input.eligibility || {},
      minAge: input.min_age || 0,
      maxAge: input.max_age || 100,
      minPremium: input.min_premium || 0,
      maxPremium: input.max_premium || 0,
      isFeatured: input.is_featured || false,
      status: input.status || 'draft',
      sortOrder: input.sort_order || 0,
      metadata: input.metadata || {},
    });

    const saved = await this.productRepo.save(product);
    return this.formatProduct(saved);
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundError('Sản phẩm không tồn tại');

    if (input.slug && input.slug !== product.slug) {
      const existing = await this.productRepo.findOne({ where: { slug: input.slug } });
      if (existing) throw new ValidationError('Slug đã tồn tại');
    }

    Object.assign(product, {
      ...(input.name && { name: input.name }),
      ...(input.slug && { slug: input.slug }),
      ...(input.description && { description: input.description }),
      ...(input.short_description && { shortDescription: input.short_description }),
      ...(input.category_id && { categoryId: input.category_id }),
      ...(input.insurer_id && { insurerId: input.insurer_id }),
      ...(input.benefits && { benefits: input.benefits }),
      ...(input.exclusions && { exclusions: input.exclusions }),
      ...(input.min_premium !== undefined && { minPremium: input.min_premium }),
      ...(input.max_premium !== undefined && { maxPremium: input.max_premium }),
      ...(input.is_featured !== undefined && { isFeatured: input.is_featured }),
      ...(input.status && { status: input.status }),
      ...(input.sort_order !== undefined && { sortOrder: input.sort_order }),
    });

    const saved = await this.productRepo.save(product);
    return this.formatProduct(saved);
  }

  async deleteProduct(id: string) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundError('Sản phẩm không tồn tại');

    product.status = 'archived';
    await this.productRepo.save(product);
    return { success: true, message: 'Sản phẩm đã được lưu trữ' };
  }

  async getAllProducts(page = 1, perPage = 20, status?: string) {
    const where: any = {};
    if (status) where.status = status;

    const [products, total] = await this.productRepo.findAndCount({
      where,
      relations: ['category', 'insurer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return { data: products.map(this.formatProduct), total, page, per_page: perPage };
  }

  // Admin Customer Management
  async getCustomers(page = 1, perPage = 20, search?: string) {
    // In real app: query customer table with search
    return {
      data: [],
      total: 0,
      page,
      per_page: perPage,
    };
  }

  // Admin Dashboard Stats
  async getDashboardStats() {
    const totalProducts = await this.productRepo.count();
    const activeProducts = await this.productRepo.count({ where: { status: 'active' } });
    const totalCategories = await this.categoryRepo.count();
    const totalInsurers = await this.insurerRepo.count();

    return {
      products: { total: totalProducts, active: activeProducts },
      categories: { total: totalCategories },
      insurers: { total: totalInsurers },
      // In production: add orders, revenue, customers stats
      orders: { total: 0, this_month: 0 },
      revenue: { total: 0, this_month: 0 },
      customers: { total: 0, new_this_month: 0 },
    };
  }

  private formatProduct(product: Product) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      short_description: product.shortDescription,
      min_premium: product.minPremium,
      max_premium: product.maxPremium,
      is_featured: product.isFeatured,
      status: product.status,
      sort_order: product.sortOrder,
      category: product.category ? { id: product.category.id, name: product.category.name } : null,
      insurer: product.insurer ? { id: product.insurer.id, name: product.insurer.name } : null,
      created_at: product.createdAt,
      updated_at: product.updatedAt,
    };
  }
}
