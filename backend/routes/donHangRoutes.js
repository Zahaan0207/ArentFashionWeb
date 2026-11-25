const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Lấy danh sách đơn hàng (kèm chi tiết)
router.get('/', async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM DONHANG ORDER BY ma_dh DESC');
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.sqlMessage || error.message });
  }
});

// Tạo đơn hàng mới + lưu chi tiết đơn hàng
router.post('/', async (req, res) => {
  const {
    userId,
    userEmail,
    nguoi_nhan,
    sdt_nhan,
    dia_chi_giao,
    phuong_thuc_tt,
    phi_van_chuyen,
    items
  } = req.body;

  const tenNguoiNhan = String(nguoi_nhan || '').trim();
  const sdtNhan = String(sdt_nhan || '').trim();
  const diaChiGiao = String(dia_chi_giao || '').trim();
  const phuongThucTt = String(phuong_thuc_tt || 'COD').trim();
  const phiShip = Number(phi_van_chuyen) >= 0 ? Number(phi_van_chuyen) : 0;

  if (!tenNguoiNhan || !sdtNhan || !diaChiGiao) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng!'
    });
  }

  if (!/^0\d{9}$/.test(sdtNhan)) {
    return res.status(400).json({
      success: false,
      message: 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0!'
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Giỏ hàng / danh sách sản phẩm đặt mua đang trống!'
    });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Tìm ma_kh hợp lệ trong bảng NGUOIDUNG
    let maKh = null;

    if (userId) {
      const [byId] = await connection.query(
        'SELECT ma_nd FROM NGUOIDUNG WHERE ma_nd = ? LIMIT 1',
        [Number(userId)]
      );
      if (byId.length > 0) {
        maKh = byId[0].ma_nd;
      }
    }

    if (!maKh && userEmail) {
      const [byEmail] = await connection.query(
        'SELECT ma_nd FROM NGUOIDUNG WHERE email = ? LIMIT 1',
        [String(userEmail).trim()]
      );
      if (byEmail.length > 0) {
        maKh = byEmail[0].ma_nd;
      }
    }

    // Nếu đặt mua khi chưa có tài khoản khớp trong NGUOIDUNG -> lấy tài khoản KhachHang đầu tiên làm khách vãng lai
    if (!maKh) {
      const [fallbackCust] = await connection.query(
        "SELECT ma_nd FROM NGUOIDUNG WHERE ten_vaitro = 'KhachHang' ORDER BY ma_nd ASC LIMIT 1"
      );
      if (fallbackCust.length > 0) {
        maKh = fallbackCust[0].ma_nd;
      }
    }

    if (!maKh) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy tài khoản khách hàng hợp lệ trong NGUOIDUNG để gắn đơn hàng.'
      });
    }

    // Kiểm tra từng sản phẩm theo stt và tính tiền chuẩn từ DB
    const normalizedItems = [];
    let tongTienHang = 0;

    for (const rawItem of items) {
      const stt = Number(rawItem.stt ?? rawItem.ma_sp_sp);
      const soLuong = Number(rawItem.so_luong ?? rawItem.quantity ?? 1);

      if (!stt || soLuong <= 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Thông tin sản phẩm hoặc số lượng đặt mua không hợp lệ!'
        });
      }

      const [spRows] = await connection.query(
        'SELECT stt, ten_sp, gia_goc, so_luong, trang_thai FROM SANPHAM WHERE stt = ? LIMIT 1',
        [stt]
      );

      if (spRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sản phẩm STT #${stt}.`
        });
      }

      const sp = spRows[0];
      if (Number(sp.trang_thai) === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${sp.ten_sp}" hiện đã ngừng bán.`
        });
      }

      const donGiaBan = Number(sp.gia_goc);
      const thanhTien = donGiaBan * soLuong;
      tongTienHang += thanhTien;

      normalizedItems.push({
        ma_sp_sp: sp.stt,
        so_luong: soLuong,
        don_gia_ban: donGiaBan,
        thanh_tien: thanhTien
      });
    }

    const tongThanhToan = tongTienHang + phiShip;

    // 1. Insert vào DONHANG
    const [orderResult] = await connection.query(
      `INSERT INTO DONHANG
        (ma_kh, ma_nv_duyet, nguoi_nhan, sdt_nhan, dia_chi_giao, phuong_thuc_tt, phi_van_chuyen, tong_thanh_toan, trang_thai_dh)
       VALUES (?, NULL, ?, ?, ?, ?, ?, ?, 'ChoXacNhan')`,
      [maKh, tenNguoiNhan, sdtNhan, diaChiGiao, phuongThucTt, phiShip, tongThanhToan]
    );

    const maDh = orderResult.insertId;

    // 2. Insert từng dòng vào CHITIET_DH
    for (const line of normalizedItems) {
      await connection.query(
        `INSERT INTO CHITIET_DH
          (ma_dh, ma_sp_sp, so_luong, don_gia_ban, thanh_tien)
         VALUES (?, ?, ?, ?, ?)`,
        [maDh, line.ma_sp_sp, line.so_luong, line.don_gia_ban, line.thanh_tien]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      data: {
        ma_dh: maDh,
        tong_thanh_toan: tongThanhToan,
        trang_thai_dh: 'ChoXacNhan'
      }
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Create order failed:', error);
    return res.status(500).json({
      success: false,
      message: error.sqlMessage || error.message || 'Lỗi khi lưu đơn hàng.'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;