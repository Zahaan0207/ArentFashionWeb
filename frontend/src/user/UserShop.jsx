import { useState, useEffect } from 'react';
import API from '../api/axios';
import logoImg from '../../Pictures/logo.png';
import './UserShop.css';

function UserShop({ user, onLogout }) {
  const [dresses, setDresses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const [selectedDress, setSelectedDress] = useState(null);
  const [customerName, setCustomerName] = useState(user?.username || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');

  const fetchDresses = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/dresses');
      if (res.data.success) {
        const sortedData = res.data.data.sort((a, b) => a.id - b.id);
        setDresses(sortedData);
      }
    } catch (err) {
      alert('Lỗi tải danh sách váy: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDresses();
  }, []);

  const filteredDresses = dresses.filter((item) => {
    const matchName =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      selectedCategory === 'Tất cả' || item.category === selectedCategory;
    return matchName && matchCategory;
  });

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      return alert('Vui lòng nhập Họ tên và Số điện thoại để đặt lịch!');
    }
    alert(
      `Đã ghi nhận yêu cầu thử/thuê mẫu "${selectedDress.name}" cho ${customerName} (${customerPhone}). Cửa hàng sẽ liên hệ xác nhận sớm!`
    );
    setSelectedDress(null);
    setCustomerPhone('');
    setBookingDate('');
  };

  return (
    <div className="user-shop">
      {/* NAVBAR KHÁCH HÀNG */}
      <header className="user-navbar">
        <div
          className="user-brand"
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('Tất cả');
          }}
        >
          <img src={logoImg} alt="Arent Fashion Logo" />
          <span>Arent Fashion</span>
        </div>

        <nav className="user-nav-actions">
          {user?.username && (
            <span className="user-greeting">
              Xin chào, <strong>{user.username}</strong>
            </span>
          )}
          {onLogout && (
            <button onClick={onLogout} className="user-logout-btn">
              Đăng xuất
            </button>
          )}
        </nav>
      </header>

      {/* NỘI DUNG CỬA HÀNG */}
      <main className="user-main">
        <section className="user-hero">
          <h1>Bộ Sưu Tập Váy Dạ Hội Arent Fashion</h1>
          <p>
            Lựa chọn mẫu váy dạ hội phù hợp cho buổi tiệc hoặc sự kiện của bạn và đặt lịch thử váy nhanh chóng.
          </p>
        </section>

        {/* LỌC KIỂU DÁNG & TÌM KIẾM */}
        <section className="user-filter-bar">
          <div className="user-category-list">
            {['Tất cả', 'Đuôi cá', 'Đầm Công Chúa', 'Váy Dạ Hội', 'Xẻ tà'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`user-category-btn ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên váy hoặc mã mẫu..."
            className="user-search-input"
          />
        </section>

        {/* DANH SÁCH VÁY */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#735754' }}>Đang tải bộ sưu tập...</p>
        ) : filteredDresses.length === 0 ? (
          <div className="user-empty-box">Không tìm thấy mẫu váy phù hợp.</div>
        ) : (
          <section className="user-dress-grid">
            {filteredDresses.map((item) => {
              const qty = Number(item.stock_quantity);
              const isOut = qty <= 0;
              const isLow = qty > 0 && qty <= 5;

              return (
                <div key={item.id} className="user-dress-card">
                  <div>
                    <div className="user-card-top">
                      <span className="user-category-tag">{item.category}</span>

                      {isOut ? (
                        <span className="user-stock-badge out">Hết hàng</span>
                      ) : isLow ? (
                        <span className="user-stock-badge low">Sắp hết ({qty})</span>
                      ) : (
                        <span className="user-stock-badge in">Còn hàng ({qty})</span>
                      )}
                    </div>

                    <h3 className="user-dress-title">{item.name}</h3>
                    <div className="user-dress-slug">Mã mẫu: {item.slug}</div>

                    <p className="user-dress-desc">
                      {item.description || 'Thiết kế dạ hội cao cấp, tôn dáng sang trọng.'}
                    </p>
                  </div>

                  <div className="user-card-footer">
                    <div>
                      <div className="user-price-label">Giá thuê / bán</div>
                      <div className="user-price-value">
                        {Number(item.price).toLocaleString('vi-VN')} đ
                      </div>
                    </div>

                    <button
                      disabled={isOut}
                      onClick={() => setSelectedDress(item)}
                      className="user-book-btn"
                    >
                      {isOut ? 'Hết hàng' : 'Đặt lịch thử'}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* MODAL ĐẶT LỊCH THỬ VÁY */}
        {selectedDress && (
          <div className="user-modal-backdrop">
            <div className="user-modal-card">
              <h3 className="user-modal-title">Đặt lịch thử váy dạ hội</h3>
              <p className="user-modal-subtitle">
                Mẫu đã chọn: <strong>{selectedDress.name}</strong> ({selectedDress.slug}) –{' '}
                {Number(selectedDress.price).toLocaleString('vi-VN')} đ
              </p>

              <form onSubmit={handleBookingSubmit} className="user-modal-form">
                <div>
                  <label className="user-modal-label">Họ và tên *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nhập họ tên"
                    className="user-modal-input"
                  />
                </div>

                <div>
                  <label className="user-modal-label">Số điện thoại *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="090..."
                    className="user-modal-input"
                  />
                </div>

                <div>
                  <label className="user-modal-label">Ngày dự kiến ghé cửa hàng</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="user-modal-input"
                  />
                </div>

                <div className="user-modal-actions">
                  <button
                    type="button"
                    onClick={() => setSelectedDress(null)}
                    className="user-modal-close-btn"
                  >
                    Đóng
                  </button>
                  <button type="submit" className="user-modal-submit-btn">
                    Xác nhận đặt lịch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default UserShop;