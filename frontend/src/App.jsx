import { useState, useEffect } from 'react';
import API from './api/axios';

function App() {
  const [activeMenu, setActiveMenu] = useState('dresses');
  const [dresses, setDresses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Đuôi cá');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState(5);
  const [description, setDescription] = useState('');

  const fetchDresses = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/dresses');
      if (res.data.success) {
        const sortedData = res.data.data.sort((a, b) => b.id - a.id);
        
        setDresses(sortedData);
      }
    } catch (err) {
      alert('Lỗi tải dữ liệu: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === 'dresses') fetchDresses();
  }, [activeMenu]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);

    if (!editingId) {
      const lowerName = val.toLowerCase();
      let prefix = 'SP'; // Mặc định nếu không phải ren hay lụa

      // Kiểm tra loại sản phẩm để gán tiền tố chuẩn 2 ký tự
      if (lowerName.includes('ren')) {
        prefix = 'VR'; // Váy Ren -> VR
      } else if (lowerName.includes('lụa') || lowerName.includes('lua')) {
        prefix = 'DL'; // Đầm Lụa -> DL
      } else if (lowerName.includes('dạ hội') || lowerName.includes('da hoi')) {
        prefix = 'DH'; // Dạ Hội -> DH
      }

      // Lấy ngẫu nhiên hoặc tạo số thứ tự 3 chữ số ngẫu nhiên từ 001-999 (hoặc bạn có thể tối ưu theo ý muốn)
      // Để đảm bảo dưới 5 ký tự (VD: VR001 tối đa đúng 5 ký tự)
      const randomNum = Math.floor(Math.random() * 900) + 100; // Số từ 100 đến 999
      const generatedSlug = `${prefix}${randomNum}`.substring(0, 5); // Cắt chặt không bao giờ vượt quá 5 ký tự

      setSlug(generatedSlug);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setCategory('Đuôi cá');
    setPrice('');
    setStockQuantity(5);
    setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !slug || !price) return alert('Vui lòng điền đủ Tên, Slug và Giá!');

    // KIỂM TRA GIÁ PHẢI TRÊN 100.000 đ
    if (Number(price) < 100000) {
      return alert('Giá sản phẩm phải từ 100.000 đ trở lên!');
    }

    const payload = {
      name,
      slug,
      category,
      price: Number(price),
      stock_quantity: Number(stockQuantity),
      description
    };

    try {
      if (editingId) {
        await API.put(`/api/dresses/${editingId}`, payload);
        alert('Cập nhật váy dạ hội thành công!');
      } else {
        await API.post('/api/dresses', payload);
        alert('Thêm mẫu váy mới thành công!');
      }
      resetForm();
      fetchDresses();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

    try {
      if (editingId) {
        await API.put(`/api/dresses/${editingId}`, payload);
        alert('Cập nhật váy dạ hội thành công!');
      } else {
        await API.post('/api/dresses', payload);
        alert('Thêm mẫu váy mới thành công!');
      }
      resetForm();
      fetchDresses();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setCategory(item.category || 'Đuôi cá');
    setPrice(item.price);
    setStockQuantity(item.stock_quantity);
    setDescription(item.description || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa mẫu váy này?')) return;
    try {
      await API.delete(`/api/dresses/${id}`);
      alert('Xóa thành công!');
      fetchDresses();
    } catch (err) {
      alert('Lỗi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#EDE6DC', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', color: '#4A3828' }}>
      {/* NAVBAR NGAN PHIA TREN */}
      <header style={{ backgroundColor: '#9C7E65', color: '#fff', padding: '14px 24px', boxShadow: '0 2px 8px rgba(74, 56, 40, 0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px', cursor: 'pointer' }} onClick={() => setActiveMenu('dashboard')}>
          <span>👑</span> Arent Fashion
        </div>
        <nav style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveMenu('dresses')}
            style={{
              backgroundColor: activeMenu === 'dresses' ? '#7D624C' : 'transparent',
              color: '#fff',
              border: activeMenu === 'dresses' ? 'none' : '1px solid rgba(255,255,255,0.4)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Quản lý Váy Dạ Hội
          </button>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <header style={{ backgroundColor: '#FAF7F2', padding: '20px 24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #DCD2C6', boxShadow: '0 4px 12px rgba(92, 70, 52, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: '#9C7E65', fontSize: '26px', fontFamily: 'Georgia, serif', margin: '0 0 6px 0' }}>
              {activeMenu === 'dashboard' ? 'Tổng quan cửa hàng dạ hội' : 'Quản lý danh mục Váy Dạ Hội'}
            </h2>
            <p style={{ color: '#6E5846', margin: 0, fontSize: '14px' }}>Hệ thống quản trị sản phẩm thời trang cao cấp Arent Fashion.</p>
          </div>
          {activeMenu !== 'dashboard' && (
            <button
              onClick={() => setActiveMenu('dashboard')}
              style={{ padding: '8px 16px', backgroundColor: '#FAF7F2', color: '#7A5E46', border: '1px solid #CFC3B4', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
            >
              Về Dashboard
            </button>
          )}
        </header>

        {activeMenu === 'dashboard' && (
          <div style={{ backgroundColor: '#FAF7F2', padding: '2.5rem', borderRadius: '12px', border: '1px solid #DCD2C6', boxShadow: '0 4px 12px rgba(92, 70, 52, 0.05)' }}>
            <h3 style={{ marginBottom: '0.75rem', color: '#7A5E46', fontSize: '20px' }}>Chào mừng đến với Arent Fashion Admin</h3>
            <p style={{ color: '#6E5846', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Hệ thống quản lý cửa hàng thời trang cao cấp kết nối trực tiếp với cơ sở dữ liệu trên mây. Nhấn vào nút bên dưới để bắt đầu quản lý danh mục sản phẩm váy dạ hội.
            </p>
            <button
              onClick={() => setActiveMenu('dresses')}
              style={{ padding: '10px 22px', backgroundColor: '#9C7E65', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              Mở Quản lý Váy Dạ Hội
            </button>
          </div>
        )}

        {activeMenu === 'dresses' && (
          <div>
            {/* FORM CRUD */}
            <form onSubmit={handleSubmit} style={{ backgroundColor: '#FAF7F2', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #DCD2C6', boxShadow: '0 4px 12px rgba(92, 70, 52, 0.05)' }}>
              <h3 style={{ marginBottom: '20px', color: '#7A5E46', fontSize: '18px', fontWeight: '700' }}>
                {editingId ? `Cập nhật mẫu váy #${editingId}` : 'Thêm mẫu váy dạ hội mới'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#5C4634' }}>Tên váy *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="VD: Váy kim sa cúp ngực"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CFC3B4', borderRadius: '8px', backgroundColor: '#fff', color: '#3D2E22', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#5C4634' }}>Slug *</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="vay-kim-sa-cup-nguc"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CFC3B4', borderRadius: '8px', backgroundColor: '#fff', color: '#3D2E22', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#5C4634' }}>Kiểu dáng</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CFC3B4', borderRadius: '8px', backgroundColor: '#fff', color: '#3D2E22', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    <option value="Đuôi cá">Đuôi cá</option>
                    <option value="Đầm Công Chúa">Đầm Công Chúa</option>
                    <option value="Váy Dạ Hội">Váy Dạ Hội</option>
                    <option value="Xẻ tà">Xẻ tà</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#5C4634' }}>Giá thuê/bán (VND) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="3000000"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CFC3B4', borderRadius: '8px', backgroundColor: '#fff', color: '#3D2E22', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#5C4634' }}>Số lượng</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CFC3B4', borderRadius: '8px', backgroundColor: '#fff', color: '#3D2E22', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#5C4634' }}>Mô tả</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Chất liệu cao cấp..."
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CFC3B4', borderRadius: '8px', backgroundColor: '#fff', color: '#3D2E22', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ padding: '10px 22px', backgroundColor: '#9C7E65', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} style={{ padding: '10px 22px', backgroundColor: '#8C7765', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    Hủy
                  </button>
                )}
              </div>
            </form>

            {/* BẢNG HIỂN THỊ */}
            <div style={{ backgroundColor: '#FAF7F2', padding: '24px', borderRadius: '12px', border: '1px solid #DCD2C6', boxShadow: '0 4px 12px rgba(92, 70, 52, 0.05)' }}>
              <h3 style={{ marginBottom: '20px', color: '#7A5E46', fontSize: '18px', fontWeight: '700' }}>Danh sách mẫu váy dạ hội</h3>
              {loading ? (
                <p style={{ color: '#6E5846' }}>Đang tải dữ liệu...</p>
              ) : (
                <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #DCD2C6' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#9C7E65', color: '#fff' }}>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>ID</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Tên váy</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Kiểu dáng</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Giá</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Tồn kho</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dresses.length === 0 ? (
                        <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Chưa có mẫu váy nào.</td></tr>
                      ) : (
                        dresses.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #EFE9E1' }}>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4A3828' }}>{item.id}</td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4A3828' }}>
                              <strong style={{ color: '#3D2E22' }}>{item.name}</strong>
                              <div style={{ fontSize: '12px', color: '#8C7765' }}>{item.slug}</div>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4A3828' }}>{item.category}</td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4A3828' }}>{Number(item.price).toLocaleString('vi-VN')} đ</td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4A3828' }}>{item.stock_quantity}</td>
                            <td style={{ padding: '14px 16px', display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleEdit(item)} style={{ padding: '6px 12px', backgroundColor: '#D49A42', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Sửa</button>
                              <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 12px', backgroundColor: '#C95B5B', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Xóa</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;