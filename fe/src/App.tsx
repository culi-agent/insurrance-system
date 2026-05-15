import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Insurance System</h1>
        <p>Hệ thống bán bảo hiểm toàn diện</p>
      </header>
      <main className="container mx-auto p-4">
        <h2 className="text-xl mb-4">Chào mừng đến với hệ thống bảo hiểm</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg">Bảo hiểm Nhân thọ</h3>
            <p className="text-gray-600">Bảo vệ tương lai cho bạn và gia đình</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg">Bảo hiểm Sức khỏe</h3>
            <p className="text-gray-600">Chi trả viện phí, chăm sóc sức khỏe toàn diện</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg">Bảo hiểm Xe cơ giới</h3>
            <p className="text-gray-600">Bảo vệ phương tiện của bạn mọi lúc mọi nơi</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
