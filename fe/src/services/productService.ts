import api from '@/lib/api';
import type { Category, Insurer, Product, ProductListResponse } from '@/types';

export interface ProductFilters {
  category_id?: string;
  insurer_id?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

export const productService = {
  getProducts: async (filters: ProductFilters = {}): Promise<ProductListResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/products?${params.toString()}`);
    return response.data.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data.data;
  },

  searchProducts: async (query: string, page = 1): Promise<ProductListResponse> => {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}&page=${page}`);
    return response.data.data;
  },

  getFeaturedProducts: async (limit = 10): Promise<Product[]> => {
    const response = await api.get(`/products/featured?limit=${limit}`);
    return response.data.data;
  },

  compareProducts: async (ids: string[]): Promise<Product[]> => {
    const response = await api.get(`/products/compare?ids=${ids.join(',')}`);
    return response.data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/products/categories');
    return response.data.data;
  },

  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get(`/products/categories/${slug}`);
    return response.data.data;
  },

  getProductsByCategory: async (slug: string, page = 1): Promise<ProductListResponse> => {
    const response = await api.get(`/products/categories/${slug}/products?page=${page}`);
    return response.data.data;
  },

  getInsurers: async (): Promise<Insurer[]> => {
    const response = await api.get('/products/insurers');
    return response.data.data;
  },
};
