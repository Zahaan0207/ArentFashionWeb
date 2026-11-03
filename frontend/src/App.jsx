import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header / Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wider text-pink-600">ARENT FASHION</h1>
          <nav className="space-x-6 hidden md:flex font-medium">
            <a href="#" className="hover:text-pink-600">Trang chủ</a>
            <a href="#" className="hover:text-pink-600">Đầm Dạ Hội</a>
            <a href="#" className="hover:text-pink-600">Bộ Sưu Tập</a>
            <a href="#" className="hover:text-pink-600">Giới thiệu</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition">Giỏ hàng (0)</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-pink-50 py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6">Tỏa Sáng Trong Mọi Đêm Tiệc</h2>
          <p className="text-lg text-gray-600 mb-8">Khám phá các mẫu đầm dạ hội thiết kế độc quyền, sang trọng và quyến rũ từ ArentFashion.</p>
          <button className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition">Khám phá ngay</button>
        </div>
      </section>
    </div>
  );
}

export default App;