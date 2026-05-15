import { Repository, ILike } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';
import { Insurer } from '../entities/Insurer';
import { NotFoundError } from '../../../shared/errors/AppError';

export interface ProductFilters {
  category_id?: string;
  insurer_id?: string;
  min_price?: number;
  max_price?: number;
  min_age?: number;
  max_age?: number;
  status?: string;
  is_featured?: boolean;
  search?: string;
}

export class ProductService {
  private productRepo: Repository<Product>;
  private categoryRepo: Repository<Category>;
  private insurerRepo: Repository<Insurer>;

  constructor() {
    this.productRepo = AppDataSource.getRepository(Product);
    this.categoryRepo = AppDataSource.getRepository(Category);
    this.insurerRepo = AppDataSource.getRepository(Insurer);
  }

  async getProducts(
    filters: ProductFilters,
    page: number = 1,
    perPage: number = 20,
  ) {
    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.insurer', 'insurer')
      .where('product.status = :status', { status: filters.status || 'active' });

    if (filters.category_id) {
      queryBuilder.andWhere('product.categoryId = :categoryId', {
        categoryId: filters.category_id,
      });
    }

    if (filters.insurer_id) {
      queryBuilder.andWhere('product.insurerId = :insurerId', {
        insurerId: filters.insurer_id,
      });
    }

    if (filters.min_price !== undefined) {
      queryBuilder.andWhere('product.minPremium >= :minPrice', {
        minPrice: filters.min_price,
      });
    }

    if (filters.max_price !== undefined) {
      queryBuilder.andWhere('product.minPremium <= :maxPrice', {
        maxPrice: filters.max_price,
      });
    }

    if (filters.is_featured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', {
        isFeatured: filters.is_featured,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    queryBuilder.orderBy('product.sortOrder', 'ASC');
    queryBuilder.addOrderBy('product.createdAt', 'DESC');

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

  async getProductById(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'insurer'],
    });

    if (!product) {
      throw new NotFoundError('Sản phẩm không tìm thấy');
    }

    return this.formatProductDetail(product);
  }

  async getProductBySlug(slug: string) {
    const product = await this.productRepo.findOne({
      where: { slug },
      relations: ['category', 'insurer'],
    });

    if (!product) {
      throw new NotFoundError('Sản phẩm không tìm thấy');
    }

    return this.formatProductDetail(product);
  }

  async compareProducts(ids: string[]) {
    const products = await this.productRepo.find({
      where: ids.map((id) => ({ id })),
      relations: ['category', 'insurer'],
    });

    if (products.length === 0) {
      throw new NotFoundError('Không tìm thấy sản phẩm nào');
    }

    return products.map(this.formatProductDetail);
  }

  async searchProducts(query: string, page: number = 1, perPage: number = 20) {
    const [products, total] = await this.productRepo.findAndCount({
      where: [
        { name: ILike(`%${query}%`), status: 'active' },
        { description: ILike(`%${query}%`), status: 'active' },
      ],
      relations: ['category', 'insurer'],
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return {
      data: products.map(this.formatProduct),
      total,
      page,
      per_page: perPage,
    };
  }

  async getFeaturedProducts(limit: number = 10) {
    const products = await this.productRepo.find({
      where: { isFeatured: true, status: 'active' },
      relations: ['category', 'insurer'],
      order: { sortOrder: 'ASC' },
      take: limit,
    });

    return products.map(this.formatProduct);
  }

  // Category methods
  async getCategories() {
    const categories = await this.categoryRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      parent_id: cat.parentId,
      sort_order: cat.sortOrder,
    }));
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.categoryRepo.findOne({
      where: { slug, isActive: true },
    });

    if (!category) {
      throw new NotFoundError('Danh mục không tìm thấy');
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      parent_id: category.parentId,
    };
  }

  async getProductsByCategory(categorySlug: string, page: number = 1, perPage: number = 20) {
    const category = await this.categoryRepo.findOne({
      where: { slug: categorySlug, isActive: true },
    });

    if (!category) {
      throw new NotFoundError('Danh mục không tìm thấy');
    }

    return this.getProducts({ category_id: category.id }, page, perPage);
  }

  // Insurer methods
  async getInsurers() {
    const insurers = await this.insurerRepo.find({
      where: { status: 'active' },
      order: { name: 'ASC' },
    });

    return insurers.map((ins) => ({
      id: ins.id,
      name: ins.name,
      code: ins.code,
      slug: ins.slug,
      description: ins.description,
      logo_url: ins.logoUrl,
      website: ins.website,
      rating: ins.rating,
    }));
  }

  private formatProduct(product: Product) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      short_description: product.shortDescription,
      min_premium: product.minPremium,
      max_premium: product.maxPremium,
      rating: product.rating,
      review_count: product.reviewCount,
      is_featured: product.isFeatured,
      category: product.category
        ? { id: product.category.id, name: product.category.name, slug: product.category.slug }
        : null,
      insurer: product.insurer
        ? { id: product.insurer.id, name: product.insurer.name, logo_url: product.insurer.logoUrl }
        : null,
    };
  }

  private formatProductDetail(product: Product) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      short_description: product.shortDescription,
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
      rating: product.rating,
      review_count: product.reviewCount,
      is_featured: product.isFeatured,
      metadata: product.metadata,
      category: product.category
        ? { id: product.category.id, name: product.category.name, slug: product.category.slug }
        : null,
      insurer: product.insurer
        ? {
            id: product.insurer.id,
            name: product.insurer.name,
            slug: product.insurer.slug,
            logo_url: product.insurer.logoUrl,
          }
        : null,
      created_at: product.createdAt,
    };
  }
}
