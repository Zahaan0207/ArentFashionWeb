import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import logoImg from '../../Pictures/logo.png';

const STATUS_OPTIONS = [
  { value: 1, label: 'Đang bán' },
  { value: 0, label: 'Ngừng bán' }
];

const USER_STATUS_OPTIONS = [
  { value: 1, label: 'Hoạt động' },
  { value: 0, label: 'Khóa / Ngừng hoạt động' }
];

const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin (Quản trị viên)', bg: '#FED7D7', color: '#9B2C2C' },
  { value: 'QuanLy', label: 'Quản lý', bg: '#E9D8FD', color: '#553C9A' },
  { value: 'NVBanHang', label: 'NV Bán hàng', bg: '#BEE3F8', color: '#2B6CB0' },
  { value: 'NVKho', label: 'NV Kho', bg: '#FEFCBF', color: '#975A16' },
  { value: 'KhachHang', label: 'Khách hàng', bg: '#C6F6D5', color: '#276749' }
];

const ORDER_STATUS_OPTIONS = [
  { value: 'ChoXacNhan', label: 'Chờ xác nhận', bg: '#FEFCBF', color: '#B7791F' },
  { value: 'DaXacNhan', label: 'Đã xác nhận', bg: '#BEE3F8', color: '#2B6CB0' },
  { value: 'DangGiao', label: 'Đang giao hàng', bg: '#E9D8FD', color: '#553C9A' },
  { value: 'HoanThanh', label: 'Hoàn thành', bg: '#E6FFFA', color: '#2F855A' },
  { value: 'DaHuy', label: 'Đã hủy', bg: '#FFF5F5', color: '#C53030' }
];

const PAYMENT_METHODS = ['COD', 'Chuyển khoản', 'Ví MoMo'];

const DEFAULT_CATEGORIES = [
  'Đầm dạ hội dài',
  'Đầm xẻ tà',
  'Đầm công chúa',
  'Áo choàng lông thú'
];

const MAX_IMAGE_SIZE_BYTES = 1.5 * 1024 * 1024;
const PHONE_REGEX = /^0\d{9}$/;

const formatTitleCase = (str) =>
  String(str || '')
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toLocaleUpperCase('vi-VN') +
        word.slice(1).toLocaleLowerCase('vi-VN')
    )
    .join(' ');

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

function AdminPage({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('sanpham');

  // --- STATE SẢN PHẨM ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const [editingStt, setEditingStt] = useState(null);
  const [editingDisplayStt, setEditingDisplayStt] = useState(null);
  const [maSp, setMaSp] = useState('');
  const [tenSp, setTenSp] = useState('');
  const [tenDanhMuc, setTenDanhMuc] = useState(DEFAULT_CATEGORIES[0]);
  const [soLuong, setSoLuong] = useState(1);
  const [giaGoc, setGiaGoc] = useState('');
  const [hinhAnh, setHinhAnh] = useState('');
  const [moTaChiTiet, setMoTaChiTiet] = useState('');
  const [trangThai, setTrangThai] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);

  const fileInputRef = useRef(null);

  // --- STATE ĐƠN HÀNG ---
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('Tất cả');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // State modal Sửa đơn hàng (chỉ mở khi đơn ở trạng thái ChoXacNhan)
  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderName, setEditOrderName] = useState('');
  const [editOrderPhone, setEditOrderPhone] = useState('');
  const [editOrderAddress, setEditOrderAddress] = useState('');
  const [editOrderPayment, setEditOrderPayment] = useState('COD');
  const [editOrderShipFee, setEditOrderShipFee] = useState(0);
  const [savingOrderEdit, setSavingOrderEdit] = useState(false);

  // --- STATE NGƯỜI DÙNG ---
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('Tất cả');

  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserOrder, setEditingUserOrder] = useState(null);
  const [hoTen, setHoTen] = useState('');
  const [emailUser, setEmailUser] = useState('');
  const [matKhauUser, setMatKhauUser] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dienThoaiUser, setDienThoaiUser] = useState('');
  const [diaChiUser, setDiaChiUser] = useState('');
  const [tenVaiTro, setTenVaiTro] = useState('KhachHang');
  const [trangThaiUser, setTrangThaiUser] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/sanpham');
      if (res.data.success) {
        const sortedData = [...res.data.data].sort((a, b) => Number(a.stt) - Number(b.stt));
        setProducts(sortedData);
      }
    } catch (err) {
      alert('Lỗi tải dữ liệu sản phẩm: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await API.get('/api/donhang');
      if (res.data.success) {
        const sortedOrders = [...res.data.data].sort((a, b) => Number(a.ma_dh) - Number(b.ma_dh));
        setOrders(sortedOrders);
      }
    } catch (err) {
      alert('Lỗi tải danh sách đơn hàng: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await API.get('/api/nguoidung');
      if (res.data.success) {
        const sortedUsers = [...res.data.data].sort((a, b) => Number(a.ma_nd) - Number(b.ma_nd));
        setUsers(sortedUsers);
      }
    } catch (err) {
      alert('Lỗi tải danh sách người dùng: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchUsers();
  }, []);

  // --- LOGIC SẢN PHẨM ---
  const categoryList = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...products.map((item) => item.ten_danh_muc).filter(Boolean)
    ])
  );

  const productsWithOrder = products.map((item, idx) => ({
    ...item,
    displayStt: idx + 1
  }));

  const filteredProducts = productsWithOrder.filter((item) => {
    const keyword = searchTerm.trim().toLowerCase();
    const matchKeyword =
      !keyword ||
      item.ten_sp?.toLowerCase().includes(keyword) ||
      item.ma_sp?.toLowerCase().includes(keyword) ||
      item.ten_danh_muc?.toLowerCase().includes(keyword) ||
      String(item.displayStt).includes(keyword);

    const matchCategory =
      selectedCategory === 'Tất cả' || item.ten_danh_muc === selectedCategory;

    return matchKeyword && matchCategory;
  });

  const totalModels = products.length;
  const activeCount = products.filter((item) => Number(item.trang_thai) === 1).length;
  const pendingOrderCount = orders.filter((o) => o.trang_thai_dh === 'ChoXacNhan').length;
  const totalRevenue = orders
    .filter((o) => o.trang_thai_dh !== 'DaHuy')
    .reduce((sum, o) => sum + Number(o.tong_thanh_toan || 0), 0);

  const resetForm = () => {
    setEditingStt(null);
    setEditingDisplayStt(null);
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
    const formattedTenSp = formatTitleCase(tenSp);

    if (!formattedTenSp || !giaGoc) {
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
      ten_sp: formattedTenSp,
      ten_danh_muc: tenDanhMuc.trim(),
      so_luong: Number(soLuong),
      gia_goc: Number(giaGoc),
      hinh_anh: hinhAnh.trim() || null,
      mo_ta_chi_tiet: moTaChiTiet.trim() || null,
      trang_thai: Number(trangThai)
    };

    try {
      if (editingStt) {
        await API.put(`/api/sanpham/${editingStt}`, payload);
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
    setEditingDisplayStt(item.displayStt);
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

  const renderProductStatusBadge = (item) => {
    const qty = Number(item.so_luong ?? 0);
    const isStopped = Number(item.trang_thai) === 0;

    if (isStopped) {
      return (
        <span style={{ color: '#4A5568', backgroundColor: '#EDF2F7', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', whiteSpace: 'nowrap' }}>
          Ngừng bán ({qty})
        </span>
      );
    }

    if (qty <= 0) {
      return (
        <span style={{ color: '#C53030', backgroundColor: '#FFF5F5', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', whiteSpace: 'nowrap' }}>
          Hết hàng ({qty})
        </span>
      );
    }

    if (qty <= 5) {
      return (
        <span style={{ color: '#B7791F', backgroundColor: '#FEFCBF', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', whiteSpace: 'nowrap' }}>
          Sắp hết ({qty})
        </span>
      );
    }

    return (
      <span style={{ color: '#2F855A', backgroundColor: '#E6FFFA', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', whiteSpace: 'nowrap' }}>
        Còn hàng ({qty})
      </span>
    );
  };

  // --- LOGIC ĐƠN HÀNG ---
  const filteredOrders = orders.filter((o) => {
    const keyword = orderSearchTerm.trim().toLowerCase();
    const matchKeyword =
      !keyword ||
      String(o.ma_dh).includes(keyword) ||
      `#${o.ma_dh}`.includes(keyword) ||
      o.nguoi_nhan?.toLowerCase().includes(keyword) ||
      o.sdt_nhan?.includes(keyword) ||
      o.dia_chi_giao?.toLowerCase().includes(keyword) ||
      o.ten_khach_hang?.toLowerCase().includes(keyword);

    const matchStatus =
      selectedOrderStatus === 'Tất cả' || o.trang_thai_dh === selectedOrderStatus;

    return matchKeyword && matchStatus;
  });

  const handleOrderStatusChange = async (maDh, newStatus) => {
    setUpdatingOrderId(maDh);
    try {
      await API.put(`/api/donhang/${maDh}/status`, {
        trang_thai_dh: newStatus,
        ma_nv_duyet: user?.id || null
      });
      await Promise.all([fetchOrders(), fetchProducts()]);
      if (selectedOrderDetail && Number(selectedOrderDetail.ma_dh) === Number(maDh)) {
        setSelectedOrderDetail((prev) => (prev ? { ...prev, trang_thai_dh: newStatus } : null));
      }
      if (editingOrder && Number(editingOrder.ma_dh) === Number(maDh) && newStatus !== 'ChoXacNhan') {
        setEditingOrder(null);
      }
    } catch (err) {
      alert('Lỗi cập nhật trạng thái đơn: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const openEditOrderModal = (order) => {
    if (order.trang_thai_dh !== 'ChoXacNhan') {
      return alert('Chỉ được chỉnh sửa đơn hàng đang ở trạng thái "Chờ xác nhận"!');
    }
    setEditingOrder(order);
    setEditOrderName(order.nguoi_nhan || '');
    setEditOrderPhone(order.sdt_nhan || '');
    setEditOrderAddress(order.dia_chi_giao || '');
    setEditOrderPayment(order.phuong_thuc_tt || 'COD');
    setEditOrderShipFee(Number(order.phi_van_chuyen || 0));
  };

  const handleSaveOrderEdit = async (e) => {
    e.preventDefault();
    if (!editingOrder || savingOrderEdit) return;

    const cleanName = editOrderName.trim();
    const cleanPhone = editOrderPhone.trim();
    const cleanAddress = editOrderAddress.trim();

    if (!cleanName || !cleanPhone || !cleanAddress) {
      return alert('Vui lòng nhập đầy đủ Họ tên người nhận, Số điện thoại và Địa chỉ giao hàng!');
    }

    if (!PHONE_REGEX.test(cleanPhone)) {
      return alert('Số điện thoại phải gồm đúng 10 số và bắt đầu bằng số 0!');
    }

    setSavingOrderEdit(true);
    try {
      await API.put(`/api/donhang/${editingOrder.ma_dh}`, {
        nguoi_nhan: cleanName,
        sdt_nhan: cleanPhone,
        dia_chi_giao: cleanAddress,
        phuong_thuc_tt: editOrderPayment,
        phi_van_chuyen: Number(editOrderShipFee) >= 0 ? Number(editOrderShipFee) : 0
      });
      alert(`Đã cập nhật đơn hàng #${editingOrder.ma_dh}!`);
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      alert('Lỗi sửa đơn hàng: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingOrderEdit(false);
    }
  };

  const handleDeleteOrder = async (order) => {
    if (order.trang_thai_dh !== 'ChoXacNhan') {
      return alert('Chỉ được xóa đơn hàng đang ở trạng thái "Chờ xác nhận"!');
    }
    if (!window.confirm(`Bạn có chắc muốn xóa đơn hàng #${order.ma_dh} của "${order.nguoi_nhan}"?`)) {
      return;
    }

    try {
      await API.delete(`/api/donhang/${order.ma_dh}`);
      alert(`Đã xóa đơn hàng #${order.ma_dh}!`);
      if (selectedOrderDetail && Number(selectedOrderDetail.ma_dh) === Number(order.ma_dh)) {
        setSelectedOrderDetail(null);
      }
      await Promise.all([fetchOrders(), fetchProducts()]);
    } catch (err) {
      alert('Lỗi xóa đơn hàng: ' + (err.response?.data?.message || err.message));
    }
  };

  const getOrderStatusStyle = (statusValue) => {
    const found = ORDER_STATUS_OPTIONS.find((s) => s.value === statusValue) || {
      label: statusValue,
      bg: '#EDF2F7',
      color: '#4A5568'
    };
    return found;
  };

  // --- LOGIC NGƯỜI DÙNG ---
  const usersWithOrder = users.map((u, idx) => ({
    ...u,
    displayOrder: idx + 1
  }));

  const filteredUsers = usersWithOrder.filter((u) => {
    const keyword = userSearchTerm.trim().toLowerCase();
    const matchKeyword =
      !keyword ||
      u.ho_ten?.toLowerCase().includes(keyword) ||
      u.email?.toLowerCase().includes(keyword) ||
      u.dien_thoai?.includes(keyword) ||
      u.dia_chi?.toLowerCase().includes(keyword) ||
      String(u.displayOrder).includes(keyword);

    const matchRole =
      selectedRoleFilter === 'Tất cả' || u.ten_vaitro === selectedRoleFilter;

    return matchKeyword && matchRole;
  });

  const resetUserForm = () => {
    setEditingUserId(null);
    setEditingUserOrder(null);
    setHoTen('');
    setEmailUser('');
    setMatKhauUser('');
    setShowPassword(false);
    setDienThoaiUser('');
    setDiaChiUser('');
    setTenVaiTro('KhachHang');
    setTrangThaiUser(1);
  };

  const handleUserPhoneChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setDienThoaiUser(onlyDigits);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const cleanName = formatTitleCase(hoTen);
    const cleanEmail = emailUser.trim();
    const cleanPass = matKhauUser.trim();
    const cleanPhone = dienThoaiUser.trim();
    const cleanAddress = diaChiUser.trim();

    if (!cleanName || !cleanEmail || !cleanPass || !cleanPhone) {
      return alert('Vui lòng nhập đầy đủ Họ tên, Tên đăng nhập / Email, Mật khẩu và Số điện thoại!');
    }

    if (!PHONE_REGEX.test(cleanPhone)) {
      return alert('Số điện thoại phải gồm đúng 10 số và bắt đầu bằng số 0!');
    }

    const payload = {
      ho_ten: cleanName,
      email: cleanEmail,
      mat_khau: cleanPass,
      dien_thoai: cleanPhone,
      dia_chi: cleanAddress,
      ten_vaitro: tenVaiTro,
      trang_thai: Number(trangThaiUser)
    };

    try {
      if (editingUserId) {
        await API.put(`/api/nguoidung/${editingUserId}`, payload);
        alert('Cập nhật người dùng thành công!');
      } else {
        await API.post('/api/nguoidung', payload);
        alert('Thêm người dùng mới thành công!');
      }
      resetUserForm();
      fetchUsers();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditUser = (u) => {
    setEditingUserId(u.ma_nd);
    setEditingUserOrder(u.displayOrder);
    setHoTen(u.ho_ten || '');
    setEmailUser(u.email || '');
    setMatKhauUser(u.mat_khau || '');
    setShowPassword(false);
    setDienThoaiUser(u.dien_thoai || '');
    setDiaChiUser(u.dia_chi || '');
    setTenVaiTro(u.ten_vaitro || 'KhachHang');
    setTrangThaiUser(u.trang_thai ?? 1);
    setActiveMenu('nguoidung');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteUser = async (u) => {
    if (user?.id && Number(user.id) === Number(u.ma_nd)) {
      return alert('Bạn không thể xóa tài khoản Admin đang đăng nhập!');
    }
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${u.ho_ten}" (${u.email})?`)) return;
    try {
      await API.delete(`/api/nguoidung/${u.ma_nd}`);
      alert('Xóa người dùng thành công!');
      fetchUsers();
    } catch (err) {
      alert('Lỗi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  const renderRoleBadge = (roleValue) => {
    const found = ROLE_OPTIONS.find((r) => r.value === roleValue) || {
      label: roleValue,
      bg: '#EDF2F7',
      color: '#4A5568'
    };
    return (
      <span
        style={{
          backgroundColor: found.bg,
          color: found.color,
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '700',
          display: 'inline-block',
          whiteSpace: 'nowrap'
        }}
      >
        {found.label}
      </span>
    );
  };

  const getHeaderTitle = () => {
    if (activeMenu === 'dashboard') return 'Tổng quan cửa hàng';
    if (activeMenu === 'donhang') return 'Quản lý Đơn Hàng (DONHANG)';
    if (activeMenu === 'nguoidung') return 'Quản lý Người Dùng (NGUOIDUNG)';
    return 'Quản lý danh mục Sản Phẩm (SANPHAM)';
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
          <button
            onClick={() => setActiveMenu('donhang')}
            style={{
              backgroundColor: activeMenu === 'donhang' ? '#8A6562' : 'transparent',
              color: '#fff',
              border: activeMenu === 'donhang' ? 'none' : '1px solid rgba(255,255,255,0.45)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Quản lý Đơn Hàng</span>
            {pendingOrderCount > 0 && (
              <span
                style={{
                  backgroundColor: '#FEFCBF',
                  color: '#975A16',
                  borderRadius: '999px',
                  padding: '1px 7px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}
              >
                {pendingOrderCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveMenu('nguoidung')}
            style={{
              backgroundColor: activeMenu === 'nguoidung' ? '#8A6562' : 'transparent',
              color: '#fff',
              border: activeMenu === 'nguoidung' ? 'none' : '1px solid rgba(255,255,255,0.45)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Quản lý Người Dùng
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
              {getHeaderTitle()}
            </h2>
            <p style={{ color: '#735754', margin: 0, fontSize: '14px' }}>
              Hệ thống quản trị sản phẩm, đơn hàng và tài khoản người dùng Arent Fashion.
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

        {/* TAB TỔNG QUAN */}
        {activeMenu === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#FFFDFC', padding: '24px 28px', borderRadius: '12px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#8A6562', fontSize: '20px' }}>
                Chào mừng đến với Arent Fashion Admin
              </h3>
              <p style={{ color: '#735754', margin: '0 0 18px 0', lineHeight: '1.6', fontSize: '14px' }}>
                Quản lý danh sách sản phẩm, duyệt đơn đặt hàng và tài khoản người dùng của cửa hàng.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveMenu('sanpham')}
                  style={{ padding: '10px 20px', backgroundColor: '#A9827E', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                >
                  Mở Quản lý Sản Phẩm
                </button>
                <button
                  onClick={() => setActiveMenu('donhang')}
                  style={{ padding: '10px 20px', backgroundColor: '#946C68', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                >
                  Mở Quản lý Đơn Hàng
                </button>
                <button
                  onClick={() => setActiveMenu('nguoidung')}
                  style={{ padding: '10px 20px', backgroundColor: '#8A6562', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                >
                  Mở Quản lý Người Dùng
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: '#FFFDFC', padding: '20px', borderRadius: '12px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
                <div style={{ fontSize: '13px', color: '#946C68', marginBottom: '6px' }}>Sản phẩm đang bán</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#2F855A' }}>
                  {activeCount} / {totalModels}
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFDFC', padding: '20px', borderRadius: '12px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
                <div style={{ fontSize: '13px', color: '#946C68', marginBottom: '6px' }}>Tổng đơn hàng</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#4B3635' }}>
                  {orders.length}{' '}
                  {pendingOrderCount > 0 && (
                    <span style={{ fontSize: '13px', color: '#B7791F' }}>({pendingOrderCount} chờ duyệt)</span>
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFDFC', padding: '20px', borderRadius: '12px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
                <div style={{ fontSize: '13px', color: '#946C68', marginBottom: '6px' }}>Doanh thu tạm tính</div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#DB5898' }}>
                  {totalRevenue.toLocaleString('vi-VN')} đ
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFDFC', padding: '20px', borderRadius: '12px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
                <div style={{ fontSize: '13px', color: '#946C68', marginBottom: '6px' }}>Tổng người dùng</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#2B6CB0' }}>{users.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB QUẢN LÝ SẢN PHẨM */}
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
                {editingStt ? `Cập nhật sản phẩm STT #${editingDisplayStt}` : 'Thêm sản phẩm mới'}
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
                    readOnly
                    placeholder="Tự động (tối đa 5 ký tự)"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #DFC9C5',
                      borderRadius: '10px',
                      backgroundColor: '#F6ECEA',
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
                        onClick={() => setPreviewImage({ src: hinhAnh, name: tenSp || 'Xem trước sản phẩm' })}
                        title="Bấm để phóng to"
                        style={{
                          width: '54px',
                          height: '68px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #DFC9C5',
                          cursor: 'zoom-in'
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
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Hình ảnh</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Danh mục</th>
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
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635', fontWeight: '600' }}>
                              {item.displayStt}
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#4B3635' }}>{item.ma_sp}</td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>
                              <strong style={{ color: '#3B2827' }}>{item.ten_sp}</strong>
                            </td>
                            <td style={{ padding: '10px 16px' }}>
                              {item.hinh_anh ? (
                                <img
                                  src={item.hinh_anh}
                                  alt={item.ten_sp}
                                  onClick={() => setPreviewImage({ src: item.hinh_anh, name: item.ten_sp })}
                                  title="Bấm để xem ảnh rõ hơn"
                                  style={{
                                    width: '44px',
                                    height: '56px',
                                    objectFit: 'cover',
                                    borderRadius: '6px',
                                    border: '1px solid #DFC9C5',
                                    cursor: 'zoom-in',
                                    display: 'block'
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: '12px', color: '#9C8380', fontStyle: 'italic' }}>
                                  Chưa có ảnh
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>{item.ten_danh_muc || '-'}</td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>{Number(item.gia_goc).toLocaleString('vi-VN')} đ</td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>
                              {renderProductStatusBadge(item)}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleEdit(item)} style={{ padding: '6px 12px', backgroundColor: '#D49A42', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Sửa</button>
                                <button onClick={() => handleDelete(item.stt)} style={{ padding: '6px 12px', backgroundColor: '#C95B5B', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Xóa</button>
                              </div>
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

        {/* TAB QUẢN LÝ ĐƠN HÀNG */}
        {activeMenu === 'donhang' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {ORDER_STATUS_OPTIONS.map((st) => {
                const count = orders.filter((o) => o.trang_thai_dh === st.value).length;
                const isSelected = selectedOrderStatus === st.value;
                return (
                  <div
                    key={st.value}
                    onClick={() => setSelectedOrderStatus(isSelected ? 'Tất cả' : st.value)}
                    style={{
                      backgroundColor: isSelected ? st.bg : '#FFFDFC',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${st.color}` : '1px solid #E6D5D2',
                      boxShadow: '0 4px 10px rgba(169, 130, 126, 0.07)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '700', color: st.color, marginBottom: '4px' }}>
                      {st.label}
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#4B3635' }}>{count}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ backgroundColor: '#FFFDFC', padding: '24px', borderRadius: '14px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#8A6562', fontSize: '18px', fontWeight: '700' }}>
                    Danh sách đơn hàng ({filteredOrders.length})
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#735754' }}>
                    Lưu ý: Đơn ở trạng thái <strong>Chờ xác nhận</strong> được phép Sửa / Xóa. Đơn đã xác nhận hoặc đang giao sẽ bị khóa chỉnh sửa.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <select
                    value={selectedOrderStatus}
                    onChange={(e) => setSelectedOrderStatus(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '13px', color: '#4B3635', backgroundColor: '#fff' }}
                  >
                    <option value="Tất cả">Tất cả trạng thái</option>
                    {ORDER_STATUS_OPTIONS.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                    placeholder="Tìm mã đơn, người nhận, SĐT, địa chỉ..."
                    style={{ padding: '8px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '13px', color: '#4B3635', backgroundColor: '#fff', minWidth: '240px' }}
                  />

                  <button
                    type="button"
                    onClick={fetchOrders}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#A9827E',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Làm mới
                  </button>
                </div>
              </div>

              {loadingOrders ? (
                <p style={{ color: '#735754' }}>Đang tải danh sách đơn hàng...</p>
              ) : (
                <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #E6D5D2' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#A9827E', color: '#fff' }}>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Mã ĐH</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Ngày đặt</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Người nhận</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Địa chỉ giao</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Sản phẩm</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Tổng tiền</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Trạng thái</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                            Chưa có đơn hàng nào phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => {
                          const statusStyle = getOrderStatusStyle(o.trang_thai_dh);
                          const isPending = o.trang_thai_dh === 'ChoXacNhan';
                          const totalItemsQty = (o.chi_tiet || []).reduce(
                            (sum, line) => sum + Number(line.so_luong || 0),
                            0
                          );

                          return (
                            <tr key={o.ma_dh} style={{ borderBottom: '1px solid #F5ECEA' }}>
                              <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#4B3635' }}>
                                #{o.ma_dh}
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: '13px', color: '#634846', whiteSpace: 'nowrap' }}>
                                {formatDateTime(o.ngay_dat)}
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>
                                <div style={{ fontWeight: '700', color: '#3B2827' }}>{o.nguoi_nhan}</div>
                                <div style={{ fontSize: '12px', color: '#735754' }}>{o.sdt_nhan}</div>
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: '13px', color: '#634846', maxWidth: '200px' }}>
                                {o.dia_chi_giao}
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: '13px', color: '#4B3635' }}>
                                {(o.chi_tiet || []).length === 0 ? (
                                  <span style={{ color: '#9C8380', fontStyle: 'italic' }}>Không có chi tiết</span>
                                ) : (
                                  <div>
                                    <div style={{ fontWeight: '600' }}>
                                      {o.chi_tiet[0].ten_sp} × {o.chi_tiet[0].so_luong}
                                    </div>
                                    {o.chi_tiet.length > 1 && (
                                      <div style={{ fontSize: '12px', color: '#8A6562' }}>
                                        +{o.chi_tiet.length - 1} sản phẩm khác (Tổng {totalItemsQty} cái)
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#DB5898', whiteSpace: 'nowrap' }}>
                                <div>{Number(o.tong_thanh_toan).toLocaleString('vi-VN')} đ</div>
                                <div style={{ fontSize: '11px', fontWeight: '600', color: '#735754' }}>
                                  {o.phuong_thuc_tt || 'COD'}
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <select
                                  value={o.trang_thai_dh}
                                  disabled={updatingOrderId === o.ma_dh}
                                  onChange={(e) => handleOrderStatusChange(o.ma_dh, e.target.value)}
                                  style={{
                                    backgroundColor: statusStyle.bg,
                                    color: statusStyle.color,
                                    border: `1px solid ${statusStyle.color}`,
                                    borderRadius: '6px',
                                    padding: '5px 8px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: updatingOrderId === o.ma_dh ? 'wait' : 'pointer'
                                  }}
                                >
                                  {ORDER_STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value} style={{ backgroundColor: '#fff', color: '#4B3635' }}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrderDetail(o)}
                                    style={{
                                      padding: '6px 10px',
                                      backgroundColor: '#946C68',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Xem
                                  </button>

                                  {isPending ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => openEditOrderModal(o)}
                                        style={{
                                          padding: '6px 10px',
                                          backgroundColor: '#D49A42',
                                          color: '#fff',
                                          border: 'none',
                                          borderRadius: '6px',
                                          fontSize: '12px',
                                          fontWeight: '600',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Sửa
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteOrder(o)}
                                        style={{
                                          padding: '6px 10px',
                                          backgroundColor: '#C95B5B',
                                          color: '#fff',
                                          border: 'none',
                                          borderRadius: '6px',
                                          fontSize: '12px',
                                          fontWeight: '600',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Xóa
                                      </button>
                                    </>
                                  ) : (
                                    <span
                                      title="Đơn đã xác nhận hoặc đang giao không thể sửa/xóa"
                                      style={{
                                        fontSize: '11px',
                                        color: '#9C8380',
                                        backgroundColor: '#F6ECEA',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontWeight: '600',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      Đã khóa
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB QUẢN LÝ NGƯỜI DÙNG */}
        {activeMenu === 'nguoidung' && (
          <div>
            <form
              onSubmit={handleUserSubmit}
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
                {editingUserId ? `Cập nhật người dùng #${editingUserOrder}` : 'Thêm người dùng mới'}
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
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={hoTen}
                    onChange={(e) => setHoTen(e.target.value)}
                    placeholder="VD: Nguyễn Thị Gia Hân"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>
                    Tên đăng nhập / Email *
                  </label>
                  <input
                    type="text"
                    value={emailUser}
                    onChange={(e) => setEmailUser(e.target.value)}
                    placeholder="VD: khachhang@arentfashion.vn"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>
                    Mật khẩu *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={matKhauUser}
                      onChange={(e) => setMatKhauUser(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      style={{ width: '100%', padding: '10px 56px 10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        color: '#8A6562',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? 'Ẩn' : 'Hiện'}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>
                    Số điện thoại * (10 số, bắt đầu bằng 0)
                  </label>
                  <input
                    type="tel"
                    value={dienThoaiUser}
                    onChange={handleUserPhoneChange}
                    placeholder="0901234567"
                    maxLength={10}
                    inputMode="numeric"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>
                    Vai trò *
                  </label>
                  <select
                    value={tenVaiTro}
                    onChange={(e) => setTenVaiTro(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>
                    Trạng thái tài khoản
                  </label>
                  <select
                    value={trangThaiUser}
                    onChange={(e) => setTrangThaiUser(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    {USER_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: 'span 3' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={diaChiUser}
                    onChange={(e) => setDiaChiUser(e.target.value)}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, TP..."
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #DFC9C5', borderRadius: '10px', backgroundColor: '#fff', color: '#4B3635', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {editingUserId && (
                  <button type="button" onClick={resetUserForm} style={{ padding: '10px 22px', backgroundColor: '#BFA19E', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    Hủy
                  </button>
                )}
                <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#A9827E', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  {editingUserId ? 'Lưu thay đổi' : 'Thêm người dùng'}
                </button>
              </div>
            </form>

            <div style={{ backgroundColor: '#FFFDFC', padding: '24px', borderRadius: '14px', border: '1px solid #E6D5D2', boxShadow: '0 4px 12px rgba(169, 130, 126, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#8A6562', fontSize: '18px', fontWeight: '700' }}>
                  Danh sách người dùng ({filteredUsers.length})
                </h3>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '13px', color: '#4B3635', backgroundColor: '#fff' }}
                  >
                    <option value="Tất cả">Tất cả vai trò</option>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Tìm họ tên, email, SĐT, địa chỉ..."
                    style={{ padding: '8px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '13px', color: '#4B3635', backgroundColor: '#fff', minWidth: '230px' }}
                  />
                </div>
              </div>

              {loadingUsers ? (
                <p style={{ color: '#735754' }}>Đang tải danh sách người dùng...</p>
              ) : (
                <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #E6D5D2' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#A9827E', color: '#fff' }}>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>STT</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Họ và tên</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Tên đăng nhập / Email</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Số điện thoại</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Vai trò</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Địa chỉ</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Trạng thái</th>
                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                            Không có người dùng nào phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.ma_nd} style={{ borderBottom: '1px solid #F5ECEA' }}>
                            <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#4B3635' }}>
                              {u.displayOrder}
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>
                              <strong style={{ color: '#3B2827' }}>{u.ho_ten}</strong>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>
                              {u.email}
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '14px', color: '#4B3635' }}>
                              {u.dien_thoai}
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                              {renderRoleBadge(u.ten_vaitro)}
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: '#634846', maxWidth: '220px' }}>
                              {u.dia_chi || <span style={{ color: '#9C8380', fontStyle: 'italic' }}>Chưa cập nhật</span>}
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                              {Number(u.trang_thai) === 1 ? (
                                <span style={{ color: '#2F855A', backgroundColor: '#E6FFFA', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                  Hoạt động
                                </span>
                              ) : (
                                <span style={{ color: '#C53030', backgroundColor: '#FFF5F5', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                  Đã khóa
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleEditUser(u)}
                                  style={{ padding: '6px 12px', backgroundColor: '#D49A42', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                  Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  style={{ padding: '6px 12px', backgroundColor: '#C95B5B', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                  Xóa
                                </button>
                              </div>
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

      {/* Modal Sửa thông tin Đơn Hàng (chỉ dành cho đơn Chờ xác nhận) */}
      {editingOrder && (
        <div
          onClick={() => setEditingOrder(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(59, 40, 39, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 96
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFDFC',
              borderRadius: '16px',
              border: '2px solid #A9827E',
              width: '100%',
              maxWidth: '480px',
              padding: '24px 28px',
              boxShadow: '0 14px 36px rgba(0, 0, 0, 0.25)'
            }}
          >
            <h3 style={{ margin: '0 0 6px 0', color: '#8A6562', fontSize: '20px', fontFamily: 'Georgia, serif' }}>
              Sửa thông tin đơn hàng #{editingOrder.ma_dh}
            </h3>
            <p style={{ margin: '0 0 18px 0', fontSize: '13px', color: '#735754' }}>
              Chỉ áp dụng cho đơn đang ở trạng thái <strong>Chờ xác nhận</strong>.
            </p>

            <form onSubmit={handleSaveOrderEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>
                  Họ tên người nhận *
                </label>
                <input
                  type="text"
                  value={editOrderName}
                  onChange={(e) => setEditOrderName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>
                  Số điện thoại nhận hàng * (10 số, bắt đầu bằng 0)
                </label>
                <input
                  type="tel"
                  value={editOrderPhone}
                  onChange={(e) => setEditOrderPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  inputMode="numeric"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>
                  Địa chỉ giao hàng *
                </label>
                <input
                  type="text"
                  value={editOrderAddress}
                  onChange={(e) => setEditOrderAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>
                    Phương thức thanh toán
                  </label>
                  <select
                    value={editOrderPayment}
                    onChange={(e) => setEditOrderPayment(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '14px', backgroundColor: '#fff', boxSizing: 'border-box' }}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#634846' }}>
                    Phí vận chuyển (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editOrderShipFee}
                    onChange={(e) => setEditOrderShipFee(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #DFC9C5', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  style={{ padding: '9px 18px', backgroundColor: '#BFA19E', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingOrderEdit}
                  style={{ padding: '9px 20px', backgroundColor: '#A9827E', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {savingOrderEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chi tiết Đơn Hàng */}
      {selectedOrderDetail && (
        <div
          onClick={() => setSelectedOrderDetail(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(59, 40, 39, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 95
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFDFC',
              borderRadius: '16px',
              border: '2px solid #A9827E',
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px 28px',
              boxShadow: '0 14px 36px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E6D5D2', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#8A6562', fontSize: '20px', fontFamily: 'Georgia, serif' }}>
                  Chi tiết đơn hàng #{selectedOrderDetail.ma_dh}
                </h3>
                <div style={{ fontSize: '12px', color: '#735754', marginTop: '4px' }}>
                  Ngày đặt: {formatDateTime(selectedOrderDetail.ngay_dat)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetail(null)}
                style={{
                  backgroundColor: '#A9827E',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Đóng ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: '#FBF3F1', padding: '14px 16px', borderRadius: '10px', marginBottom: '18px', fontSize: '13px' }}>
              <div>
                <div style={{ color: '#735754' }}>Người nhận:</div>
                <div style={{ fontWeight: '700', color: '#3B2827' }}>{selectedOrderDetail.nguoi_nhan}</div>
              </div>
              <div>
                <div style={{ color: '#735754' }}>Số điện thoại:</div>
                <div style={{ fontWeight: '700', color: '#3B2827' }}>{selectedOrderDetail.sdt_nhan}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ color: '#735754' }}>Địa chỉ giao hàng:</div>
                <div style={{ fontWeight: '600', color: '#3B2827' }}>{selectedOrderDetail.dia_chi_giao}</div>
              </div>
              <div>
                <div style={{ color: '#735754' }}>Tài khoản đặt:</div>
                <div style={{ fontWeight: '600', color: '#3B2827' }}>
                  {selectedOrderDetail.ten_khach_hang || `KH #${selectedOrderDetail.ma_kh}`}
                  {selectedOrderDetail.email_khach_hang ? ` (${selectedOrderDetail.email_khach_hang})` : ''}
                </div>
              </div>
              <div>
                <div style={{ color: '#735754' }}>Thanh toán & Trạng thái:</div>
                <div style={{ fontWeight: '700', color: '#8A6562' }}>
                  {selectedOrderDetail.phuong_thuc_tt || 'COD'} •{' '}
                  {getOrderStatusStyle(selectedOrderDetail.trang_thai_dh).label}
                </div>
              </div>
            </div>

            <h4 style={{ margin: '0 0 10px 0', color: '#634846', fontSize: '15px' }}>
              Danh sách sản phẩm đặt mua ({(selectedOrderDetail.chi_tiet || []).length})
            </h4>

            <div style={{ border: '1px solid #E6D5D2', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F6ECEA', color: '#4B3635' }}>
                    <th style={{ padding: '10px 12px' }}>Sản phẩm</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>SL</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Đơn giá</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrderDetail.chi_tiet || []).length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '14px', textAlign: 'center', color: '#735754' }}>
                        Không có dữ liệu chi tiết sản phẩm.
                      </td>
                    </tr>
                  ) : (
                    selectedOrderDetail.chi_tiet.map((line, idx) => (
                      <tr key={idx} style={{ borderTop: '1px solid #F5ECEA' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {line.hinh_anh && (
                              <img
                                src={line.hinh_anh}
                                alt={line.ten_sp}
                                style={{ width: '36px', height: '46px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #DFC9C5' }}
                              />
                            )}
                            <div>
                              <div style={{ fontWeight: '700', color: '#3B2827' }}>{line.ten_sp || `SP #${line.ma_sp_sp}`}</div>
                              {line.ma_sp && <div style={{ fontSize: '11px', color: '#735754' }}>Mã: {line.ma_sp}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600' }}>
                          {line.so_luong}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          {Number(line.don_gia_ban).toLocaleString('vi-VN')} đ
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#4B3635' }}>
                          {Number(line.thanh_tien).toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', fontSize: '14px' }}>
              <div style={{ color: '#735754' }}>
                Phí vận chuyển: <strong>{Number(selectedOrderDetail.phi_van_chuyen || 0).toLocaleString('vi-VN')} đ</strong>
              </div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: '#DB5898' }}>
                Tổng thanh toán: {Number(selectedOrderDetail.tong_thanh_toan).toLocaleString('vi-VN')} đ
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal phóng to hình ảnh sản phẩm */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(59, 40, 39, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFDFC',
              borderRadius: '14px',
              border: '2px solid #A9827E',
              padding: '16px 20px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 14px 36px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <strong style={{ color: '#4B3635', fontSize: '15px' }}>{previewImage.name}</strong>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                style={{
                  backgroundColor: '#A9827E',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Đóng ✕
              </button>
            </div>
            <img
              src={previewImage.src}
              alt={previewImage.name}
              style={{
                maxWidth: '82vw',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: '10px',
                border: '1px solid #E6D5D2'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;