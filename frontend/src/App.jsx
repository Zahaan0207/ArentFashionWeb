import { useState, useEffect } from 'react';
import API from './api/axios';

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
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
      if (res.data.success) setDresses(res.data.data);
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
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
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

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setCategory(item.category);
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fdf2f8' }}>
      {/* SIDEBAR */}
      <aside style={{ width: '260px', backgroundColor: '#831843', color: '#fff', padding: '1.5rem 1rem' }}>
        <div
          onClick={() => setActiveMenu('dashboard')}
          style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '2rem', padding: '0 0.75rem', cursor: 'pointer', letterSpacing: '1px' }}
        >
          ✨ Evening Gown Admin
        </div>
        <nav>
          <button
            onClick={() => setActiveMenu('dresses')}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '500',
              backgroundColor: activeMenu === 'dresses' ? '#be185d' : 'transparent',
              color: '#fff'
            }}
          >
            Quản lý Váy Dạ Hội
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '2rem' }}>
        <header style={{ backgroundColor: '#fff', padding: '1rem 1.5rem', borderRadius: '8px', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#831843', fontSize: '1.25rem' }}>
            {activeMenu === 'dashboard' ? 'Tổng quan cửa hàng dạ hội' : 'Quản lý danh mục Váy Dạ Hội'}
          </h2>
          {activeMenu !== 'dashboard' && (
            <button
              onClick={() => setActiveMenu('dashboard')}
              style={{ padding: '0.4rem 0.9rem', backgroundColor: '#fbcfe8', color: '#831843', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Về Dashboard
            </button>
          )}
        </header>

        {activeMenu === 'dashboard' && (
          <div style={{ backgroundColor: '#fff', padding: '2.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '0.75rem', color: '#831843' }}>Hệ thống quản lý Shop Váy Dạ Hội</h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Chào mừng bạn đến với trang quản trị cửa hàng thời trang cao cấp. Nhấn vào mục <strong>Quản lý Váy Dạ Hội</strong> bên trái để thao tác CRUD sản phẩm.
            </p>
            <button
              onClick={() => setActiveMenu('dresses')}
              style={{ padding: '0.65rem 1.25rem', backgroundColor: '#be185d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
              Mở Quản lý Váy Dạ Hội
            </button>
          </div>
        )}

        {activeMenu === 'dresses' && (
          <div>
            {/* FORM CRUD */}
            <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '1rem', color: '#831843', fontSize: '1.05rem' }}>
                {editingId ? `Cập nhật mẫu váy #${editingId}` : 'Thêm mẫu váy dạ hội mới'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Tên váy *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="VD: Váy kim sa cúp ngực"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Slug *</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="vay-kim-sa-cup-nguc"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Kiểu dáng</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  >
                    <option value="Đuôi cá">Đuôi cá</option>
                    <option value="Công chúa">Công chúa</option>
                    <option value="Xẻ đùi">Xẻ đùi</option>
                    <option value="Cúp ngực">Cúp ngực</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Giá thuê/bán (VND) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="3000000"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Số lượng</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Mô tả</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Chất liệu cao cấp..."
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div>
                <button type="submit" style={{ padding: '0.5rem 1.25rem', backgroundColor: '#be185d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem', fontWeight: '500' }}>
                  {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} style={{ padding: '0.5rem 1.25rem', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Hủy
                  </button>
                )}
              </div>
            </form>

            {/* BẢNG HIỂN THỊ */}
            <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '1rem', color: '#831843', fontSize: '1.05rem' }}>Danh sách mẫu váy dạ hội</h3>
              {loading ? (
                <p>Đang tải dữ liệu...</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fdf2f8', borderBottom: '2px solid #fbcfe8' }}>
                      <th style={{ padding: '0.75rem', color: '#831843' }}>ID</th>
                      <th style={{ padding: '0.75rem', color: '#831843' }}>Tên váy</th>
                      <th style={{ padding: '0.75rem', color: '#831843' }}>Kiểu dáng</th>
                      <th style={{ padding: '0.75rem', color: '#831843' }}>Giá</th>
                      <th style={{ padding: '0.75rem', color: '#831843' }}>Tồn kho</th>
                      <th style={{ padding: '0.75rem', color: '#831843' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dresses.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Chưa có mẫu váy nào.</td></tr>
                    ) : (
                      dresses.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.75rem' }}>{item.id}</td>
                          <td style={{ padding: '0.75rem' }}><strong>{item.name}</strong><div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.slug}</div></td>
                          <td style={{ padding: '0.75rem' }}>{item.category}</td>
                          <td style={{ padding: '0.75rem' }}>{Number(item.price).toLocaleString('vi-VN')} đ</td>
                          <td style={{ padding: '0.75rem' }}>{item.stock_quantity}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <button onClick={() => handleEdit(item)} style={{ marginRight: '0.5rem', padding: '0.35rem 0.75rem', backgroundColor: '#d97706', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sửa</button>
                            <button onClick={() => handleDelete(item.id)} style={{ padding: '0.35rem 0.75rem', backgroundColor: '#e11d48', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;