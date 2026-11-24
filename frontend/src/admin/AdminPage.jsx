import { useState, useEffect } from 'react';
import API from '../api/axios';
import logoImg from '../../Pictures/logo.png';
import './AdminPage.css';

function AdminPage({ onLogout }) {
  const [activeMenu, setActiveMenu] = useState('dresses');
  const [dresses, setDresses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tìm kiếm & lọc trong bảng quản lý
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

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
        // Sắp xếp ID tăng dần: Thêm trước nằm trên (STT 1, 2...), thêm sau nằm dưới
        const sortedData = res.data.data.sort((a, b) => a.id - b.id);
        setDresses(sortedData);
      }
    } catch (err) {
      alert('Lỗi tải dữ liệu: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDresses();
  }, []);

  // Lọc danh sách váy theo từ khóa và kiểu dáng
  const filteredDresses = dresses.filter((item) => {
    const matchName =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      selectedCategory === 'Tất cả' || item.category === selectedCategory;
    return matchName && matchCategory;
  });

  // Tính nhanh số liệu tổng quan từ dữ liệu thực tế
  const totalModels = dresses.length;
  const totalStock = dresses.reduce((sum, item) => sum + Number(item.stock_quantity || 0), 0);
  const outOfStockCount = dresses.filter(item => Number(item.stock_quantity) <= 0).length;

  // Tự động sinh Slug: Lấy ký tự đầu viết hoa + Tăng dần số thứ tự (01, 02...)
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);

    if (!editingId) {
      const normalized = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd');

      const words = normalized.trim().split(/\s+/);
      let prefix = words.map(word => word.charAt(0).toUpperCase()).join('');

      if (!prefix) prefix = 'SP';

      const existingCount = dresses.filter(item =>
        item.slug && item.slug.toUpperCase().startsWith(prefix)
      ).length;

      const nextNumber = existingCount + 1;
      const formattedNum = String(nextNumber).padStart(2, '0');

      const generatedSlug = `${prefix}${formattedNum}`;
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

    // Ràng buộc giá sản phẩm phải từ 100.000 đ trở lên
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

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setCategory(item.category || 'Đuôi cá');
    setPrice(item.price);
    setStockQuantity(item.stock_quantity);
    setDescription(item.description || '');
    setActiveMenu('dresses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="admin-page" style={{ minHeight: '100vh', backgroundColor: '#FBF3F1', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', color: '#4B3635' }}>
      {/* NAVBAR NGANG PHÍA TRÊN */}
      <header style={{ backgroundColor: '#A9827E', color: '#fff', padding: '14px 28px', boxShadow: '0 2px 10px rgba(75, 54, 53, 0.14)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.8px', cursor: 'pointer' }} onClick={() => setActiveMenu('dashboard')}>
          <img
            src={logoImg}
            alt="Arent Fashion Logo"
            style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
          />
          <span>Arent Fashion</span>
        </div>

        <nav style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveMenu('dashboard')}
            style={{
              backgroundColor: activeMenu === 'dashboard' ? '#8A6562' : 'transparent',
              color: '#fff',
              border: activeMenu === 'dashboard' ? 'none' : '1px solid rgba(255,255,255,0.45)',
              padding: '8px 14px',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveMenu('dresses')}
            style={{
              backgroundColor: activeMenu === 'dresses' ? '#8A6562' : 'transparent',
              color: '#fff',
              border: activeMenu === 'dresses' ? 'none' : '1px solid rgba(255,255,255,0.45)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Quản lý Váy Dạ Hội
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                backgroundColor: '#73504D',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                padding: '8px 14px',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Đăng xuất
            </button>
          )}
        </nav>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* HEADER TRANG */}
        <header style={{ backgroundColor: '#FFFDFC', padding: '20px 24px', borderRadius: '14px', marginBottom: '24px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ color: '#946C68', fontSize: '26px', fontFamily: 'Georgia, serif', margin: '0 0 6px 0' }}>
              {activeMenu === 'dashboard' ? 'Tổng quan cửa hàng dạ hội' : 'Quản lý danh mục Váy Dạ Hội'}
            </h2>
            <p style={{ color: '#735754', margin: 0, fontSize: '14px' }}>
              Hệ thống quản trị sản phẩm thời trang cao cấp Arent Fashion.
            </p>
          </div>
          {activeMenu !== 'dashboard' && (
            <button
              onClick={() => setActiveMenu('dashboard')}
              style={{ padding: '8px 16px', backgroundColor: '#FFFDFC', color: '#8A6562', border: '1px solid #D9C3BF', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              ← Trở về trang trước
            </button>
          )}
        </header>

        {/* GIAO DIỆN DASHBOARD ĐƠN GIẢN */}
        {activeMenu === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Khung chào mừng */}
            <div style={{ backgroundColor: '#FFFDFC', padding: '24px 28px', borderRadius: '12px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#8A6562', fontSize: '20px' }}>
                Chào mừng đến với Arent Fashion Admin
              </h3>
              <p style={{ color: '#735754', margin: '0 0 18px 0', lineHeight: '1.6', fontSize: '14px' }}>
                Quản lý danh sách váy dạ hội, giá thuê/bán và số lượng tồn kho của cửa hàng.
              </p>
              <button
                onClick={() => setActiveMenu('dresses')}
                style={{ padding: '10px 20px', backgroundColor: '#A9827E', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                Mở Quản lý Váy Dạ Hội
              </button>
            </div>

            {/* 3 ô thống kê đơn giản */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: '#FFFDFC', padding: '20px', borderRadius: '12px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
                <div style={{ fontSize: '13px', color: '#946C68', marginBottom: '6px' }}>Tổng số mẫu váy</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#4B3635' }}>{totalModels}</div>
              </div>

              <div style={{ backgroundColor: '#FFFDFC', padding: '20px', borderRadius: '12px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
                <div style={{ fontSize: '13px', color: '#946C68', marginBottom: '6px' }}>Tổng tồn kho</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#4B3635' }}>{totalStock}</div>
              </div>

              <div style={{ backgroundColor: '#FFFDFC', padding: '20px', borderRadius: '12px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
                <div style={{ fontSize: '13px', color: '#946C68', marginBottom: '6px' }}>Mẫu hết hàng</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: outOfStockCount > 0 ? '#C53030' : '#4B3635' }}>
                  {outOfStockCount}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GIAO DIỆN QUẢN LÝ VÁY DẠ HỘI */}
        {activeMenu === 'dresses' && (
          <div>
            {/* FORM CRUD (3 CỘT x 2 HÀNG + NÚT GÓC DƯỚI BÊN PHẢI) */}
            <form
              onSubmit={handleSubmit}
              style={{
                backgroundColor: '#FFFDFC',
                padding: '24px 28px',
                borderRadius: '14px',
                marginBottom: '24px',
                border: '1px solid #E6D5D2',
                boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)'
              }}
            >
              <h3 style={{ marginBottom: '20px', color: '#8A6562', fontSize: '18px', fontWeight: '700' }}>
                {editingId ? `Cập nhật mẫu váy #${editingId}` : 'Thêm mẫu váy dạ hội mới'}
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '18px 24px',
                  marginBottom: '22px'
                }}
              >
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>Tên váy *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="VD: Váy nhung, Đầm lụa..."
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>Slug * (Tự động tăng dần)</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="VN01, DL01..."
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>Kiểu dáng</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    <option value="Đuôi cá">Đuôi cá</option>
                    <option value="Đầm Công Chúa">Đầm Công Chúa</option>
                    <option value="Váy Dạ Hội">Váy Dạ Hội</option>
                    <option value="Xẻ tà">Xẻ tà</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>Giá thuê/bán (VND) * (≥ 100k)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="300000"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>Số lượng</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>Mô tả</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Chất liệu cao cấp..."
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {editingId && (
                  <button type="button" onClick={resetForm} style={{ padding: '10px 22px', backgroundColor: '#BFA19E', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    Hủy
                  </button>
                )}
                <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#A9827E', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
              </div>
            </form>

            {/* BẢNG HIỂN THỊ + TÌM KIẾM */}
            <div style={{ backgroundColor: '#FFFDFC', padding: '24px', borderRadius: '14px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#8A6562', fontSize: '18px', fontWeight: '700' }}>
                  Danh sách mẫu váy dạ hội ({filteredDresses.length})
                </h3>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '13px', color: '#4B3635', backgroundColor: '#fff' }}
                  >
                    <option value="Tất cả">Tất cả kiểu dáng</option>
                    <option value="Đuôi cá">Đuôi cá</option>
                    <option value="Đầm Công Chúa">Đầm Công Chúa</option>
                    <option value="Váy Dạ Hội">Váy Dạ Hội</option>
                    <option value="Xẻ tà">Xẻ tà</option>
                  </select>

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên váy / slug..."
                    style={{ padding: '8px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '13px', color: '#4B3635', backgroundColor: '#fff' }}
                  />
                </div>
              </div>

              {loading ? (
                <p style={{ color: '#735754' }}>Đang tải dữ liệu...</p>
              ) : (
                <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #E6D5D2' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#A9827E', color: '#fff' }}>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>STT</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Tên váy</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Kiểu dáng</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Giá</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Tồn kho</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDresses.length === 0 ? (
                        <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Không có mẫu váy nào.</td></tr>
                      ) : (
                        filteredDresses.map((item, index) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #F5ECEA' }}>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>{index + 1}</td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>
                              <strong style={{ color: '#3B2827' }}>{item.name}</strong>
                              <div style={{ fontSize: '12px', color: '#9C7874' }}>{item.slug}</div>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>{item.category}</td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>{Number(item.price).toLocaleString('vi-VN')} đ</td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>
                              {Number(item.stock_quantity) <= 0 ? (
                                <span style={{ color: '#C53030', backgroundColor: '#FFF5F5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                  Hết hàng
                                </span>
                              ) : Number(item.stock_quantity) <= 5 ? (
                                <span style={{ color: '#B7791F', backgroundColor: '#FEFCBF', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                  Sắp hết ({item.stock_quantity})
                                </span>
                              ) : (
                                <span style={{ color: '#2F855A', backgroundColor: '#E6FFFA', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                  Còn hàng ({item.stock_quantity})
                                </span>
                              )}
                            </td>
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

export default AdminPage;