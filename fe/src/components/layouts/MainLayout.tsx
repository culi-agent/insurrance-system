import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { SkipLink } from '@/components/common/accessibility';

/**
 * Main layout with WCAG 2.1 accessibility improvements:
 * - Skip navigation link (2.4.1)
 * - ARIA landmarks: banner, navigation, main, contentinfo (1.3.1)
 * - Mobile menu keyboard accessible (2.1.1)
 * - Focus management on navigation (2.4.3)
 * - Sufficient color contrast (1.4.3)
 */
export default function MainLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Skip link for keyboard navigation - WCAG 2.4.1 */}
      <SkipLink />

      {/* Header - ARIA landmark: banner */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
              aria-label="InsureVN - Trang chủ"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                <span className="text-white font-bold text-sm">IS</span>
              </div>
              <span className="text-xl font-bold text-gray-900">InsureVN</span>
            </Link>

            {/* Main Navigation - ARIA landmark */}
            <nav className="hidden md:flex items-center space-x-8" aria-label="Menu chính">
              <Link
                to="/categories"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
              >
                Sản phẩm
              </Link>
              <Link
                to="/categories/motor-insurance"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
              >
                Xe cơ giới
              </Link>
              <Link
                to="/categories/health-insurance"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
              >
                Sức khỏe
              </Link>
              <Link
                to="/categories/travel-insurance"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
              >
                Du lịch
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-primary-600 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
                  >
                    {user?.full_name || 'Tài khoản'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-sm py-2 px-4"
                    aria-label="Đăng xuất khỏi tài khoản"
                  >
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

        {/* Mobile menu - keyboard accessible */}
        {mobileMenuOpen && (
          <nav
            id="mobile-menu"
            className="md:hidden border-t border-gray-200 bg-white"
            aria-label="Menu di động"
          >
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/categories"
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sản phẩm
              </Link>
              <Link
                to="/categories/motor-insurance"
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Xe cơ giới
              </Link>
              <Link
                to="/categories/health-insurance"
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sức khỏe
              </Link>
              <Link
                to="/categories/travel-insurance"
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Du lịch
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Tài khoản
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div className="flex space-x-3 pt-2">
                  <Link to="/login" className="btn-secondary text-sm py-2 px-4 flex-1 text-center" onClick={() => setMobileMenuOpen(false)}>
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4 flex-1 text-center" onClick={() => setMobileMenuOpen(false)}>
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Main content - ARIA landmark */}
      <main id="main-content" className="flex-1" role="main" aria-label="Nội dung chính">
        <Outlet />
      </main>

      {/* Footer - ARIA landmark: contentinfo */}
      <footer className="bg-gray-900 text-gray-300" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">InsureVN</h3>
              <p className="text-sm">Nền tảng bảo hiểm trực tuyến toàn diện cho mọi nhu cầu của bạn.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Sản phẩm</h4>
              <nav aria-label="Sản phẩm bảo hiểm">
                <ul className="space-y-2 text-sm">
                  <li><Link to="/categories/motor-insurance" className="hover:text-white focus:text-white focus:outline-none focus:underline">Bảo hiểm Xe</Link></li>
                  <li><Link to="/categories/health-insurance" className="hover:text-white focus:text-white focus:outline-none focus:underline">Bảo hiểm Sức khỏe</Link></li>
                  <li><Link to="/categories/life-insurance" className="hover:text-white focus:text-white focus:outline-none focus:underline">Bảo hiểm Nhân thọ</Link></li>
                  <li><Link to="/categories/travel-insurance" className="hover:text-white focus:text-white focus:outline-none focus:underline">Bảo hiểm Du lịch</Link></li>
                </ul>
              </nav>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Hỗ trợ</h4>
              <nav aria-label="Hỗ trợ khách hàng">
                <ul className="space-y-2 text-sm">
                  <li><a href="/help" className="hover:text-white focus:text-white focus:outline-none focus:underline">Trung tâm trợ giúp</a></li>
                  <li><a href="/contact" className="hover:text-white focus:text-white focus:outline-none focus:underline">Liên hệ</a></li>
                  <li><a href="/faq" className="hover:text-white focus:text-white focus:outline-none focus:underline">FAQ</a></li>
                </ul>
              </nav>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
              <address className="not-italic space-y-2 text-sm">
                <p>Email: <a href="mailto:support@insurevn.vn" className="hover:text-white focus:text-white focus:outline-none focus:underline">support@insurevn.vn</a></p>
                <p>Hotline: <a href="tel:1900xxxx" className="hover:text-white focus:text-white focus:outline-none focus:underline">1900 xxxx</a></p>
                <p>Địa chỉ: TP. Hồ Chí Minh</p>
              </address>
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
