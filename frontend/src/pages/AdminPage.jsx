import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import logoImg from '../../Pictures/logo.png';

const STATUS_OPTIONS = [
  { value: 1, label: 'Đang bán' },
  { value: 0, label: 'Ngừng bán' }
];

const DEFAULT_CATEGORIES = [
  'Đầm dạ hội dài',
  'Đầm xẻ tà',
  'Đầm công chúa',
  'Áo choàng lông thú'
];

const MAX_IMAGE_SIZE_BYTES = 1.5 * 1024 * 1024;

function AdminPage({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('sanpham');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Form State theo bảng SANPHAM mới (khóa chính: stt, mã SP: ma_sp)
  const [editingStt, setEditingStt] = useState(null);
  const [maSp, setMaSp] = useState('');
  const [tenSp, setTenSp] = useState('');
  const [tenDanhMuc, setTenDanhMuc] = useState(DEFAULT_CATEGORIES[0]);
  const [soLuong, setSoLuong] = useState(1);
  const [giaGoc, setGiaGoc] = useState('');
  const [hinhAnh, setHinhAnh] = useState('');
  const [moTaChiTiet, setMoTaChiTiet] = useState('');
  const [trangThai, setTrangThai] = useState(1);

  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/sanpham');
      if (res.data.success) {
        const sortedData = [...res.data.data].sort((a, b) => Number(a.stt) - Number(b.stt));
        setProducts(sortedData);
      }
    } catch (err) {
      alert('Lỗi tải dữ liệu: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categoryList = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...products.map((item) => item.ten_danh_muc).filter(Boolean)
    ])
  );

  const filteredProducts = products.filter((item) => {
    const keyword = searchTerm.trim().toLowerCase();
    const matchKeyword =
      !keyword ||
      item.ten_sp?.toLowerCase().includes(keyword) ||
      item.ma_sp?.toLowerCase().includes(keyword) ||
      item.ten_danh_muc?.toLowerCase().includes(keyword) ||
      String(item.stt || '').includes(keyword);

    const matchCategory =
      selectedCategory === 'Tất cả' || item.ten_danh_muc === selectedCategory;

    return matchKeyword && matchCategory;
  });

  const totalModels = products.length;
  const activeCount = products.filter((item) => Number(item.trang_thai) === 1).length;
  const inactiveCount = products.filter((item) => Number(item.trang_thai) === 0).length;

  const resetForm = () => {
    setEditingStt(null);
    setMaSp('');
    setTenSp('');
    setTenDanhMuc(DEFAULT_CATEGORIES[0]);
    setSoLuong(1);
    setGiaGoc('');
    setHinhAnh('');
    setMoTaChiTiet('');
    setTrangThai(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh (JPG, PNG, WEBP...)!');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      alert('Ảnh nên nhỏ hơn 1.5MB để lưu ổn định vào cơ sở dữ liệu!');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setHinhAnh(reader.result);
      }
    };
    reader.onerror = () => {
      alert('Không thể đọc file ảnh từ máy tính!');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tenSp.trim() || !giaGoc) {
      return alert('Vui lòng điền đủ Tên sản phẩm và Giá gốc!');
    }

    if (!tenDanhMuc.trim()) {
      return alert('Vui lòng chọn hoặc nhập Tên danh mục!');
    }

    if (Number(giaGoc) < 100000) {
      return alert('Giá sản phẩm phải từ 100.000 đ trở lên!');
    }

    if (Number(soLuong) < 0) {
      return alert('Số lượng không được nhỏ hơn 0!');
    }

    const payload = {
      ...(editingStt ? { ma_sp: maSp.trim().toUpperCase().slice(0, 5) } : {}),
      ten_sp: tenSp.trim(),
      ten_danh_muc: tenDanhMuc.trim(),
      so_luong: Number(soLuong),
      gia_goc: Number(giaGoc),
      hinh_anh: hinhAnh.trim() || null,
      mo_ta_chi_tiet: moTaChiTiet.trim() || null,
      trang_thai: Number(trangThai)
    };

    try {
      if (editingStt) {
        await API.put(`/api/sanpham/${editingStt}`, {
          ...payload,
          ma_sp: maSp.trim() || `SP-${editingStt}`
        });
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await API.post('/api/sanpham', payload);
        alert('Thêm sản phẩm mới thành công!');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (item) => {
    setEditingStt(item.stt);
    setMaSp(item.ma_sp || '');
    setTenSp(item.ten_sp || '');
    setTenDanhMuc(item.ten_danh_muc || DEFAULT_CATEGORIES[0]);
    setSoLuong(item.so_luong ?? 0);
    setGiaGoc(item.gia_goc ?? '');
    setHinhAnh(item.hinh_anh || '');
    setMoTaChiTiet(item.mo_ta_chi_tiet || '');
    setTrangThai(item.trang_thai ?? 1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setActiveMenu('sanpham');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (stt) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await API.delete(`/api/sanpham/${stt}`);
      alert('Xóa thành công!');
      fetchProducts();
    } catch (err) {
      alert('Lỗi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FBF3F1', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', color: '#4B3635' }}>
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
            onClick={() => setActiveMenu('sanpham')}
            style={{
              backgroundColor: activeMenu === 'sanpham' ? '#8A6562' : 'transparent',
              color: '#fff',
              border: activeMenu === 'sanpham' ? 'none' : '1px solid rgba(255,255,255,0.45)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Quản lý Sản Phẩm
          </button>

          {user?.username && (
            <span style={{ fontSize: '13px', opacity: 0.95 }}>
              Admin: <strong>{user.username}</strong>
            </span>
          )}

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
        <header style={{ backgroundColor: '#FFFDFC', padding: '20px 24px', borderRadius: '14px', marginBottom: '24px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ color: '#946C68', fontSize: '26px', fontFamily: 'Georgia, serif', margin: '0 0 6px 0' }}>
              {activeMenu === 'dashboard' ? 'Tổng quan cửa hàng' : 'Quản lý danh mục Sản Phẩm (SANPHAM)'}
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

        {activeMenu === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#FFFDFC', padding: '24px 28px', borderRadius: '12px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#8A6562', fontSize: '20px' }}>
                Chào mừng đến với Arent Fashion Admin
              </h3>
              <p style={{ color: '#735754', margin: '0 0 18px 0', lineHeight: '1.6', fontSize: '14px' }}>
                Quản lý danh sách sản phẩm, giá gốc, danh mục, số lượng và trạng thái kinh doanh trên bảng SANPHAM.
              </p>
              <button
                onClick={() => setActiveMenu('sanpham')}
                style={{ padding: '10px 20px', backgroundColor: '#A9827E', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
              >
                Mở Quản lý Sản Phẩm
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: '#FFFDFC', padding: '20px', borderRadius: '12px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
                <div style={{ fontSize: '13px', color: '#946C68', marginBottom: '6px' }}>Tổng số sản phẩm</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#4B3635' }}>{totalModels}</div>
              </div>

              <div style={{ backgroundColor: '#FFFDFC', padding: '20px', borderRadius: '12px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
                <div style={{ fontSize: '13px', color: '#946C68', marginBottom: '6px' }}>Đang bán</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#2F855A' }}>{activeCount}</div>
              </div>

              <div style={{ backgroundColor: '#FFFDFC', padding: '20px', borderRadius: '12px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
                <div style={{ fontSize: '13px', color: '#946C68', marginBottom: '6px' }}>Ngừng bán</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: inactiveCount > 0 ? '#C53030' : '#4B3635' }}>
                  {inactiveCount}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'sanpham' && (
          <div>
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
                {editingStt ? `Cập nhật sản phẩm STT #${editingStt}` : 'Thêm sản phẩm mới'}
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
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>Tên sản phẩm *</label>
                  <input
                    type="text"
                    value={tenSp}
                    onChange={(e) => setTenSp(e.target.value)}
                    placeholder="VD: Váy Đuôi Cá Ánh Kim..."
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>
                    Mã sản phẩm (ma_sp)
                  </label>
                  <input
                    type="text"
                    value={editingStt ? maSp : ''}
                    readOnly={!editingStt}
                    onChange={(e) => setMaSp(e.target.value.toUpperCase().slice(0, 5))}
                    placeholder={editingStt ? '' : 'Tự động (tối đa 5 ký tự)'}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #DFC9C5',
                      borderRadius: '10px',
                      backgroundColor: editingStt ? '#fff' : '#F6ECEA',
                      color: '#4B3635',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>Tên danh mục *</label>
                  <select
                    value={tenDanhMuc}
                    onChange={(e) => setTenDanhMuc(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    {categoryList.map((dm) => (
                      <option key={dm} value={dm}>
                        {dm}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>Số lượng *</label>
                  <input
                    type="number"
                    min="0"
                    value={soLuong}
                    onChange={(e) => setSoLuong(e.target.value)}
                    placeholder="10"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>Giá gốc (VND) * (≥ 100k)</label>
                  <input
                    type="number"
                    value={giaGoc}
                    onChange={(e) => setGiaGoc(e.target.value)}
                    placeholder="300000"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>Trạng thái</label>
                  <select
                    value={trangThai}
                    onChange={(e) => setTrangThai(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>Hình ảnh</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '9px 14px',
                        backgroundColor: '#946C68',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      + Thêm ảnh
                    </button>

                    {hinhAnh && (
                      <button
                        type="button"
                        onClick={() => {
                          setHinhAnh('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#FFF5F5',
                          color: '#C53030',
                          border: '1px solid #FEB2B2',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Xóa ảnh
                      </button>
                    )}
                  </div>

                  {hinhAnh && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={hinhAnh}
                        alt="Xem trước sản phẩm"
                        style={{
                          width: '54px',
                          height: '68px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #DFC9C5'
                        }}
                      />
                      <span style={{ fontSize: '12px', color: '#735754' }}>
                        {hinhAnh.startsWith('data:image/') ? 'Đã chọn ảnh từ máy' : 'Đã có liên kết ảnh'}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>Mô tả chi tiết</label>
                  <input
                    type="text"
                    value={moTaChiTiet}
                    onChange={(e) => setMoTaChiTiet(e.target.value)}
                    placeholder="Mô tả kiểu dáng, chất liệu cao cấp..."
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {editingStt && (
                  <button type="button" onClick={resetForm} style={{ padding: '10px 22px', backgroundColor: '#BFA19E', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    Hủy
                  </button>
                )}
                <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#A9827E', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  {editingStt ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
              </div>
            </form>

            <div style={{ backgroundColor: '#FFFDFC', padding: '24px', borderRadius: '14px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#8A6562', fontSize: '18px', fontWeight: '700' }}>
                  Danh sách sản phẩm ({filteredProducts.length})
                </h3>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '13px', color: '#4B3635', backgroundColor: '#fff' }}
                  >
                    <option value="Tất cả">Tất cả danh mục</option>
                    {categoryList.map((dm) => (
                      <option key={dm} value={dm}>
                        {dm}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên SP, mã SP, danh mục..."
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
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Mã SP</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Tên sản phẩm</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Danh mục</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Số lượng</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Giá gốc</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Trạng thái</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr><td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Không có sản phẩm nào.</td></tr>
                      ) : (
                        filteredProducts.map((item) => (
                          <tr key={item.stt} style={{ borderBottom: '1px solid #F5ECEA' }}>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>#{item.stt}</td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#4B3635' }}>{item.ma_sp}</td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>
                              <strong style={{ color: '#3B2827' }}>{item.ten_sp}</strong>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>{item.ten_danh_muc || '-'}</td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>{item.so_luong ?? 0}</td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>{Number(item.gia_goc).toLocaleString('vi-VN')} đ</td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>
                              {Number(item.trang_thai) === 0 ? (
                                <span style={{ color: '#C53030', backgroundColor: '#FFF5F5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                  Ngừng bán
                                </span>
                              ) : (
                                <span style={{ color: '#2F855A', backgroundColor: '#E6FFFA', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                  Đang bán
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '14px 16px', display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleEdit(item)} style={{ padding: '6px 12px', backgroundColor: '#D49A42', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Sửa</button>
                              <button onClick={() => handleDelete(item.stt)} style={{ padding: '6px 12px', backgroundColor: '#C95B5B', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Xóa</button>
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