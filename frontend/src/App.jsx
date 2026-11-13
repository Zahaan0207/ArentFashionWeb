import React, { useState } from 'react';

function App() {
  // ==========================================
  // 1. KHAI BÁO CÁC STATE (TRẠNG THÁI) CỦA ỨNG DỤNG
  // ==========================================
  
  // Danh sách sản phẩm ban đầu (Mỗi sản phẩm là 1 object)
  const [products, setProducts] = useState([
    { id: 1, code: 'DR001', name: 'Đầm Dạ Hội Xẻ Tà Kim Sa', category: 'Đầm Dạ Hội', price: '2.500.000 ₫', quantity: 3, status: 'Còn hàng' },
    { id: 2, code: 'DR002', name: 'Đầm Maxi Trễ Vai Sang Trọng', category: 'Đầm Maxi', price: '1.850.000 ₫', quantity: 5, status: 'Còn hàng' },
    { id: 3, code: 'AC001', name: 'Cài Tóc Vương Miện Ngọc Trai', category: 'Phụ Kiện', price: '650.000 ₫', quantity: 10, status: 'Còn hàng' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');          // Lưu từ khóa tìm kiếm
  const [isModalOpen, setIsModalOpen] = useState(false);     // Đóng/mở bảng Modal (Thêm/Sửa)
  const [editingId, setEditingId] = useState(null);          // ID sản phẩm đang sửa (null = thêm mới)
  const [formData, setFormData] = useState({ code: '', name: '', category: 'Đầm Dạ Hội', price: '', quantity: 1 }); // Lưu dữ liệu trong form nhập
  
  const [errors, setErrors] = useState({});                  // Lưu thông báo lỗi validate dữ liệu
  const [message, setMessage] = useState(null);              // Lưu nội dung thông báo nổi giữa màn hình

  // ==========================================
  // 2. CÁC HÀM XỬ LÝ NGHIỆP VỤ (FUNCTIONS)
  // ==========================================

  // Hiển thị thông báo giữa màn hình và tự động tắt sau 1.5 giây
  const showArentMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 1500);
  };

  // Mở modal ở chế độ "Thêm mới sản phẩm" (Mặc định số lượng là 1)
  const openAddModal = () => {
    setEditingId(null);
    setFormData({ code: '', name: '', category: 'Đầm Dạ Hội', price: '', quantity: 1 });
    setErrors({});
    setIsModalOpen(true);
  };

  // Mở modal ở chế độ "Chỉnh sửa sản phẩm" (Đổ dữ liệu cũ vào form)
  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({
      code: product.code,
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Xử lý lưu sản phẩm (Dùng chung cho cả Thêm mới và Cập nhật) có tích hợp Validation
  const handleSaveProduct = (e) => {
    e.preventDefault();
    let newErrors = {};

    // RÀNG BUỘC 1: Mã sản phẩm phải đúng 5 ký tự (2 chữ hoa đầu + 3 số cuối, VD: DR003)
    const codeRegex = /^[A-Z]{2}[0-9]{3}$/;
    if (!codeRegex.test(formData.code.trim())) {
      newErrors.code = 'Mã phải đúng 5 ký tự: 2 chữ in hoa đầu + 3 số cuối (VD: DR003)';
    }

    // RÀNG BUỘC 2: Giá sản phẩm phải là số và lớn hơn 200.000 ₫
    const rawPriceNum = Number(formData.price.replace(/[^0-9]/g, ''));
    if (isNaN(rawPriceNum) || rawPriceNum <= 200000) {
      newErrors.price = 'Giá sản phẩm phải lớn hơn 200.000 ₫!';
    }

    // RÀNG BUỘC 3: Số lượng sản phẩm phải từ 0 trở lên (cho phép nhập số 0)
    const qtyNum = Number(formData.quantity);
    if (isNaN(qtyNum) || qtyNum < 0) {
      newErrors.quantity = 'Số lượng sản phẩm không được nhỏ hơn 0!';
    }

    // Nếu có lỗi, hiển thị lỗi đỏ dưới input tương ứng và dừng lại
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const formattedPrice = rawPriceNum.toLocaleString('vi-VN') + ' ₫';
    
    // ĐIỀU KIỆN TRẠNG THÁI: Nếu số lượng > 0 thì "Còn hàng", ngược lại (bằng 0) thì "Hết hàng"
    const currentStatus = qtyNum > 0 ? 'Còn hàng' : 'Hết hàng';

    if (editingId !== null) {
      // CẬP NHẬT SẢN PHẨM ĐÃ CÓ
      const updatedList = products.map((p) =>
        p.id === editingId
          ? { ...p, ...formData, code: formData.code.toUpperCase(), price: formattedPrice, quantity: qtyNum, status: currentStatus }
          : p
      );
      setProducts(updatedList);
      showArentMessage(`Đã cập nhật sản phẩm ${formData.code.toUpperCase()} thành công!`);
    } else {
      // THÊM MỚI SẢN PHẨM
      const newItem = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        ...formData,
        code: formData.code.toUpperCase(),
        price: formattedPrice,
        quantity: qtyNum,
        status: currentStatus
      };
      setProducts([...products, newItem]);
      showArentMessage('Thêm sản phẩm mới thành công!');
    }

    setIsModalOpen(false); // Đóng modal sau khi lưu thành công
  };

  // Xóa sản phẩm theo ID
  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      setProducts(products.filter(p => p.id !== id));
      showArentMessage('Đã xóa sản phẩm thành công!');
    }
  };

  // Lọc danh sách sản phẩm theo từ khóa tìm kiếm (theo tên hoặc mã)
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==========================================
  // 3. GIAO DIỆN TRANG (JSX RENDER)
  // ==========================================
  return (
    <div className="min-h-screen font-sans text-[#AD8B73]" style={{ backgroundColor: '#E7DECF' }}>
      
      {/* 3.1. Hộp thông báo nổi giữa màn hình */}
      {message && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="bg-white px-8 py-4 rounded-2xl shadow-2xl border-2 flex items-center gap-3" style={{ borderColor: '#AD8B73', color: '#AD8B73' }}>
            <span className="font-extrabold tracking-wide">✨ ARENT FASHION:</span>
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      {/* 3.2. Thanh Header (Đầu trang) */}
      <header className="text-white shadow-md" style={{ backgroundColor: '#AD8B73' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-wider text-[#FFFBE9]">ARENT FASHION</span>
          </div>
          <nav className="space-x-6 text-sm font-medium">
            <a href="#" className="text-[#FFFBE9] font-semibold underline underline-offset-4">Quản lý sản phẩm</a>
          </nav>
        </div>
      </header>

      {/* 3.3. Khu vực Nội dung Chính */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Tiêu đề trang & Nút mở Modal Thêm mới */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold font-serif" style={{ color: '#AD8B73' }}>Quản lý sản phẩm</h1>
            <p className="text-sm text-[#7D5A50]">Quản lý thông tin và số lượng trang phục, phụ kiện theo phong cách Vintage.</p>
          </div>
          <button 
            onClick={openAddModal}
            className="text-white px-4 py-2 rounded-lg font-medium shadow transition flex items-center gap-2 hover:opacity-90"
            style={{ backgroundColor: '#AD8B73' }}
          >
            + Thêm sản phẩm
          </button>
        </div>

        {/* Thanh tìm kiếm và đếm tổng số lượng kết quả */}
        <div className="p-4 rounded-xl shadow-sm border mb-6 flex flex-wrap gap-4 items-center justify-between" style={{ backgroundColor: '#DFD3C3', borderColor: '#CEAB93' }}>
          <div className="flex-1 min-w-[300px]">
            <input 
              type="text" 
              placeholder="Tìm kiếm theo mã, tên sản phẩm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white text-gray-800"
              style={{ borderColor: '#CEAB93' }}
            />
          </div>
          <div className="text-sm font-medium text-[#7D5A50]">
            Tổng số kết quả: <span className="font-bold">{filteredProducts.length}</span> sản phẩm
          </div>
        </div>

        {/* Bảng dữ liệu hiển thị danh sách sản phẩm */}
        <div className="rounded-xl shadow-sm border overflow-hidden bg-white" style={{ borderColor: '#CEAB93' }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-white text-xs uppercase tracking-wider font-bold" style={{ backgroundColor: '#AD8B73' }}>
                <th className="py-3 px-4 border-r border-white/30 font-bold">Mã sản phẩm</th>
                <th className="py-3 px-4 border-r border-white/30 font-bold">Tên trang phục</th>
                <th className="py-3 px-4 border-r border-white/30 font-bold">Thể loại</th>
                <th className="py-3 px-4 border-r border-white/30 font-bold">Giá</th>
                <th className="py-3 px-4 text-center border-r border-white/30 font-bold">Số lượng</th>
                <th className="py-3 px-4 text-center border-r border-white/30 font-bold">Trạng thái</th>
                <th className="py-3 px-4 text-center font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm" style={{ borderColor: '#E7DECF' }}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#E7DECF]/40 transition">
                    <td className="py-3 px-4 font-semibold text-[#7D5A50]">{p.code}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{p.name}</td>
                    <td className="py-3 px-4 text-[#AD8B73]">{p.category}</td>
                    <td className="py-3 px-4 font-bold" style={{ color: '#AD8B73' }}>{p.price}</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-700">{p.quantity}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center space-x-2">
                      {/* Nút Xem thông tin */}
                      <button 
                        onClick={() => showArentMessage(`Chi tiết: ${p.name} - Giá: ${p.price}`)}
                        className="bg-[#CEAB93] hover:bg-[#AD8B73] text-white px-3 py-1 rounded text-xs font-semibold shadow transition"
                      >
                        Xem
                      </button>
                      {/* Nút Sửa thông tin */}
                      <button 
                        onClick={() => openEditModal(p)}
                        className="bg-[#DFD3C3] hover:bg-[#CEAB93] text-gray-800 px-3 py-1 rounded text-xs font-semibold shadow transition"
                      >
                        Sửa
                      </button>
                      {/* Nút Xóa sản phẩm */}
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold shadow transition"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">Không tìm thấy sản phẩm nào phù hợp!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </main>

      {/* 3.4. Chân trang (Footer) */}
      <footer className="text-center py-6 text-xs text-[#AD8B73] border-t mt-12" style={{ borderColor: '#CEAB93' }}>
        © 2026 - ArentFashion | Hệ thống quản lý đồ án MVP Web Thời Trang Vintage
      </footer>

      {/* 3.5. Hộp thoại Popup Modal (Dùng chung cho Thêm mới & Chỉnh sửa) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border" style={{ borderColor: '#CEAB93' }}>
            <h3 className="text-lg font-bold font-serif mb-4" style={{ color: '#AD8B73' }}>
              {editingId !== null ? 'Chỉnh sửa thông tin sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
            
            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              {/* Nhập Mã sản phẩm kèm hiển thị lỗi màu đỏ nếu sai */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: '#AD8B73' }}>Mã sản phẩm (VD: DR003)</label>
                <input 
                  type="text" 
                  maxLength={5}
                  placeholder="2 chữ hoa + 3 số (Ví dụ: DR003)"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none text-gray-800 ${errors.code ? 'border-red-500 bg-red-50' : ''}`}
                  style={{ borderColor: errors.code ? undefined : '#CEAB93' }}
                />
                {errors.code && <p className="text-xs text-red-600 font-semibold mt-1">{errors.code}</p>}
              </div>

              {/* Nhập Tên trang phục */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: '#AD8B73' }}>Tên trang phục</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Đầm Dạ Hội Cúp Ngực"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none text-gray-800"
                  style={{ borderColor: '#CEAB93' }}
                  required
                />
              </div>

              {/* Lựa chọn Thể loại */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: '#AD8B73' }}>Thể loại</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none bg-white text-gray-800"
                  style={{ borderColor: '#CEAB93' }}
                >
                  <option value="Đầm Dạ Hội">Đầm Dạ Hội</option>
                  <option value="Đầm Maxi">Đầm Maxi</option>
                  <option value="Phụ Kiện">Phụ Kiện</option>
                  <option value="Giày Dạ Tiệc">Giày Dạ Tiệc</option>
                </select>
              </div>

              {/* Nhập Giá sản phẩm kèm hiển thị lỗi màu đỏ nếu nhỏ hơn hoặc bằng 200.000 */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: '#AD8B73' }}>Giá (VNĐ)</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: 350000"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none text-gray-800 ${errors.price ? 'border-red-500 bg-red-50' : ''}`}
                  style={{ borderColor: errors.price ? undefined : '#CEAB93' }}
                />
                {errors.price && <p className="text-xs text-red-600 font-semibold mt-1">{errors.price}</p>}
              </div>

              {/* Nhập Số lượng (cho phép từ 0 trở lên, nếu = 0 sẽ tự hiện trạng thái Hết hàng) */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: '#AD8B73' }}>Số lượng</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none text-gray-800 ${errors.quantity ? 'border-red-500 bg-red-50' : ''}`}
                  style={{ borderColor: errors.quantity ? undefined : '#CEAB93' }}
                />
                {errors.quantity && <p className="text-xs text-red-600 font-semibold mt-1">{errors.quantity}</p>}
              </div>

              {/* Nút bấm Thao tác trong Modal (Hủy & Lưu/Cập nhật) */}
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-white rounded-lg text-sm font-medium shadow transition hover:opacity-90"
                  style={{ backgroundColor: '#AD8B73' }}
                >
                  {editingId !== null ? 'Cập nhật thay đổi' : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;