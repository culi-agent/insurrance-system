import React, { useState, useEffect } from 'react';
import api from '@/services/api';

interface Partner {
  id: string;
  name: string;
  code: string;
  type: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  commission_rate: number;
  status: string;
  created_at: string;
}

const AdminPartnersPage: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPartner, setEditPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'insurer',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    commission_rate: 15,
  });

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const res = await api.get('/admin/partners');
      setPartners(res.data.data.data || []);
    } catch (error) {
      console.error('Failed to load partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editPartner) {
        await api.put(`/admin/partners/${editPartner.id}`, formData);
      } else {
        await api.post('/admin/partners', formData);
      }
      setShowForm(false);
      setEditPartner(null);
      resetForm();
      loadPartners();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (partner: Partner) => {
    setEditPartner(partner);
    setFormData({
      name: partner.name,
      code: partner.code,
      type: partner.type,
      contact_name: partner.contact_name || '',
      contact_email: partner.contact_email || '',
      contact_phone: partner.contact_phone || '',
      commission_rate: partner.commission_rate,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', type: 'insurer', contact_name: '', contact_email: '', contact_phone: '', commission_rate: 15 });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') return 'bg-green-100 text-green-800';
    if (status === 'inactive') return 'bg-gray-100 text-gray-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản Lý Đối Tác</h1>
        <button
          onClick={() => { setShowForm(true); setEditPartner(null); resetForm(); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + Thêm đối tác
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">{editPartner ? 'Sửa đối tác' : 'Thêm đối tác mới'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mã</label>
                  <input type="text" required value={formData.code} onChange={e => setFormData(f => ({ ...f, code: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" disabled={!!editPartner} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Loại</label>
                  <select value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="insurer">Công ty BH</option>
                    <option value="payment_gateway">Cổng thanh toán</option>
                    <option value="service_provider">Nhà cung cấp DV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hoa hồng (%)</label>
                  <input type="number" step="0.5" min="0" max="100" value={formData.commission_rate}
                    onChange={e => setFormData(f => ({ ...f, commission_rate: parseFloat(e.target.value) }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Người liên hệ</label>
                <input type="text" value={formData.contact_name} onChange={e => setFormData(f => ({ ...f, contact_name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={formData.contact_email} onChange={e => setFormData(f => ({ ...f, contact_email: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SĐT</label>
                  <input type="text" value={formData.contact_phone} onChange={e => setFormData(f => ({ ...f, contact_phone: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  {editPartner ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partners table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Tên</th>
                <th className="px-4 py-3 text-left">Mã</th>
                <th className="px-4 py-3 text-left">Loại</th>
                <th className="px-4 py-3 text-left">Liên hệ</th>
                <th className="px-4 py-3 text-right">Hoa hồng</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>
              ) : partners.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Chưa có đối tác</td></tr>
              ) : partners.map(partner => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{partner.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{partner.code}</td>
                  <td className="px-4 py-3">{partner.type === 'insurer' ? 'Bảo hiểm' : partner.type}</td>
                  <td className="px-4 py-3">
                    {partner.contact_name && <p>{partner.contact_name}</p>}
                    {partner.contact_email && <p className="text-xs text-gray-500">{partner.contact_email}</p>}
                  </td>
                  <td className="px-4 py-3 text-right">{partner.commission_rate}%</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(partner.status)}`}>
                      {partner.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(partner)} className="text-blue-600 hover:underline text-sm">
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPartnersPage;
