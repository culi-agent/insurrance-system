import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Về Chúng Tôi</h1>
          <p className="text-xl text-blue-100">
            Nền tảng bảo hiểm trực tuyến hàng đầu Việt Nam
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Sứ mệnh của chúng tôi</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Chúng tôi tin rằng mọi người đều xứng đáng được bảo vệ. Sứ mệnh của chúng tôi là 
                làm cho bảo hiểm trở nên dễ tiếp cận, dễ hiểu và phù hợp với túi tiền của mọi gia đình Việt Nam.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Với công nghệ tiên tiến, chúng tôi kết nối bạn với các nhà bảo hiểm uy tín nhất, 
                giúp bạn so sánh và chọn lựa phương án bảo hiểm tối ưu chỉ trong vài phút.
              </p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">10+</p>
                  <p className="text-gray-600 mt-1">Đối tác bảo hiểm</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">50K+</p>
                  <p className="text-gray-600 mt-1">Khách hàng</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">98%</p>
                  <p className="text-gray-600 mt-1">Hài lòng</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">24/7</p>
                  <p className="text-gray-600 mt-1">Hỗ trợ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Giá trị cốt lõi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl mb-4">🎯</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Minh bạch</h3>
              <p className="text-gray-600">Thông tin rõ ràng, không phí ẩn. Bạn luôn biết chính xác mình đang mua gì.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl mb-4">⚡</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Nhanh chóng</h3>
              <p className="text-gray-600">Nhận báo giá trong 30 giây. Mua bảo hiểm trong 5 phút. Tiết kiệm thời gian quý báu.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl mb-4">🤝</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Đáng tin cậy</h3>
              <p className="text-gray-600">Hợp tác với các nhà bảo hiểm hàng đầu. Cam kết bồi thường nhanh chóng khi có sự cố.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Bắt đầu bảo vệ gia đình bạn</h2>
          <p className="text-gray-600 text-lg mb-8">
            Nhận báo giá miễn phí ngay hôm nay và tiết kiệm đến 30%
          </p>
          <Link to="/categories" className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Khám phá sản phẩm
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
