import { useState, useEffect } from 'react';
import API from '../api/axios';
import logoImg from '../../Pictures/logo.png';

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
    <div style={{ minHeight: '100vh', backgroundColor: '#FBF3F1', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', color: '#4B3635' }}>
      <header style={{ backgroundColor: '#A9827E', color: '#fff', padding: '14px 28px', boxShadow: '0 2px 10px rgba(75, 54, 53, 0.14)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.8px', cursor: 'pointer' }}
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('Tất cả');
          }}
        >
          <img
            src={logoImg}
            alt="Arent Fashion Logo"
            style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
          />
          <span>Arent Fashion</span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user?.username && (
            <span style={{ fontSize: '13px', opacity: 0.95 }}>
              Xin chào, <strong>{user.username}</strong>
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
        <section style={{ backgroundColor: '#FFFDFC', padding: '30px 26px', borderRadius: '14px', marginBottom: '24px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)', textAlign: 'center' }}>
          <h1 style={{ color: '#8A6562', fontSize: '30px', fontFamily: 'Georgia, serif', margin: '0 0 10px 0' }}>
            Bộ Sưu Tập Váy Dạ Hội Arent Fashion
          </h1>
          <p style={{ color: '#735754', margin: '0 auto', maxWidth: '640px', fontSize: '15px', lineHeight: '1.6' }}>
            Lựa chọn mẫu váy dạ hội phù hợp cho buổi tiệc hoặc sự kiện của bạn và đặt lịch thử váy nhanh chóng.
          </p>
        </section>

        <section style={{ backgroundColor: '#FFFDFC', padding: '18px 22px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #E6D5D2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Tất cả', 'Đuôi cá', 'Đầm Công Chúa', 'Váy Dạ Hội', 'Xẻ tà'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: selectedCategory === cat ? 'none' : '1px solid #DFC9C5',
                  backgroundColor: selectedCategory === cat ? '#A9827E' : '#FFFDFC',
                  color: selectedCategory === cat ? '#fff' : '#634846',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
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
            style={{ padding: '9px 14px', border: '1px solid #DFC9C5', borderRadius: '8px', width: '260px', fontSize: '14px', color: '#4B3635', backgroundColor: '#fff' }}
          />
        </section>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#735754' }}>Đang tải bộ sưu tập...</p>
        ) : filteredDresses.length === 0 ? (
          <div style={{ backgroundColor: '#FFFDFC', padding: '40px', borderRadius: '12px', border: '1px solid #E6D5D2', textAlign: 'center', color: '#735754' }}>
            Không tìm thấy mẫu váy phù hợp.
          </div>
        ) : (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
            {filteredDresses.map((item) => {
              const isOut = Number(item.stock_quantity) <= 0;
              const isLow = Number(item.stock_quantity) > 0 && Number(item.stock_quantity) <= 5;

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#FFFDFC',
                    borderRadius: '14px',
                    border: '1px solid #E6D5D2',
                    boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#8A6562', backgroundColor: '#F6EAE8', padding: '4px 10px', borderRadius: '6px' }}>
                        {item.category}
                      </span>

                      {isOut ? (
                        <span style={{ color: '#C53030', backgroundColor: '#FFF5F5', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                          Hết hàng
                        </span>
                      ) : isLow ? (
                        <span style={{ color: '#B7791F', backgroundColor: '#FEFCBF', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                          Sắp hết ({item.stock_quantity})
                        </span>
                      ) : (
                        <span style={{ color: '#2F855A', backgroundColor: '#E6FFFA', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                          Còn hàng ({item.stock_quantity})
                        </span>
                      )}
                    </div>

                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#3B2827', fontFamily: 'Georgia, serif' }}>
                      {item.name}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#9C7874', marginBottom: '12px' }}>
                      Mã mẫu: {item.slug}
                    </div>

                    <p style={{ fontSize: '14px', color: '#735754', lineHeight: '1.5', margin: '0 0 16px 0', minHeight: '42px' }}>
                      {item.description || 'Thiết kế dạ hội cao cấp, tôn dáng sang trọng.'}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid #F5ECEA', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#9C7874' }}>Giá thuê / bán</div>
                      <div style={{ fontSize: '17px', fontWeight: '700', color: '#8A6562' }}>
                        {Number(item.price).toLocaleString('vi-VN')} đ
                      </div>
                    </div>

                    <button
                      disabled={isOut}
                      onClick={() => setSelectedDress(item)}
                      style={{
                        padding: '9px 14px',
                        backgroundColor: isOut ? '#D6C6C4' : '#A9827E',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: isOut ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isOut ? 'Hết hàng' : 'Đặt lịch thử'}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {selectedDress && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(59, 40, 39, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
            <div style={{ backgroundColor: '#FFFDFC', borderRadius: '14px', border: '1px solid #E6D5D2', maxWidth: '440px', width: '100%', padding: '24px 28px', boxShadow: '0 10px 30px rgba(0,0,0,0.18)' }}>
              <h3 style={{ margin: '0 0 6px 0', color: '#8A6562', fontSize: '20px', fontFamily: 'Georgia, serif' }}>
                Đặt lịch thử váy dạ hội
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#735754' }}>
                Mẫu đã chọn: <strong>{selectedDress.name}</strong> ({selectedDress.slug}) –{' '}
                {Number(selectedDress.price).toLocaleString('vi-VN')} đ
              </p>

              <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>Họ và tên *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nhập họ tên"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>Số điện thoại *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="090..."
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>Ngày dự kiến ghé cửa hàng</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedDress(null)}
                    style={{ padding: '9px 18px', backgroundColor: '#BFA19E', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '9px 20px', backgroundColor: '#A9827E', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                  >
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