const express = require('express');
const router = express.Router();
const db = require('../config/db');

const PHONE_REGEX = /^0\d{9}$/;
const VALID_ROLES = ['Admin', 'QuanLy', 'NVBanHang', 'NVKho', 'KhachHang'];

// Lấy danh sách người dùng
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ma_nd, ten_vaitro, ho_ten, email, mat_khau, dien_thoai, dia_chi, trang_thai, ngay_them
       FROM NGUOIDUNG
       ORDER BY ma_nd ASC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.sqlMessage || error.message });
  }
});

// Thêm người dùng mới
router.post('/', async (req, res) => {
  const hoTen = String(req.body.ho_ten || '').trim();
  const email = String(req.body.email || '').trim();
  const matKhau = String(req.body.mat_khau || '').trim();
  const dienThoai = String(req.body.dien_thoai || '').trim();
  const diaChi = String(req.body.dia_chi || '').trim();
  const tenVaiTro = String(req.body.ten_vaitro || 'KhachHang').trim();
  const trangThai = req.body.trang_thai !== undefined ? Number(req.body.trang_thai) : 1;

  if (!hoTen || !email || !matKhau || !dienThoai) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ Họ tên, Email / Tên đăng nhập, Mật khẩu và Số điện thoại!'
    });
  }

  if (!VALID_ROLES.includes(tenVaiTro)) {
    return res.status(400).json({
      success: false,
      message: 'Vai trò không hợp lệ!'
    });
  }

  if (!PHONE_REGEX.test(dienThoai)) {
    return res.status(400).json({
      success: false,
      message: 'Số điện thoại phải gồm đúng 10 số và bắt đầu bằng số 0!'
    });
  }

  try {
    const [existing] = await db.query(
      'SELECT ma_nd FROM NGUOIDUNG WHERE email = ? LIMIT 1',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Tên đăng nhập / Email này đã tồn tại!'
      });
    }

    const [maxRows] = await db.query(
      'SELECT COALESCE(MAX(ma_nd), 0) + 1 AS nextId FROM NGUOIDUNG'
    );
    const nextMaNd = Number(maxRows[0].nextId);

    await db.query(
      `INSERT INTO NGUOIDUNG (ma_nd, ten_vaitro, ho_ten, email, mat_khau, dien_thoai, dia_chi, trang_thai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nextMaNd, tenVaiTro, hoTen, email, matKhau, dienThoai, diaChi, trangThai]
    );

    res.status(201).json({
      success: true,
      message: 'Thêm người dùng thành công!',
      id: nextMaNd
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.sqlMessage || error.message });
  }
});

// Cập nhật thông tin người dùng
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const hoTen = String(req.body.ho_ten || '').trim();
  const email = String(req.body.email || '').trim();
  const matKhau = String(req.body.mat_khau || '').trim();
  const dienThoai = String(req.body.dien_thoai || '').trim();
  const diaChi = String(req.body.dia_chi || '').trim();
  const tenVaiTro = String(req.body.ten_vaitro || 'KhachHang').trim();
  const trangThai = req.body.trang_thai !== undefined ? Number(req.body.trang_thai) : 1;

  if (!hoTen || !email || !matKhau || !dienThoai) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ Họ tên, Email / Tên đăng nhập, Mật khẩu và Số điện thoại!'
    });
  }

  if (!VALID_ROLES.includes(tenVaiTro)) {
    return res.status(400).json({
      success: false,
      message: 'Vai trò không hợp lệ!'
    });
  }

  if (!PHONE_REGEX.test(dienThoai)) {
    return res.status(400).json({
      success: false,
      message: 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0!'
    });
  }

  try {
    const [duplicate] = await db.query(
      'SELECT ma_nd FROM NGUOIDUNG WHERE email = ? AND ma_nd != ? LIMIT 1',
      [email, id]
    );
    if (duplicate.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Tên đăng nhập / Email đã được sử dụng bởi tài khoản khác!'
      });
    }

    await db.query(
      `UPDATE NGUOIDUNG
       SET ten_vaitro = ?, ho_ten = ?, email = ?, mat_khau = ?, dien_thoai = ?, dia_chi = ?, trang_thai = ?
       WHERE ma_nd = ?`,
      [tenVaiTro, hoTen, email, matKhau, dienThoai, diaChi, trangThai, id]
    );

    res.json({ success: true, message: 'Cập nhật người dùng thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.sqlMessage || error.message });
  }
});

// Xóa người dùng
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM NGUOIDUNG WHERE ma_nd = ?', [id]);
    res.json({ success: true, message: 'Xóa người dùng thành công!' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa người dùng đã có đơn hàng liên kết! Hãy chuyển trạng thái sang "Ngừng hoạt động".'
      });
    }
    res.status(500).json({ success: false, message: error.sqlMessage || error.message });
  }
});

module.exports = router;