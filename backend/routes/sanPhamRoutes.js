const express = require('express');
const router = express.Router();
const db = require('../config/db');

function buildPrefix(tenSp) {
  const clean = String(tenSp || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9\s]+/g, ' ')
    .trim();

  if (!clean) return 'SP';

  const initials = clean
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join('')
    .slice(0, 3);

  return initials || 'SP';
}

async function generateUniqueMaSp(tenSp) {
  const prefix = buildPrefix(tenSp); // tối đa 3 ký tự

  const [existingRows] = await db.query(
    'SELECT ma_sp FROM SANPHAM WHERE ma_sp LIKE ?',
    [`${prefix}%`]
  );
  const existingSet = new Set(existingRows.map((r) => String(r.ma_sp).toUpperCase()));

  // Nếu prefix chưa tồn tại -> dùng luôn prefix (tối đa 3 ký tự <= 5)
  if (!existingSet.has(prefix)) {
    return prefix.slice(0, 5);
  }

  // Nếu đã trùng -> thêm số tự tăng 01, 02... (tối đa 5 ký tự)
  const maxPrefixLen = 3;
  const shortPrefix = prefix.slice(0, maxPrefixLen);

  for (let i = 1; i <= 99; i++) {
    const suffix = String(i).padStart(2, '0'); // 01..99 (2 ký tự)
    const candidate = `${shortPrefix}${suffix}`.slice(0, 5);
    if (!existingSet.has(candidate)) {
      return candidate;
    }
  }

  // Dự phòng nếu đầy 01..99
  return `${shortPrefix}99`.slice(0, 5);
}

// Lấy danh sách sản phẩm
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM SANPHAM ORDER BY stt DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Thêm sản phẩm mới (tự sinh ma_sp tối đa 5 ký tự)
router.post('/', async (req, res) => {
  const {
    ten_sp,
    ten_danh_muc,
    so_luong,
    gia_goc,
    hinh_anh,
    mo_ta_chi_tiet,
    trang_thai
  } = req.body;

  if (!ten_sp || !String(ten_sp).trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập tên sản phẩm!'
    });
  }

  if (!ten_danh_muc || !String(ten_danh_muc).trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng chọn hoặc nhập tên danh mục!'
    });
  }

  if (Number(gia_goc) < 100000) {
    return res.status(400).json({
      success: false,
      message: 'Giá sản phẩm phải từ 100.000 đ trở lên!'
    });
  }

  try {
    const autoMaSp = await generateUniqueMaSp(ten_sp);

    const [result] = await db.query(
      `INSERT INTO SANPHAM
        (ten_sp, ma_sp, ten_danh_muc, so_luong, gia_goc, hinh_anh, mo_ta_chi_tiet, trang_thai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(ten_sp).trim(),
        autoMaSp,
        String(ten_danh_muc).trim(),
        Number(so_luong) >= 0 ? Number(so_luong) : 0,
        Number(gia_goc),
        hinh_anh || null,
        mo_ta_chi_tiet ? String(mo_ta_chi_tiet).trim() : null,
        trang_thai ?? 1
      ]
    );
    res.status(201).json({ success: true, id: result.insertId, ma_sp: autoMaSp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.sqlMessage || error.message });
  }
});

// Cập nhật sản phẩm theo stt (giữ nguyên ma_sp hiện tại nếu không đổi tên hoặc giữ mã cũ)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    ten_sp,
    ma_sp,
    ten_danh_muc,
    so_luong,
    gia_goc,
    hinh_anh,
    mo_ta_chi_tiet,
    trang_thai
  } = req.body;

  if (!ten_sp || !String(ten_sp).trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập tên sản phẩm!'
    });
  }

  if (!ten_danh_muc || !String(ten_danh_muc).trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng chọn hoặc nhập tên danh mục!'
    });
  }

  if (Number(gia_goc) < 100000) {
    return res.status(400).json({
      success: false,
      message: 'Giá sản phẩm phải từ 100.000 đ trở lên!'
    });
  }

  try {
    const safeMaSp = String(ma_sp || '').trim().toUpperCase().slice(0, 5);
    await db.query(
      `UPDATE SANPHAM
       SET ten_sp = ?, ma_sp = ?, ten_danh_muc = ?, so_luong = ?, gia_goc = ?, hinh_anh = ?, mo_ta_chi_tiet = ?, trang_thai = ?
       WHERE stt = ?`,
      [
        String(ten_sp).trim(),
        safeMaSp,
        String(ten_danh_muc).trim(),
        Number(so_luong) >= 0 ? Number(so_luong) : 0,
        Number(gia_goc),
        hinh_anh || null,
        mo_ta_chi_tiet ? String(mo_ta_chi_tiet).trim() : null,
        trang_thai ?? 1,
        id
      ]
    );
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.sqlMessage || error.message });
  }
});

// Xóa sản phẩm theo stt
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM SANPHAM WHERE stt = ?', [id]);
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.sqlMessage || error.message });
  }
});

module.exports = router;