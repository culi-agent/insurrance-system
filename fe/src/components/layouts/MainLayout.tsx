import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function MainLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IS</span>
              </div>
              <span className="text-xl font-bold text-gray-900">InsureVN</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/categories" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                Sản phẩm
              </Link>
              <Link to="/categories/motor-insurance" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                Xe cơ giới
              </Link>
              <Link to="/categories/health-insurance" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                Sức khỏe
              </Link>
              <Link to="/categories/travel-insurance" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                Du lịch
              </Link>
            </nav>

            {/* Auth buttons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="text-gray-600 hover:text-primary-600 font-medium">
                    {user?.full_name || 'Profile'}
                  </Link>
                  <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">InsureVN</h3>
              <p className="text-sm">Nền tảng bảo hiểm trực tuyến toàn diện cho mọi nhu cầu của bạn.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/categories/motor-insurance" className="hover:text-white">Bảo hiểm Xe</Link></li>
                <li><Link to="/categories/health-insurance" className="hover:text-white">Bảo hiểm Sức khỏe</Link></li>
                <li><Link to="/categories/life-insurance" className="hover:text-white">Bảo hiểm Nhân thọ</Link></li>
                <li><Link to="/categories/travel-insurance" className="hover:text-white">Bảo hiểm Du lịch</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-white">Liên hệ</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: support@insurevn.vn</li>
                <li>Hotline: 1900 xxxx</li>
                <li>Địa chỉ: TP. Hồ Chí Minh</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 InsureVN. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
