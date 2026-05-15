import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';

interface ClaimDetail {
  id: string;
  claim_number: string;
  claim_type: string;
  incident_date: string;
  incident_description: string;
  claim_amount: number;
  approved_amount: number;
  status: string;
  priority: string;
  documents: Array<{ id: string; name: string; url: string; type: string; uploaded_at: string }>;
  messages: Array<{ id: string; sender_type: string; sender_name: string; message: string; timestamp: string }>;
  decision_reason: string;
  submitted_at: string;
  decided_at: string;
}

const ClaimDetailPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const res = await api.get(`/claims/${claimId}`);
        setClaim(res.data.data);
      } catch { }
      finally { setLoading(false); }
    };
    if (claimId) fetchClaim();
  }, [claimId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !claimId) return;
    try {
      setSending(true);
      const res = await api.post(`/claims/${claimId}/messages`, { message: newMessage });
      setClaim(prev => prev ? { ...prev, messages: res.data.data.messages } : null);
      setNewMessage('');
    } catch { }
    finally { setSending(false); }
  };

  const formatCurrency = (amount: number) => amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) : '-';

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!claim) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Không tìm thấy yêu cầu</p></div>;

  // Timeline steps
  const statusSteps = [
    { key: 'submitted', label: 'Đã gửi' },
    { key: 'under_review', label: 'Đang xem xét' },
    { key: 'approved', label: 'Đã duyệt' },
    { key: 'settled', label: 'Đã chi trả' },
  ];
  const currentIdx = statusSteps.findIndex(s => s.key === claim.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          {' / '}
          <Link to="/dashboard/claims" className="hover:text-blue-600">Bồi thường</Link>
          {' / '}<span className="text-gray-900">{claim.claim_number}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{claim.claim_number}</h1>
              <p className="text-gray-500 mt-1">Ngày gửi: {new Date(claim.submitted_at).toLocaleDateString('vi-VN')}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              claim.status === 'approved' || claim.status === 'settled' ? 'bg-green-100 text-green-800'
              : claim.status === 'rejected' ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
            }`}>{claim.status === 'submitted' ? 'Đã gửi' : claim.status === 'under_review' ? 'Đang xem xét' : claim.status === 'approved' ? 'Đã duyệt' : claim.status === 'rejected' ? 'Từ chối' : claim.status === 'settled' ? 'Đã chi trả' : claim.status}</span>
          </div>

          {/* Timeline */}
          <div className="mt-6 flex items-center">
            {statusSteps.map((step, idx) => (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx <= currentIdx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {idx <= currentIdx ? '✓' : idx + 1}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{step.label}</span>
                </div>
                {idx < statusSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${idx < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Incident Info */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Chi tiết sự cố</h2>
              <div className="space-y-3 text-sm">
                <div><span className="text-gray-500">Loại:</span> <span className="ml-2 font-medium">{claim.claim_type}</span></div>
                <div><span className="text-gray-500">Ngày xảy ra:</span> <span className="ml-2 font-medium">{new Date(claim.incident_date).toLocaleDateString('vi-VN')}</span></div>
                <div><span className="text-gray-500">Số tiền yêu cầu:</span> <span className="ml-2 font-medium text-blue-600">{formatCurrency(claim.claim_amount)}</span></div>
                {claim.approved_amount && <div><span className="text-gray-500">Số tiền duyệt:</span> <span className="ml-2 font-medium text-green-600">{formatCurrency(claim.approved_amount)}</span></div>}
                <div className="pt-2"><span className="text-gray-500">Mô tả:</span><p className="mt-1 text-gray-700">{claim.incident_description}</p></div>
              </div>
            </div>

            {/* Communication Thread */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Trao đổi</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {claim.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.sender_type === 'customer' ? 'bg-blue-50 text-blue-900' : msg.sender_type === 'system' ? 'bg-gray-100 text-gray-700' : 'bg-green-50 text-green-900'
                    }`}>
                      <p className="font-medium text-xs mb-1">{msg.sender_name}</p>
                      <p>{msg.message}</p>
                      <p className="text-xs opacity-60 mt-1">{new Date(msg.timestamp).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Send Message */}
              {!['closed', 'settled'].includes(claim.status) && (
                <div className="flex gap-2">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tin nhắn..." />
                  <button onClick={sendMessage} disabled={sending || !newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
                    Gửi
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Documents */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Tài liệu ({claim.documents.length})</h2>
              {claim.documents.length > 0 ? (
                <div className="space-y-2">
                  {claim.documents.map((doc) => (
                    <a key={doc.id} href={doc.url} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 border text-sm">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate">{doc.name}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Chưa có tài liệu</p>
              )}
            </div>

            {claim.decision_reason && (
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-2">Kết quả xử lý</h2>
                <p className="text-sm text-gray-700">{claim.decision_reason}</p>
                {claim.decided_at && <p className="text-xs text-gray-400 mt-2">Ngày quyết định: {new Date(claim.decided_at).toLocaleDateString('vi-VN')}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetailPage;
