import React, { useState, useEffect } from 'react';
import axiosClient from './api/axiosClient'; // Sử dụng axiosClient đã cấu hình sẵn baseURL

const API_URL = '/san-phams';

function App() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '', category: 'Đầm Dạ Hội', price: '', quantity: 1 });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  // Gọi API lấy danh sách sản phẩm khi mở trang
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axiosClient.get(API_URL);
      setProducts(response.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      showArentMessage('Không thể kết nối đến Backend Laravel!');
    }
  };

  const showArentMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 800);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ code: '', name: '', category: 'Đầm Dạ Hội', price: '', quantity: 1 });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    const rawPrice = product.price.toString().replace(/[^0-9]/g, '');
    setFormData({
      code: product.code,
      name: product.name,
      category: product.category,
      price: rawPrice,
      quantity: product.quantity
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Xử lý Lưu / Cập nhật sản phẩm gửi lên Laravel API
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    let newErrors = {};

    const codeRegex = /^[A-Z]{2}[0-9]{3}$/;
    if (!codeRegex.test(formData.code.trim())) {
      newErrors.code = 'Mã phải đúng 5 ký tự: 2 chữ in hoa đầu + 3 số cuối (VD: DR003)';
    }

    const rawPriceNum = Number(formData.price.toString().replace(/[^0-9]/g, ''));
    if (isNaN(rawPriceNum) || rawPriceNum <= 200000) {
      newErrors.price = 'Giá sản phẩm phải lớn hơn 200.000 ₫!';
    }

    const qtyNum = Number(formData.quantity);
    if (isNaN(qtyNum) || qtyNum < 0) {
      newErrors.quantity = 'Số lượng sản phẩm không được nhỏ hơn 0!';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        category: formData.category,
        price: rawPriceNum,
        quantity: qtyNum
      };

      if (editingId !== null) {
        await axiosClient.put(`${API_URL}/${editingId}`, payload);
        showArentMessage(`Đã cập nhật sản phẩm ${payload.code} thành công!`);
      } else {
        await axiosClient.post(API_URL, payload);
        showArentMessage('Thêm sản phẩm mới thành công!');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const laravelErrors = error.response.data.errors;
        let formattedErrors = {};
        if (laravelErrors.code) formattedErrors.code = laravelErrors.code[0];
        if (laravelErrors.price) formattedErrors.price = laravelErrors.price[0];
        if (laravelErrors.quantity) formattedErrors.quantity = laravelErrors.quantity[0];
        setErrors(formattedErrors);
      } else {
        showArentMessage('Có lỗi xảy ra khi lưu dữ liệu!');
      }
    }
  };

  // Xóa sản phẩm qua API
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      try {
        await axiosClient.delete(`${API_URL}/${id}`);
        showArentMessage('Đã xóa sản phẩm thành công!');
        fetchProducts();
      } catch (error) {
        showArentMessage('Không thể xóa sản phẩm!');
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen font-sans text-[#AD8B73]" style={{ backgroundColor: '#E7DECF' }}>
      
      {message && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="bg-white px-8 py-4 rounded-2xl shadow-2xl border-2 flex items-center gap-3" style={{ borderColor: '#AD8B73', color: '#AD8B73' }}>
            <span className="font-extrabold tracking-wide">✨ ARENT FASHION:</span>
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      <header className="text-white shadow-md" style={{ backgroundColor: '#AD8B73' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-xl font-bold tracking-wider text-[#FFFBE9]">ARENT FASHION (FULLSTACK)</span>
          <nav className="space-x-6 text-sm font-medium">
            <a href="#" className="text-[#FFFBE9] font-semibold underline underline-offset-4">Quản lý sản phẩm</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold font-serif" style={{ color: '#AD8B73' }}>Quản lý sản phẩm</h1>
            <p className="text-sm text-[#7D5A50]">Hệ thống Fullstack kết nối React với Laravel Database.</p>
          </div>
          <button 
            onClick={openAddModal}
            className="text-white px-4 py-2 rounded-lg font-medium shadow transition flex items-center gap-2 hover:opacity-90"
            style={{ backgroundColor: '#AD8B73' }}
          >
            + Thêm sản phẩm
          </button>
        </div>

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
                filteredProducts.map((p) => {
                  const displayPrice = Number(p.price).toLocaleString('vi-VN') + ' ₫';
                  return (
                    <tr key={p.id} className="hover:bg-[#E7DECF]/40 transition">
                      <td className="py-3 px-4 font-semibold text-[#7D5A50]">{p.code}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{p.name}</td>
                      <td className="py-3 px-4 text-[#AD8B73]">{p.category}</td>
                      <td className="py-3 px-4 font-bold" style={{ color: '#AD8B73' }}>{displayPrice}</td>
                      <td className="py-3 px-4 text-center font-bold text-gray-700">{p.quantity}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {p.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <button 
                          onClick={() => openEditModal(p)}
                          className="bg-[#DFD3C3] hover:bg-[#CEAB93] text-gray-800 px-3 py-1 rounded text-xs font-semibold shadow transition"
                        >
                          Sửa
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold shadow transition"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">Chưa có sản phẩm nào trong cơ sở dữ liệu!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-[#AD8B73] border-t mt-12" style={{ borderColor: '#CEAB93' }}>
        © 2026 - ArentFashion | Fullstack React & Laravel
      </footer>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border" style={{ borderColor: '#CEAB93' }}>
            <h3 className="text-lg font-bold font-serif mb-4" style={{ color: '#AD8B73' }}>
              {editingId !== null ? 'Chỉnh sửa thông tin sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
            
            <form onSubmit={handleSaveProduct} className="space-y-4">
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