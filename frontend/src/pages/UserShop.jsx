import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import logoImg from '../../Pictures/logo.png';
import heroCardImg from '../assets/figma/hero-card.png';
import floralTlImg from '../assets/figma/floral-tl.png';
import floralBrImg from '../assets/figma/floral-br.png';
import floralDividerImg from '../assets/figma/floral-divider.png';
import catCrownImg from '../assets/figma/cat-crown.png';
import catDressImg from '../assets/figma/cat-dress.png';
import catNecklaceImg from '../assets/figma/cat-necklace.png';
import catBowImg from '../assets/figma/cat-bow.png';
import catEarringImg from '../assets/figma/cat-earring.png';
import catShoesImg from '../assets/figma/cat-shoes.png';
import catDoveImg from '../assets/figma/cat-dove.png';
import sampleDressImg from '../assets/figma/sample-dress.png';

const DRESS_CATEGORIES = ['Tất cả', 'Đuôi cá', 'Đầm Công Chúa', 'Váy Dạ Hội', 'Xẻ tà'];
const ACCESSORY_CATEGORIES = ['Cài tóc', 'Dây chuyền', 'Bông tai', 'Giày'];

function UserShop({ user, onLogout }) {
  const [dresses, setDresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const [openDropdown, setOpenDropdown] = useState(null); // 'home' | 'dress' | 'accessory' | 'account' | null
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const [selectedDress, setSelectedDress] = useState(null);
  const [customerName, setCustomerName] = useState(user?.fullName || user?.username || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [bookingDate, setBookingDate] = useState('');

  const featuredRef = useRef(null);
  const footerRef = useRef(null);

  const fetchDresses = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await API.get('/api/dresses');
      if (res.data.success) {
        const sortedData = res.data.data.sort((a, b) => a.id - b.id);
        setDresses(sortedData);
      }
    } catch (err) {
      setLoadError('Lỗi tải danh sách sản phẩm: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDresses();
  }, []);

  const filteredDresses = dresses.filter((item) => {
    const keyword = searchTerm.trim().toLowerCase();
    const matchName =
      !keyword ||
      item.name?.toLowerCase().includes(keyword) ||
      item.slug?.toLowerCase().includes(keyword) ||
      item.category?.toLowerCase().includes(keyword);
    const matchCategory =
      selectedCategory === 'Tất cả' ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchName && matchCategory;
  });

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setOpenDropdown(null);
    featuredRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddToCart = (item) => {
    setCartItems((prev) => {
      if (prev.some((c) => c.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      return alert('Vui lòng nhập Họ tên và Số điện thoại để đặt lịch!');
    }
    handleAddToCart(selectedDress);
    alert(
      `Đã ghi nhận yêu cầu thử/thuê mẫu "${selectedDress.name}" cho ${customerName} (${customerPhone}). Cửa hàng sẽ liên hệ xác nhận sớm!`
    );
    setSelectedDress(null);
    setBookingDate('');
  };

  const navLinkStyle = {
    background: 'none',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 6px',
    whiteSpace: 'nowrap'
  };

  const dropdownBoxStyle = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    minWidth: '185px',
    backgroundColor: '#FFFDFC',
    border: '1px solid #DFC9C5',
    borderRadius: '10px',
    boxShadow: '0 8px 20px rgba(75, 54, 53, 0.16)',
    padding: '6px',
    zIndex: 60,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FFF2F2',
        color: '#4B3635',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={() => {
        if (openDropdown) setOpenDropdown(null);
      }}
    >
      {/* NAVBAR */}
      <header
        style={{
          backgroundColor: '#AF8383',
          minHeight: '68px',
          padding: '8px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        {/* Cụm trái: Logo vương miện + Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '34px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Tất cả');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Trang chủ Arent Fashion"
          >
            <img
              src={logoImg}
              alt="Arent Fashion Crown"
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            />
          </button>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '26px', flexWrap: 'wrap' }}>
            {/* Trang chủ */}
            <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                style={navLinkStyle}
                onClick={() => setOpenDropdown(openDropdown === 'home' ? null : 'home')}
              >
                <span>Trang chủ</span>
                <span style={{ fontSize: '12px' }}>▼</span>
              </button>
              {openDropdown === 'home' && (
                <div style={dropdownBoxStyle}>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('Tất cả')}
                    style={{
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#4B3635'
                    }}
                  >
                    Tất cả sản phẩm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenDropdown(null);
                      featuredRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#4B3635'
                    }}
                  >
                    Mục nổi bật
                  </button>
                </div>
              )}
            </div>

            {/* Trang phục */}
            <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                style={navLinkStyle}
                onClick={() => setOpenDropdown(openDropdown === 'dress' ? null : 'dress')}
              >
                <span>Trang phục</span>
                <span style={{ fontSize: '12px' }}>▼</span>
              </button>
              {openDropdown === 'dress' && (
                <div style={dropdownBoxStyle}>
                  {DRESS_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      style={{
                        background: selectedCategory === cat ? '#F6EAE8' : 'none',
                        border: 'none',
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#4B3635'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phụ kiện */}
            <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                style={navLinkStyle}
                onClick={() => setOpenDropdown(openDropdown === 'accessory' ? null : 'accessory')}
              >
                <span>Phụ kiện</span>
                <span style={{ fontSize: '12px' }}>▼</span>
              </button>
              {openDropdown === 'accessory' && (
                <div style={dropdownBoxStyle}>
                  {ACCESSORY_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      style={{
                        background: selectedCategory === cat ? '#F6EAE8' : 'none',
                        border: 'none',
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#4B3635'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Liên hệ */}
            <button
              type="button"
              style={navLinkStyle}
              onClick={() => footerRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              Liên hệ
            </button>
          </nav>
        </div>

        {/* Cụm phải: Thanh tìm kiếm + Giỏ hàng + Tài khoản */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              backgroundColor: '#D9D9D9',
              borderRadius: '999px',
              height: '36px',
              width: 'min(310px, 52vw)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              gap: '8px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B3B3B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="arent-nav-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tình yêu muốn kiếm gì ?"
              style={{
                border: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: '13px',
                color: '#2F2F2F',
                outline: 'none'
              }}
            />
          </div>

          {/* Giỏ hàng */}
          <button
            type="button"
            onClick={() => setShowCartModal(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Giỏ đặt lịch"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#1A1A1A">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7.16 14.26l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 3.5H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 14.37 5.48 16 7 16h12v-2H7.42c-.14 0-.25-.11-.26-.24z" />
            </svg>
            {cartItems.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-4px',
                  backgroundColor: '#DB5898',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: '700',
                  borderRadius: '999px',
                  minWidth: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px'
                }}
              >
                {cartItems.length}
              </span>
            )}
          </button>

          {/* Tài khoản */}
          <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'account' ? null : 'account')}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title={user?.username ? `Tài khoản: ${user.username}` : 'Tài khoản'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {openDropdown === 'account' && (
              <div style={{ ...dropdownBoxStyle, left: 'auto', right: 0, minWidth: '190px' }}>
                <div style={{ padding: '8px 12px', fontSize: '13px', color: '#735754', borderBottom: '1px solid #F1E3E0' }}>
                  Xin chào, <strong style={{ color: '#4B3635' }}>{user?.username || 'Khách'}</strong>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    style={{
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#A94442'
                    }}
                  >
                    Đăng xuất
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section
        style={{
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '8px 14px 34px 14px'
        }}
      >
        <div className="arent-hero-layout">
          {/* Cột trái: Thẻ logo Arent Dress Rental */}
          <div
            onClick={() => handleSelectCategory('Tất cả')}
            style={{
              flex: '0 0 auto',
              width: 'min(394px, 100%)',
              cursor: 'pointer'
            }}
          >
            <img
              src={heroCardImg}
              alt="Arent Dress Rental"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '18px'
              }}
            />
          </div>

          {/* Cột phải: Khung hoa hồng & 7 danh mục */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              minHeight: '590px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '16px 40px 20px 40px',
              overflow: 'hidden'
            }}
          >
            {/* Dây hoa góc trên trái */}
            <img
              src={floralTlImg}
              alt=""
              style={{
                position: 'absolute',
                top: '12px',
                left: '4px',
                width: 'min(295px, 34%)',
                height: 'auto',
                pointerEvents: 'none',
                zIndex: 0
              }}
            />

            {/* Dây hoa góc dưới phải */}
            <img
              src={floralBrImg}
              alt=""
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: 'min(305px, 35%)',
                height: 'auto',
                pointerEvents: 'none',
                zIndex: 0
              }}
            />

            {/* Hàng 1: CÀI TÓC (Vương miện) & TRANG PHỤC (Váy) */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: 'clamp(44px, 8vw, 110px)',
                paddingLeft: 'min(140px, 14%)',
                paddingRight: 'min(80px, 8%)'
              }}
            >
              <button type="button" className="arent-category-item" onClick={() => handleSelectCategory('Cài tóc')}>
                <img src={catCrownImg} alt="Cài tóc" style={{ width: '152px', maxWidth: '28vw', height: 'auto' }} />
                <span className="arent-category-label">CÀI TÓC</span>
              </button>

              <button type="button" className="arent-category-item" onClick={() => handleSelectCategory('Tất cả')}>
                <img src={catDressImg} alt="Trang phục" style={{ width: '154px', maxWidth: '28vw', height: 'auto' }} />
                <span className="arent-category-label">TRANG PHỤC</span>
              </button>
            </div>

            {/* Hàng 2: DÂY CHUYỀN, CÀI TÓC (Nơ), BÔNG TAI */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: 'clamp(28px, 6vw, 86px)',
                paddingLeft: 'min(70px, 6%)',
                paddingRight: 'min(40px, 4%)'
              }}
            >
              <button type="button" className="arent-category-item" onClick={() => handleSelectCategory('Dây chuyền')}>
                <img src={catNecklaceImg} alt="Dây chuyền" style={{ width: '148px', maxWidth: '25vw', height: 'auto' }} />
                <span className="arent-category-label">DÂY CHUYỀN</span>
              </button>

              <button type="button" className="arent-category-item" onClick={() => handleSelectCategory('Cài tóc')}>
                <img src={catBowImg} alt="Cài tóc" style={{ width: '158px', maxWidth: '26vw', height: 'auto' }} />
                <span className="arent-category-label">CÀI TÓC</span>
              </button>

              <button type="button" className="arent-category-item" onClick={() => handleSelectCategory('Bông tai')}>
                <img src={catEarringImg} alt="Bông tai" style={{ width: '146px', maxWidth: '25vw', height: 'auto' }} />
                <span className="arent-category-label">BÔNG TAI</span>
              </button>
            </div>

            {/* Hàng 3: GIÀY & CÀI TÓC (Bồ câu) */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: 'clamp(44px, 9vw, 130px)',
                paddingRight: 'min(90px, 8%)'
              }}
            >
              <button type="button" className="arent-category-item" onClick={() => handleSelectCategory('Giày')}>
                <img src={catShoesImg} alt="Giày" style={{ width: '164px', maxWidth: '28vw', height: 'auto' }} />
                <span className="arent-category-label">GIÀY</span>
              </button>

              <button type="button" className="arent-category-item" onClick={() => handleSelectCategory('Cài tóc')}>
                <img src={catDoveImg} alt="Cài tóc" style={{ width: '160px', maxWidth: '28vw', height: 'auto' }} />
                <span className="arent-category-label">CÀI TÓC</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DẢI HOA & TIÊU ĐỀ MỤC NỔI BẬT */}
      <main
        ref={featuredRef}
        style={{
          width: '100%',
          maxWidth: '1260px',
          margin: '0 auto',
          padding: '44px 28px 96px 28px',
          flex: 1
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <img
            src={floralDividerImg}
            alt=""
            style={{
              width: 'min(900px, 92%)',
              height: 'auto',
              display: 'block',
              margin: '0 auto 22px auto'
            }}
          />

          {/* Tiêu đề lớp đôi MỤC NỔI BẬT */}
          <div style={{ position: 'relative', display: 'inline-block', userSelect: 'none' }}>
            <div
              aria-hidden="true"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(42px, 5vw, 66px)',
                fontWeight: '700',
                letterSpacing: '3px',
                color: 'rgba(115, 58, 62, 0.16)',
                lineHeight: 1,
                transform: 'translateY(10px) scale(1.06)',
                whiteSpace: 'nowrap'
              }}
            >
              MỤC NỔI BẬT
            </div>
            <h2
              style={{
                position: 'relative',
                margin: 0,
                marginTop: '-42px',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(36px, 4.3vw, 54px)',
                fontWeight: '700',
                letterSpacing: '2px',
                color: '#733A3E',
                lineHeight: 1.05
              }}
            >
              MỤC NỔI BẬT
            </h2>
          </div>

          {/* Thanh hiển thị bộ lọc hiện tại nếu người dùng đang lọc */}
          {(selectedCategory !== 'Tất cả' || searchTerm.trim() !== '') && (
            <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {selectedCategory !== 'Tất cả' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Tất cả')}
                  style={{
                    backgroundColor: '#AF8383',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Danh mục: {selectedCategory} ✕
                </button>
              )}
              {searchTerm.trim() !== '' && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    backgroundColor: '#D9D9D9',
                    color: '#3B2827',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Tìm: "{searchTerm}" ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* DANH SÁCH SẢN PHẨM */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#735754', fontSize: '16px' }}>Đang tải bộ sưu tập...</p>
        ) : loadError ? (
          <div style={{ backgroundColor: '#FFFDFC', padding: '32px', border: '1px solid #DFC9C5', textAlign: 'center', color: '#A94442' }}>
            <p style={{ margin: '0 0 12px 0' }}>{loadError}</p>
            <button
              type="button"
              onClick={fetchDresses}
              style={{
                backgroundColor: '#AF8383',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '999px',
                padding: '8px 20px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Thử lại
            </button>
          </div>
        ) : filteredDresses.length === 0 ? (
          <div style={{ backgroundColor: '#FFFDFC', padding: '44px 24px', border: '1px solid #DFC9C5', textAlign: 'center', color: '#735754' }}>
            <p style={{ margin: '0 0 14px 0', fontSize: '16px' }}>
              Chưa có sản phẩm phù hợp với "{selectedCategory !== 'Tất cả' ? selectedCategory : searchTerm}".
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Tất cả');
                setSearchTerm('');
              }}
              style={{
                backgroundColor: '#AF8383',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '999px',
                padding: '9px 22px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Xem tất cả mẫu
            </button>
          </div>
        ) : (
          <section className="arent-product-grid">
            {filteredDresses.map((item) => {
              const isOut = Number(item.stock_quantity) <= 0;

              return (
                <article
                  key={item.id}
                  className="arent-product-card"
                  onClick={() => setSelectedDress(item)}
                >
                  <div>
                    <div
                      style={{
                        width: '76%',
                        margin: '0 auto',
                        aspectRatio: '3 / 4',
                        overflow: 'hidden',
                        backgroundColor: '#FAF5F0',
                        position: 'relative'
                      }}
                    >
                      <img
                        src={item.image_url || item.image || sampleDressImg}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      {isOut && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: 'rgba(197, 48, 48, 0.9)',
                            color: '#FFFFFF',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}
                        >
                          Hết hàng
                        </span>
                      )}
                    </div>

                    <h3
                      style={{
                        margin: '24px 18px 18px 18px',
                        fontSize: '16px',
                        fontWeight: '600',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        color: '#1A1A1A',
                        lineHeight: 1.4
                      }}
                    >
                      {item.name}
                    </h3>
                  </div>

                  <div
                    style={{
                      padding: '0 16px 16px 16px',
                      textAlign: 'right',
                      fontSize: '17px',
                      fontWeight: '800',
                      color: '#DB5898'
                    }}
                  >
                    {Number(item.price).toLocaleString('vi-VN')}VND
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer
        ref={footerRef}
        style={{
          backgroundColor: '#D6C5BE',
          minHeight: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 24px',
          color: '#5C4341',
          fontSize: '13px',
          fontWeight: '600'
        }}
      >
        <span>Arent Fashion Dress Rental • Liên hệ tư vấn & đặt lịch thử váy</span>
      </footer>

      {/* MODAL CHI TIẾT & ĐẶT LỊCH THỬ VÁY */}
      {selectedDress && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(59, 40, 39, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 80
          }}
          onClick={() => setSelectedDress(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFDFC',
              borderRadius: '18px',
              border: '2px solid #AF8383',
              maxWidth: '450px',
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 6px 0', color: '#733A3E', fontSize: '21px', fontFamily: "'Playfair Display', Georgia, serif" }}>
              Đặt lịch thử váy dạ hội
            </h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4B3635' }}>
              Mẫu đã chọn: <strong>{selectedDress.name}</strong> ({selectedDress.slug})
            </p>
            <p style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: '700', color: '#DB5898' }}>
              {Number(selectedDress.price).toLocaleString('vi-VN')}VND
            </p>
            {selectedDress.description && (
              <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#735754', lineHeight: 1.5 }}>
                {selectedDress.description}
              </p>
            )}

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '700', color: '#634846' }}>
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nhập họ tên"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '700', color: '#634846' }}>
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="090..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '700', color: '#634846' }}>
                  Ngày dự kiến ghé cửa hàng
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDress(null)}
                  style={{ padding: '9px 18px', backgroundColor: '#D6C5BE', color: '#4B3635', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: '700' }}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart(selectedDress);
                    setSelectedDress(null);
                  }}
                  style={{ padding: '9px 18px', backgroundColor: '#F6E8DA', color: '#733A3E', border: '1px solid #AF8383', borderRadius: '999px', cursor: 'pointer', fontWeight: '700' }}
                >
                  Lưu vào giỏ
                </button>
                <button
                  type="submit"
                  disabled={Number(selectedDress.stock_quantity) <= 0}
                  style={{
                    padding: '9px 20px',
                    backgroundColor: Number(selectedDress.stock_quantity) <= 0 ? '#D6C6C4' : '#CD9593',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '999px',
                    cursor: Number(selectedDress.stock_quantity) <= 0 ? 'not-allowed' : 'pointer',
                    fontWeight: '700'
                  }}
                >
                  {Number(selectedDress.stock_quantity) <= 0 ? 'Hết hàng' : 'Xác nhận đặt lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GIỎ ĐẶT LỊCH */}
      {showCartModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(59, 40, 39, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 80
          }}
          onClick={() => setShowCartModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFDFC',
              borderRadius: '18px',
              border: '2px solid #AF8383',
              maxWidth: '440px',
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 14px 0', color: '#733A3E', fontSize: '20px', fontFamily: "'Playfair Display', Georgia, serif" }}>
              Mẫu đã chọn ({cartItems.length})
            </h3>
            {cartItems.length === 0 ? (
              <p style={{ color: '#735754', fontSize: '14px' }}>Chưa có mẫu nào trong giỏ của bạn.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: '#FFF2F2',
                      borderRadius: '10px',
                      gap: '10px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{item.name}</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#DB5898' }}>
                        {Number(item.price).toLocaleString('vi-VN')}VND
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCartItems((prev) => prev.filter((c) => c.id !== item.id))}
                      style={{ background: 'none', border: 'none', color: '#A94442', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowCartModal(false)}
                style={{ padding: '8px 20px', backgroundColor: '#AF8383', color: '#fff', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: '700' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserShop;
