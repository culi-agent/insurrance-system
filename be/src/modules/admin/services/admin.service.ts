import { Repository, ILike } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Product } from '../../products/entities/Product';
import { Category } from '../../products/entities/Category';
import { Insurer } from '../../products/entities/Insurer';
import { Customer } from '../../auth/entities/Customer';
import { NotFoundError, ConflictError, ValidationError } from '../../../shared/errors/AppError';

export class AdminService {
  private productRepo: Repository<Product>;
  private categoryRepo: Repository<Category>;
  private insurerRepo: Repository<Insurer>;
  private customerRepo: Repository<Customer>;

  constructor() {
    this.productRepo = AppDataSource.getRepository(Product);
    this.categoryRepo = AppDataSource.getRepository(Category);
    this.insurerRepo = AppDataSource.getRepository(Insurer);
    this.customerRepo = AppDataSource.getRepository(Customer);
  }

  // ========== PRODUCT CRUD ==========

  async createProduct(data: {
    name: string;
    slug: string;
    category_id: string;
    insurer_id: string;
    description?: string;
    short_description?: string;
    benefits?: any;
    exclusions?: any;
    pricing_rules?: any;
    eligibility?: any;
    terms_url?: string;
    brochure_url?: string;
    min_age?: number;
    max_age?: number;
    min_premium?: number;
    max_premium?: number;
    status?: string;
    sort_order?: number;
    is_featured?: boolean;
    metadata?: any;
  }) {
    // Check slug uniqueness
    const existingSlug = await this.productRepo.findOne({ where: { slug: data.slug } });
    if (existingSlug) {
      throw new ConflictError('Slug đã tồn tại');
    }

    // Verify category exists
    const category = await this.categoryRepo.findOne({ where: { id: data.category_id } });
    if (!category) {
      throw new NotFoundError('Danh mục không tồn tại');
    }

    // Verify insurer exists
    const insurer = await this.insurerRepo.findOne({ where: { id: data.insurer_id } });
    if (!insurer) {
      throw new NotFoundError('Nhà bảo hiểm không tồn tại');
    }

    const product = this.productRepo.create({
      name: data.name,
      slug: data.slug,
      categoryId: data.category_id,
      insurerId: data.insurer_id,
      description: data.description,
      shortDescription: data.short_description,
      benefits: data.benefits,
      exclusions: data.exclusions,
      pricingRules: data.pricing_rules,
      eligibility: data.eligibility,
      termsUrl: data.terms_url,
      brochureUrl: data.brochure_url,
      minAge: data.min_age || 0,
      maxAge: data.max_age || 100,
      minPremium: data.min_premium || 0,
      maxPremium: data.max_premium,
      status: data.status || 'draft',
      sortOrder: data.sort_order || 0,
      isFeatured: data.is_featured || false,
      metadata: data.metadata,
    });

    const saved = await this.productRepo.save(product);
    return this.formatProduct(saved);
  }

  async updateProduct(id: string, data: Partial<{
    name: string;
    slug: string;
    category_id: string;
    insurer_id: string;
    description: string;
    short_description: string;
    benefits: any;
    exclusions: any;
    pricing_rules: any;
    eligibility: any;
    terms_url: string;
    brochure_url: string;
    min_age: number;
    max_age: number;
    min_premium: number;
    max_premium: number;
    status: string;
    sort_order: number;
    is_featured: boolean;
    metadata: any;
  }>) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'insurer'],
    });

    if (!product) {
      throw new NotFoundError('Sản phẩm không tồn tại');
    }

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== product.slug) {
      const existingSlug = await this.productRepo.findOne({ where: { slug: data.slug } });
      if (existingSlug) {
        throw new ConflictError('Slug đã tồn tại');
      }
    }

    // Map fields
    if (data.name !== undefined) product.name = data.name;
    if (data.slug !== undefined) product.slug = data.slug;
    if (data.category_id !== undefined) product.categoryId = data.category_id;
    if (data.insurer_id !== undefined) product.insurerId = data.insurer_id;
    if (data.description !== undefined) product.description = data.description;
    if (data.short_description !== undefined) product.shortDescription = data.short_description;
    if (data.benefits !== undefined) product.benefits = data.benefits;
    if (data.exclusions !== undefined) product.exclusions = data.exclusions;
    if (data.pricing_rules !== undefined) product.pricingRules = data.pricing_rules;
    if (data.eligibility !== undefined) product.eligibility = data.eligibility;
    if (data.terms_url !== undefined) product.termsUrl = data.terms_url;
    if (data.brochure_url !== undefined) product.brochureUrl = data.brochure_url;
    if (data.min_age !== undefined) product.minAge = data.min_age;
    if (data.max_age !== undefined) product.maxAge = data.max_age;
    if (data.min_premium !== undefined) product.minPremium = data.min_premium;
    if (data.max_premium !== undefined) product.maxPremium = data.max_premium;
    if (data.status !== undefined) product.status = data.status;
    if (data.sort_order !== undefined) product.sortOrder = data.sort_order;
    if (data.is_featured !== undefined) product.isFeatured = data.is_featured;
    if (data.metadata !== undefined) product.metadata = data.metadata;

    const saved = await this.productRepo.save(product);
    return this.formatProduct(saved);
  }

  async deleteProduct(id: string) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundError('Sản phẩm không tồn tại');
    }

    // Soft delete - change status to archived
    product.status = 'archived';
    await this.productRepo.save(product);

    return { message: 'Sản phẩm đã được xóa' };
  }

  async getProducts(filters: { status?: string }, page: number = 1, perPage: number = 20) {
    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.insurer', 'insurer');

    if (filters.status) {
      queryBuilder.where('product.status = :status', { status: filters.status });
    }

    queryBuilder.orderBy('product.createdAt', 'DESC');

    const [products, total] = await queryBuilder
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    return {
      data: products.map(this.formatProduct),
      total,
      page,
      per_page: perPage,
    };
  }

  // ========== CATEGORY CRUD ==========

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    parent_id?: string;
    sort_order?: number;
  }) {
    const existingSlug = await this.categoryRepo.findOne({ where: { slug: data.slug } });
    if (existingSlug) {
      throw new ConflictError('Slug danh mục đã tồn tại');
    }

    const category = this.categoryRepo.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      icon: data.icon,
      parentId: data.parent_id,
      sortOrder: data.sort_order || 0,
      isActive: true,
    });

    const saved = await this.categoryRepo.save(category);
    return this.formatCategory(saved);
  }

  async updateCategory(id: string, data: Partial<{
    name: string;
    slug: string;
    description: string;
    icon: string;
    parent_id: string;
    sort_order: number;
    is_active: boolean;
  }>) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundError('Danh mục không tồn tại');
    }

    if (data.slug && data.slug !== category.slug) {
      const existingSlug = await this.categoryRepo.findOne({ where: { slug: data.slug } });
      if (existingSlug) {
        throw new ConflictError('Slug danh mục đã tồn tại');
      }
    }

    if (data.name !== undefined) category.name = data.name;
    if (data.slug !== undefined) category.slug = data.slug;
    if (data.description !== undefined) category.description = data.description;
    if (data.icon !== undefined) category.icon = data.icon;
    if (data.parent_id !== undefined) category.parentId = data.parent_id;
    if (data.sort_order !== undefined) category.sortOrder = data.sort_order;
    if (data.is_active !== undefined) category.isActive = data.is_active;

    const saved = await this.categoryRepo.save(category);
    return this.formatCategory(saved);
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundError('Danh mục không tồn tại');
    }

    // Check if category has products
    const productCount = await this.productRepo.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new ConflictError(`Không thể xóa danh mục có ${productCount} sản phẩm. Vui lòng di chuyển sản phẩm trước.`);
    }

    category.isActive = false;
    await this.categoryRepo.save(category);

    return { message: 'Danh mục đã được xóa' };
  }

  async getCategories(includeInactive: boolean = false) {
    const where = includeInactive ? {} : { isActive: true };
    const categories = await this.categoryRepo.find({
      where,
      order: { sortOrder: 'ASC' },
    });

    return categories.map(this.formatCategory);
  }

  // ========== INSURER CRUD ==========

  async createInsurer(data: {
    name: string;
    code: string;
    slug: string;
    description?: string;
    logo_url?: string;
    website?: string;
    phone?: string;
    email?: string;
    api_config?: any;
  }) {
    const existingCode = await this.insurerRepo.findOne({ where: { code: data.code } });
    if (existingCode) {
      throw new ConflictError('Mã nhà bảo hiểm đã tồn tại');
    }

    const existingSlug = await this.insurerRepo.findOne({ where: { slug: data.slug } });
    if (existingSlug) {
      throw new ConflictError('Slug nhà bảo hiểm đã tồn tại');
    }

    const insurer = this.insurerRepo.create({
      name: data.name,
      code: data.code,
      slug: data.slug,
      description: data.description,
      logoUrl: data.logo_url,
      website: data.website,
      phone: data.phone,
      email: data.email,
      apiConfig: data.api_config,
      status: 'active',
      rating: 0,
    });

    const saved = await this.insurerRepo.save(insurer);
    return this.formatInsurer(saved);
  }

  async updateInsurer(id: string, data: Partial<{
    name: string;
    code: string;
    slug: string;
    description: string;
    logo_url: string;
    website: string;
    phone: string;
    email: string;
    api_config: any;
    status: string;
    rating: number;
  }>) {
    const insurer = await this.insurerRepo.findOne({ where: { id } });
    if (!insurer) {
      throw new NotFoundError('Nhà bảo hiểm không tồn tại');
    }

    if (data.code && data.code !== insurer.code) {
      const existingCode = await this.insurerRepo.findOne({ where: { code: data.code } });
      if (existingCode) {
        throw new ConflictError('Mã nhà bảo hiểm đã tồn tại');
      }
    }

    if (data.slug && data.slug !== insurer.slug) {
      const existingSlug = await this.insurerRepo.findOne({ where: { slug: data.slug } });
      if (existingSlug) {
        throw new ConflictError('Slug nhà bảo hiểm đã tồn tại');
      }
    }

    if (data.name !== undefined) insurer.name = data.name;
    if (data.code !== undefined) insurer.code = data.code;
    if (data.slug !== undefined) insurer.slug = data.slug;
    if (data.description !== undefined) insurer.description = data.description;
    if (data.logo_url !== undefined) insurer.logoUrl = data.logo_url;
    if (data.website !== undefined) insurer.website = data.website;
    if (data.phone !== undefined) insurer.phone = data.phone;
    if (data.email !== undefined) insurer.email = data.email;
    if (data.api_config !== undefined) insurer.apiConfig = data.api_config;
    if (data.status !== undefined) insurer.status = data.status;
    if (data.rating !== undefined) insurer.rating = data.rating;

    const saved = await this.insurerRepo.save(insurer);
    return this.formatInsurer(saved);
  }

  async deleteInsurer(id: string) {
    const insurer = await this.insurerRepo.findOne({ where: { id } });
    if (!insurer) {
      throw new NotFoundError('Nhà bảo hiểm không tồn tại');
    }

    // Check if insurer has products
    const productCount = await this.productRepo.count({ where: { insurerId: id } });
    if (productCount > 0) {
      throw new ConflictError(`Không thể xóa nhà bảo hiểm có ${productCount} sản phẩm.`);
    }

    insurer.status = 'inactive';
    await this.insurerRepo.save(insurer);

    return { message: 'Nhà bảo hiểm đã được vô hiệu hóa' };
  }

  async getInsurers(includeInactive: boolean = false) {
    const where = includeInactive ? {} : { status: 'active' };
    const insurers = await this.insurerRepo.find({
      where,
      order: { name: 'ASC' },
    });

    return insurers.map(this.formatInsurer);
  }

  // ========== CUSTOMER MANAGEMENT ==========

  async getCustomers(
    filters: { status?: string; search?: string },
    page: number = 1,
    perPage: number = 20,
  ) {
    const queryBuilder = this.customerRepo.createQueryBuilder('customer');

    if (filters.status) {
      queryBuilder.andWhere('customer.status = :status', { status: filters.status });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(customer.email ILIKE :search OR customer.phone ILIKE :search OR customer.fullName ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    queryBuilder.orderBy('customer.createdAt', 'DESC');

    const [customers, total] = await queryBuilder
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    return {
      data: customers.map((c) => ({
        id: c.id,
        email: c.email,
        phone: c.phone,
        full_name: c.fullName,
        status: c.status,
        role: c.role,
        kyc_status: c.kycStatus,
        email_verified: c.emailVerified,
        phone_verified: c.phoneVerified,
        last_login_at: c.lastLoginAt,
        created_at: c.createdAt,
      })),
      total,
      page,
      per_page: perPage,
    };
  }

  async updateCustomerStatus(id: string, status: string) {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundError('Khách hàng không tồn tại');
    }

    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Trạng thái không hợp lệ');
    }

    customer.status = status;
    await this.customerRepo.save(customer);

    return {
      id: customer.id,
      email: customer.email,
      status: customer.status,
      message: `Trạng thái khách hàng đã cập nhật thành ${status}`,
    };
  }

  // ========== DASHBOARD STATS ==========

  async getDashboardStats() {
    const [
      totalCustomers,
      activeCustomers,
      totalProducts,
      activeProducts,
      totalCategories,
      totalInsurers,
    ] = await Promise.all([
      this.customerRepo.count(),
      this.customerRepo.count({ where: { status: 'active' } }),
      this.productRepo.count(),
      this.productRepo.count({ where: { status: 'active' } }),
      this.categoryRepo.count({ where: { isActive: true } }),
      this.insurerRepo.count({ where: { status: 'active' } }),
    ]);

    return {
      customers: {
        total: totalCustomers,
        active: activeCustomers,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
      },
      categories: totalCategories,
      insurers: totalInsurers,
    };
  }

  // ========== FORMAT HELPERS ==========

  private formatProduct(product: Product) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      short_description: product.shortDescription,
      category_id: product.categoryId,
      insurer_id: product.insurerId,
      benefits: product.benefits,
      exclusions: product.exclusions,
      pricing_rules: product.pricingRules,
      eligibility: product.eligibility,
      terms_url: product.termsUrl,
      brochure_url: product.brochureUrl,
      min_age: product.minAge,
      max_age: product.maxAge,
      min_premium: product.minPremium,
      max_premium: product.maxPremium,
      status: product.status,
      sort_order: product.sortOrder,
      is_featured: product.isFeatured,
      metadata: product.metadata,
      category: product.category
        ? { id: product.category.id, name: product.category.name, slug: product.category.slug }
        : undefined,
      insurer: product.insurer
        ? { id: product.insurer.id, name: product.insurer.name, code: product.insurer.code }
        : undefined,
      created_at: product.createdAt,
      updated_at: product.updatedAt,
    };
  }

  private formatCategory(category: Category) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      parent_id: category.parentId,
      sort_order: category.sortOrder,
      is_active: category.isActive,
      created_at: category.createdAt,
      updated_at: category.updatedAt,
    };
  }

  private formatInsurer(insurer: Insurer) {
    return {
      id: insurer.id,
      name: insurer.name,
      code: insurer.code,
      slug: insurer.slug,
      description: insurer.description,
      logo_url: insurer.logoUrl,
      website: insurer.website,
      phone: insurer.phone,
      email: insurer.email,
      status: insurer.status,
      rating: insurer.rating,
      created_at: insurer.createdAt,
      updated_at: insurer.updatedAt,
    };
  }
}
