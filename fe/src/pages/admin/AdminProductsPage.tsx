import React, { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  min_premium: number;
  is_featured: boolean;
  status: string;
  category: { id: string; name: string } | null;
  insurer: { id: string; name: string } | null;
  created_at: string;
}

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = { page: 1, per_page: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/products', { params });
      setProducts(res.data.data || []);
    } catch { }
    finally { setLoading(false); }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      archived: 'bg-yellow-100 text-yellow-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Sản Phẩm</h1>
          <p className="text-gray-500 mt-1">{products.length} sản phẩm</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          + Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['', 'active', 'draft', 'suspended', 'archived'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {s || 'Tất cả'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Sản phẩm</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Danh mục</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Nhà BH</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Phí từ</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Trạng thái</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Không có sản phẩm</td></tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{product.short_description}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.category?.name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.insurer?.name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{formatCurrency(product.min_premium)}</td>
                  <td className="px-4 py-3">{getStatusBadge(product.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-blue-600 hover:text-blue-700 text-sm mr-3">Sửa</button>
                    <button className="text-red-600 hover:text-red-700 text-sm">Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductsPage;
