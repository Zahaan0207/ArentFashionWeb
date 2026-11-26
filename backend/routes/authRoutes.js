const express = require('express');
const router = express.Router();
const db = require('../config/db');

const PHONE_REGEX = /^0\d{9}$/;

router.post('/login', async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT nd.ma_nd, nd.ho_ten, nd.email, nd.mat_khau, nd.dien_thoai, nd.trang_thai, nd.ten_vaitro
       FROM NGUOIDUNG nd
       INNER JOIN VAITRO vt ON vt.ten_vaitro = nd.ten_vaitro
       WHERE nd.email = ?
       LIMIT 1`,
      [email]
    );

    const user = rows[0];
    if (!user || Number(user.trang_thai) !== 1) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    if (password !== user.mat_khau) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    return res.json({
      user: {
        id: user.ma_nd,
        username: user.email,
        fullName: user.ho_ten,
        phone: user.dien_thoai || '',
        role: user.ten_vaitro === 'Admin' ? 'admin' : 'user'
      }
    });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({ message: 'Không thể đăng nhập lúc này.' });
  }
});

router.post('/signup', async (req, res) => {
  const email = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const fullName = typeof req.body.fullName === 'string' ? req.body.fullName.trim() : '';
  const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';

  if (!email || !password || !fullName || !phone) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
  }

  if (!PHONE_REGEX.test(phone)) {
    return res.status(400).json({
      message: 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.'
    });
  }

  try {
    const [existing] = await db.query(
      'SELECT ma_nd FROM NGUOIDUNG WHERE email = ? LIMIT 1',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Tài khoản đã tồn tại.' });
    }

    const [result] = await db.query(
      `INSERT INTO NGUOIDUNG (ten_vaitro, ho_ten, email, mat_khau, dien_thoai, dia_chi, trang_thai)
       VALUES ('KhachHang', ?, ?, ?, ?, '', 1)`,
      [fullName, email, password, phone]
    );

    return res.status(201).json({
      user: {
        id: result.insertId,
        username: email,
        fullName,
        phone,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Signup failed:', error);
    return res.status(500).json({
      message: error.sqlMessage || 'Lỗi khi đăng ký tài khoản.'
    });
  }
});

module.exports = router;