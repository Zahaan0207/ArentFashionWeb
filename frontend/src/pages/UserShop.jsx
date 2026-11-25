import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import logoImg from '../../Pictures/logo.png';
import sampleDressImg from '../../Pictures/DDCAK.jpg';
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

const DRESS_CATEGORIES = ['Tất cả', 'Đầm dạ hội dài', 'Đầm xẻ tà', 'Đầm công chúa', 'Áo choàng lông thú'];
const ACCESSORY_CATEGORIES = ['Cài tóc', 'Dây chuyền', 'Bông tai', 'Giày'];
const PHONE_REGEX = /^0\d{9}$/;

function UserShop({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const [openDropdown, setOpenDropdown] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState(user?.fullName || user?.username || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState('');

  const featuredRef = useRef(null);
  const footerRef = useRef(null);

  const fetchProducts = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await API.get('/api/sanpham');
      if (res.data.success) {
        const sortedData = [...res.data.data].sort((a, b) => Number(a.stt) - Number(b.stt));
        setProducts(sortedData);
      }
    } catch (err) {
      setLoadError('Lỗi tải danh sách sản phẩm: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((item) => {
    const keyword = searchTerm.trim().toLowerCase();
    const matchKeyword =
      !keyword ||
      item.ten_sp?.toLowerCase().includes(keyword) ||
      item.ma_sp?.toLowerCase().includes(keyword) ||
      item.ten_danh_muc?.toLowerCase().includes(keyword) ||
      item.mo_ta_chi_tiet?.toLowerCase().includes(keyword);

    const matchCategory =
      selectedCategory === 'Tất cả' ||
      String(item.ten_danh_muc || '').toLowerCase() === selectedCategory.toLowerCase() ||
      item.ten_sp?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      item.mo_ta_chi_tiet?.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchKeyword && matchCategory;
  });

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setOpenDropdown(null);
    featuredRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cartItems.reduce((sum, item) => sum + Number(item.gia_goc) * item.quantity, 0);

  const handleAddToCart = (item, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((c) => c.stt === item.stt);
      if (existing) {
        return prev.map((c) => (c.stt === item.stt ? { ...c, quantity: c.quantity + qty } : c));
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const handleUpdateCartQty = (stt, delta) => {
    setCartItems((prev) =>
      prev
        .map((c) => (c.stt === stt ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const validateOrderForm = () => {
    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      alert('Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng!');
      return false;
    }
    if (!PHONE_REGEX.test(customerPhone.trim())) {
      alert('Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0!');
      return false;
    }
    return true;
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || submittingOrder) return;
    if (!validateOrderForm()) return;

    setSubmittingOrder(true);
    try {
      const res = await API.post('/api/donhang', {
        userId: user?.id,
        userEmail: user?.username,
        nguoi_nhan: customerName.trim(),
        sdt_nhan: customerPhone.trim(),
        dia_chi_giao: shippingAddress.trim(),
        phuong_thuc_tt: 'COD',
        phi_van_chuyen: 0,
        items: [
          {
            stt: selectedProduct.stt,
            so_luong: quantity
          }
        ]
      });

      if (res.data.success) {
        const orderTotal = res.data.data?.tong_thanh_toan ?? Number(selectedProduct.gia_goc) * quantity;
        alert(
          `Đặt mua thành công đơn #${res.data.data?.ma_dh} (${quantity}x "${selectedProduct.ten_sp}", ${Number(orderTotal).toLocaleString('vi-VN')}VND) cho ${customerName.trim()} (${customerPhone.trim()}) tại "${shippingAddress.trim()}". Cửa hàng sẽ sớm giao hàng cho bạn!`
        );
        setSelectedProduct(null);
        setQuantity(1);
        setShippingAddress('');
      }
    } catch (err) {
      alert('Đặt hàng thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleCartCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0 || submittingOrder) return;
    if (!validateOrderForm()) return;

    setSubmittingOrder(true);
    try {
      const res = await API.post('/api/donhang', {
        userId: user?.id,
        userEmail: user?.username,
        nguoi_nhan: customerName.trim(),
        sdt_nhan: customerPhone.trim(),
        dia_chi_giao: shippingAddress.trim(),
        phuong_thuc_tt: 'COD',
        phi_van_chuyen: 0,
        items: cartItems.map((item) => ({
          stt: item.stt,
          so_luong: item.quantity
        }))
      });

      if (res.data.success) {
        const orderTotal = res.data.data?.tong_thanh_toan ?? totalCartAmount;
        alert(
          `Đặt mua thành công đơn #${res.data.data?.ma_dh} (${totalCartCount} sản phẩm, ${Number(orderTotal).toLocaleString('vi-VN')}VND) cho ${customerName.trim()} (${customerPhone.trim()}) tại "${shippingAddress.trim()}". Cửa hàng sẽ sớm giao hàng cho bạn!`
        );
        setCartItems([]);
        setShowCartModal(false);
        setShippingAddress('');
      }
    } catch (err) {
      alert('Đặt hàng thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingOrder(false);
    }
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
    minWidth: '195px',
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

            <button
              type="button"
              style={navLinkStyle}
              onClick={() => footerRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              Liên hệ
            </button>
          </nav>
        </div>

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
            title="Giỏ hàng"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#1A1A1A">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7.16 14.26l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 3.5H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 14.37 5.48 16 7 16h12v-2H7.42c-.14 0-.25-.11-.26-.24z" />
            </svg>
            {totalCartCount > 0 && (
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
                {totalCartCount}
              </span>
            )}
          </button>

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
              onClick={fetchProducts}
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
        ) : filteredProducts.length === 0 ? (
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
            {filteredProducts.map((item) => {
              const isInactive = Number(item.trang_thai) === 0;

              return (
                <article
                  key={item.stt}
                  className="arent-product-card"
                  onClick={() => {
                    setQuantity(1);
                    setSelectedProduct(item);
                  }}
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
                        src={item.hinh_anh || sampleDressImg}
                        alt={item.ten_sp}
                        onError={(e) => {
                          if (e.currentTarget.src !== sampleDressImg) {
                            e.currentTarget.src = sampleDressImg;
                          }
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      {isInactive && (
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
                          Ngừng bán
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
                      {item.ten_sp}
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
                    {Number(item.gia_goc).toLocaleString('vi-VN')}VND
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
        <span>Arent Fashion • Cửa hàng thời trang & phụ kiện cao cấp</span>
      </footer>

      {/* MODAL CHI TIẾT & ĐẶT MUA SẢN PHẨM */}
      {selectedProduct && (
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
          onClick={() => setSelectedProduct(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFDFC',
              borderRadius: '18px',
              border: '2px solid #AF8383',
              maxWidth: '460px',
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 6px 0', color: '#733A3E', fontSize: '21px', fontFamily: "'Playfair Display', Georgia, serif" }}>
              Đặt mua sản phẩm
            </h3>
            <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#4B3635' }}>
              Sản phẩm: <strong>{selectedProduct.ten_sp}</strong> (Mã SP: {selectedProduct.ma_sp})
            </p>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#735754' }}>
              {selectedProduct.ten_danh_muc ? `Danh mục: ${selectedProduct.ten_danh_muc}` : ''}
              {selectedProduct.ten_danh_muc && selectedProduct.so_luong !== undefined ? ' • ' : ''}
              {selectedProduct.so_luong !== undefined ? `Còn: ${selectedProduct.so_luong}` : ''}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#DB5898' }}>
                {Number(selectedProduct.gia_goc).toLocaleString('vi-VN')}VND
              </span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: Number(selectedProduct.trang_thai) !== 0 ? '#2F855A' : '#C53030' }}>
                {Number(selectedProduct.trang_thai) !== 0 ? 'Đang bán' : 'Ngừng bán'}
              </span>
            </div>
            {selectedProduct.mo_ta_chi_tiet && (
              <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#735754', lineHeight: 1.5 }}>
                {selectedProduct.mo_ta_chi_tiet}
              </p>
            )}

            <form onSubmit={handlePurchaseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
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
                <div style={{ width: '96px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '700', color: '#634846' }}>
                    Số lượng
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    style={{ width: '100%', padding: '10px 10px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '700', color: '#634846' }}>
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="090..."
                  maxLength={10}
                  inputMode="numeric"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '700', color: '#634846' }}>
                  Địa chỉ giao hàng *
                </label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #F1E3E0' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#634846' }}>Tổng thanh toán:</span>
                <span style={{ fontSize: '17px', fontWeight: '800', color: '#DB5898' }}>
                  {(Number(selectedProduct.gia_goc) * quantity).toLocaleString('vi-VN')}VND
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  style={{ padding: '9px 18px', backgroundColor: '#D6C5BE', color: '#4B3635', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: '700' }}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={Number(selectedProduct.trang_thai) === 0 || submittingOrder}
                  onClick={() => {
                    handleAddToCart(selectedProduct, quantity);
                    setSelectedProduct(null);
                  }}
                  style={{
                    padding: '9px 18px',
                    backgroundColor: '#F6E8DA',
                    color: '#733A3E',
                    border: '1px solid #AF8383',
                    borderRadius: '999px',
                    cursor: Number(selectedProduct.trang_thai) === 0 || submittingOrder ? 'not-allowed' : 'pointer',
                    fontWeight: '700'
                  }}
                >
                  Thêm vào giỏ
                </button>
                <button
                  type="submit"
                  disabled={Number(selectedProduct.trang_thai) === 0 || submittingOrder}
                  style={{
                    padding: '9px 22px',
                    backgroundColor: Number(selectedProduct.trang_thai) === 0 || submittingOrder ? '#D6C6C4' : '#CD9593',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '999px',
                    cursor: Number(selectedProduct.trang_thai) === 0 || submittingOrder ? 'not-allowed' : 'pointer',
                    fontWeight: '700'
                  }}
                >
                  {Number(selectedProduct.trang_thai) === 0 ? 'Ngừng bán' : submittingOrder ? 'Đang đặt...' : 'Mua ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GIỎ HÀNG */}
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
              maxWidth: '470px',
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 14px 0', color: '#733A3E', fontSize: '20px', fontFamily: "'Playfair Display', Georgia, serif" }}>
              Giỏ hàng của bạn ({totalCartCount})
            </h3>
            {cartItems.length === 0 ? (
              <p style={{ color: '#735754', fontSize: '14px' }}>Chưa có sản phẩm nào trong giỏ hàng.</p>
            ) : (
              <form onSubmit={handleCartCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
                  {cartItems.map((item) => (
                    <div
                      key={item.stt}
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
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{item.ten_sp}</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#DB5898' }}>
                          {Number(item.gia_goc).toLocaleString('vi-VN')}VND
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQty(item.stt, -1)}
                          style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #AF8383', background: '#fff', cursor: 'pointer', fontWeight: '700' }}
                        >
                          -
                        </button>
                        <span style={{ minWidth: '18px', textAlign: 'center', fontWeight: '700', fontSize: '13px' }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQty(item.stt, 1)}
                          style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #AF8383', background: '#fff', cursor: 'pointer', fontWeight: '700' }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCartItems((prev) => prev.filter((c) => c.stt !== item.stt))}
                        style={{ background: 'none', border: 'none', color: '#A94442', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>

                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Họ và tên người nhận *"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '13px' }}
                />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Số điện thoại *"
                  maxLength={10}
                  inputMode="numeric"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '13px' }}
                />
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Địa chỉ giao hàng *"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '13px' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #F1E3E0' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#634846' }}>Tổng cộng:</span>
                  <span style={{ fontSize: '17px', fontWeight: '800', color: '#DB5898' }}>
                    {totalCartAmount.toLocaleString('vi-VN')}VND
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCartModal(false)}
                    style={{ padding: '8px 18px', backgroundColor: '#D6C5BE', color: '#4B3635', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: '700' }}
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={submittingOrder}
                    style={{
                      padding: '8px 22px',
                      backgroundColor: submittingOrder ? '#D6C6C4' : '#CD9593',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '999px',
                      cursor: submittingOrder ? 'not-allowed' : 'pointer',
                      fontWeight: '700'
                    }}
                  >
                    {submittingOrder ? 'Đang đặt...' : 'Đặt mua tất cả'}
                  </button>
                </div>
              </form>
            )}
            {cartItems.length === 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowCartModal(false)}
                  style={{ padding: '8px 20px', backgroundColor: '#AF8383', color: '#fff', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: '700' }}
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserShop;