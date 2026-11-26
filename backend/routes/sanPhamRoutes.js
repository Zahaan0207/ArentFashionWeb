const express = require('express');
const router = express.Router();
const db = require('../config/db');

function formatTitleCase(str) {
  return String(str || '')
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
}

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

async function generateUniqueMaSp(tenSp, excludeStt = null) {
  const prefix = buildPrefix(tenSp);
  const digitLen = 5 - prefix.length;
  const maxNumber = Math.pow(10, digitLen) - 1;

  const sql = excludeStt
    ? 'SELECT ma_sp FROM SANPHAM WHERE ma_sp LIKE ? AND stt != ?'
    : 'SELECT ma_sp FROM SANPHAM WHERE ma_sp LIKE ?';
  const params = excludeStt ? [`${prefix}%`, excludeStt] : [`${prefix}%`];

  const [existingRows] = await db.query(sql, params);
  const existingSet = new Set(
    existingRows.map((r) => String(r.ma_sp || '').trim().toUpperCase())
  );

  for (let i = 1; i <= maxNumber; i++) {
    const suffix = String(i).padStart(digitLen, '0');
    const candidate = `${prefix}${suffix}`;
    if (!existingSet.has(candidate)) {
      return candidate;
    }
  }

  return `${prefix}${String(maxNumber).padStart(digitLen, '0')}`;
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

// Thêm sản phẩm mới
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

  const formattedTenSp = formatTitleCase(ten_sp);

  if (!formattedTenSp) {
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
    const autoMaSp = await generateUniqueMaSp(formattedTenSp);

    const [result] = await db.query(
      `INSERT INTO SANPHAM
        (ten_sp, ma_sp, ten_danh_muc, so_luong, gia_goc, hinh_anh, mo_ta_chi_tiet, trang_thai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        formattedTenSp,
        autoMaSp,
        String(ten_danh_muc).trim(),
        Number(so_luong) >= 0 ? Number(so_luong) : 0,
        Number(gia_goc),
        hinh_anh || null,
        mo_ta_chi_tiet ? String(mo_ta_chi_tiet).trim() : null,
        trang_thai ?? 1
      ]
    );
    res.status(201).json({
      success: true,
      id: result.insertId,
      ma_sp: autoMaSp,
      ten_sp: formattedTenSp
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.sqlMessage || error.message });
  }
});

// Cập nhật sản phẩm theo stt (tự động đổi lại ma_sp nếu tên sản phẩm thay đổi)
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

  const formattedTenSp = formatTitleCase(ten_sp);

  if (!formattedTenSp) {
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
    const [currentRows] = await db.query(
      'SELECT ten_sp, ma_sp FROM SANPHAM WHERE stt = ? LIMIT 1',
      [id]
    );

    if (currentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm cần cập nhật!'
      });
    }

    const oldTenSp = formatTitleCase(currentRows[0].ten_sp);
    const oldMaSp = String(currentRows[0].ma_sp || '').trim().toUpperCase().slice(0, 5);
    const inputMaSp = String(ma_sp || '').trim().toUpperCase().slice(0, 5);

    let nextMaSp = inputMaSp || oldMaSp;

    // Nếu tên sản phẩm thay đổi hoặc mã hiện tại chưa khớp tiền tố tên mới -> sinh lại mã mới
    const expectedPrefix = buildPrefix(formattedTenSp);
    if (
      formattedTenSp !== oldTenSp ||
      !nextMaSp ||
      !nextMaSp.startsWith(expectedPrefix)
    ) {
      nextMaSp = await generateUniqueMaSp(formattedTenSp, id);
    }

    await db.query(
      `UPDATE SANPHAM
       SET ten_sp = ?, ma_sp = ?, ten_danh_muc = ?, so_luong = ?, gia_goc = ?, hinh_anh = ?, mo_ta_chi_tiet = ?, trang_thai = ?
       WHERE stt = ?`,
      [
        formattedTenSp,
        nextMaSp,
        String(ten_danh_muc).trim(),
        Number(so_luong) >= 0 ? Number(so_luong) : 0,
        Number(gia_goc),
        hinh_anh || null,
        mo_ta_chi_tiet ? String(mo_ta_chi_tiet).trim() : null,
        trang_thai ?? 1,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Cập nhật thành công',
      ma_sp: nextMaSp,
      ten_sp: formattedTenSp
    });
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