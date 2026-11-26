const express = require('express');
const router = express.Router();
const db = require('../config/db');

const VALID_ORDER_STATUSES = [
  'ChoXacNhan',
  'DaXacNhan',
  'DangGiao',
  'HoanThanh',
  'DaHuy'
];

// Lấy danh sách đơn hàng kèm chi tiết sản phẩm
router.get('/', async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM DONHANG ORDER BY ma_dh ASC'
    );

    const [details] = await db.query(
      `SELECT ct.ma_dh, ct.ma_sp_sp, ct.so_luong, ct.don_gia_ban, ct.thanh_tien,
              sp.ten_sp, sp.ma_sp, sp.hinh_anh
       FROM CHITIET_DH ct
       LEFT JOIN SANPHAM sp ON sp.stt = ct.ma_sp_sp`
    );

    const detailsByOrder = {};
    for (const d of details) {
      if (!detailsByOrder[d.ma_dh]) {
        detailsByOrder[d.ma_dh] = [];
      }
      detailsByOrder[d.ma_dh].push(d);
    }

    const enrichedOrders = orders.map((order) => ({
      ...order,
      chi_tiet: detailsByOrder[order.ma_dh] || []
    }));

    res.json({ success: true, data: enrichedOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.sqlMessage || error.message });
  }
});

// Tạo đơn hàng mới + lưu chi tiết đơn hàng + trừ tồn kho
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
      message: 'Số điện thoại phải gồm đúng 10 số và bắt đầu bằng số 0!'
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

      if (Number(sp.so_luong) < soLuong) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${sp.ten_sp}" chỉ còn ${sp.so_luong} sản phẩm trong kho.`
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

    const [maxRows] = await connection.query(
      'SELECT COALESCE(MAX(ma_dh), 0) + 1 AS nextMaDh FROM DONHANG FOR UPDATE'
    );
    const maDh = Number(maxRows[0].nextMaDh);

    await connection.query(
      `INSERT INTO DONHANG
        (ma_dh, ma_kh, ma_nv_duyet, nguoi_nhan, sdt_nhan, dia_chi_giao, phuong_thuc_tt, phi_van_chuyen, tong_thanh_toan, trang_thai_dh)
       VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, 'ChoXacNhan')`,
      [maDh, maKh, tenNguoiNhan, sdtNhan, diaChiGiao, phuongThucTt, phiShip, tongThanhToan]
    );

    for (const line of normalizedItems) {
      await connection.query(
        `INSERT INTO CHITIET_DH
          (ma_dh, ma_sp_sp, so_luong, don_gia_ban, thanh_tien)
         VALUES (?, ?, ?, ?, ?)`,
        [maDh, line.ma_sp_sp, line.so_luong, line.don_gia_ban, line.thanh_tien]
      );

      await connection.query(
        'UPDATE SANPHAM SET so_luong = GREATEST(so_luong - ?, 0) WHERE stt = ?',
        [line.so_luong, line.ma_sp_sp]
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

// Sửa thông tin đơn hàng (CHỈ cho phép khi trang_thai_dh = 'ChoXacNhan')
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const tenNguoiNhan = String(req.body.nguoi_nhan || '').trim();
  const sdtNhan = String(req.body.sdt_nhan || '').trim();
  const diaChiGiao = String(req.body.dia_chi_giao || '').trim();
  const phuongThucTt = String(req.body.phuong_thuc_tt || 'COD').trim();
  const phiShip = Number(req.body.phi_van_chuyen) >= 0 ? Number(req.body.phi_van_chuyen) : 0;

  if (!tenNguoiNhan || !sdtNhan || !diaChiGiao) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ Họ tên người nhận, Số điện thoại và Địa chỉ giao hàng!'
    });
  }

  if (!/^0\d{9}$/.test(sdtNhan)) {
    return res.status(400).json({
      success: false,
      message: 'Số điện thoại phải gồm đúng 10 số và bắt đầu bằng số 0!'
    });
  }

  try {
    const [orderRows] = await db.query(
      'SELECT ma_dh, trang_thai_dh, phi_van_chuyen, tong_thanh_toan FROM DONHANG WHERE ma_dh = ? LIMIT 1',
      [id]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy đơn hàng #${id}.`
      });
    }

    const currentOrder = orderRows[0];
    if (currentOrder.trang_thai_dh !== 'ChoXacNhan') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ được chỉnh sửa đơn hàng đang ở trạng thái "Chờ xác nhận"!'
      });
    }

    const [detailRows] = await db.query(
      'SELECT COALESCE(SUM(thanh_tien), 0) AS tongTienHang FROM CHITIET_DH WHERE ma_dh = ?',
      [id]
    );
    const tongTienHang = Number(detailRows[0].tongTienHang || 0);
    const newTongThanhToan =
      tongTienHang > 0
        ? tongTienHang + phiShip
        : Math.max(0, Number(currentOrder.tong_thanh_toan) - Number(currentOrder.phi_van_chuyen || 0)) + phiShip;

    await db.query(
      `UPDATE DONHANG
       SET nguoi_nhan = ?, sdt_nhan = ?, dia_chi_giao = ?, phuong_thuc_tt = ?, phi_van_chuyen = ?, tong_thanh_toan = ?
       WHERE ma_dh = ?`,
      [tenNguoiNhan, sdtNhan, diaChiGiao, phuongThucTt, phiShip, newTongThanhToan, id]
    );

    res.json({ success: true, message: 'Cập nhật thông tin đơn hàng thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.sqlMessage || error.message });
  }
});

// Cập nhật trạng thái đơn hàng
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const trangThaiDh = String(req.body.trang_thai_dh || '').trim();
  const maNvDuyet = req.body.ma_nv_duyet ? Number(req.body.ma_nv_duyet) : null;

  if (!VALID_ORDER_STATUSES.includes(trangThaiDh)) {
    return res.status(400).json({
      success: false,
      message: 'Trạng thái đơn hàng không hợp lệ!'
    });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [orderRows] = await connection.query(
      'SELECT ma_dh, trang_thai_dh FROM DONHANG WHERE ma_dh = ? LIMIT 1',
      [id]
    );

    if (orderRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy đơn hàng #${id}.`
      });
    }

    const oldStatus = orderRows[0].trang_thai_dh;

    if (oldStatus !== 'DaHuy' && trangThaiDh === 'DaHuy') {
      const [items] = await connection.query(
        'SELECT ma_sp_sp, so_luong FROM CHITIET_DH WHERE ma_dh = ?',
        [id]
      );
      for (const item of items) {
        await connection.query(
          'UPDATE SANPHAM SET so_luong = so_luong + ? WHERE stt = ?',
          [item.so_luong, item.ma_sp_sp]
        );
      }
    }

    if (oldStatus === 'DaHuy' && trangThaiDh !== 'DaHuy') {
      const [items] = await connection.query(
        'SELECT ma_sp_sp, so_luong FROM CHITIET_DH WHERE ma_dh = ?',
        [id]
      );
      for (const item of items) {
        await connection.query(
          'UPDATE SANPHAM SET so_luong = GREATEST(so_luong - ?, 0) WHERE stt = ?',
          [item.so_luong, item.ma_sp_sp]
        );
      }
    }

    await connection.query(
      `UPDATE DONHANG
       SET trang_thai_dh = ?, ma_nv_duyet = COALESCE(?, ma_nv_duyet)
       WHERE ma_dh = ?`,
      [trangThaiDh, maNvDuyet, id]
    );

    await connection.commit();
    res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công!' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({ success: false, message: error.sqlMessage || error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Xóa đơn hàng (CHỈ cho phép khi trang_thai_dh = 'ChoXacNhan')
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [orderRows] = await connection.query(
      'SELECT ma_dh, trang_thai_dh FROM DONHANG WHERE ma_dh = ? LIMIT 1',
      [id]
    );

    if (orderRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy đơn hàng #${id}.`
      });
    }

    if (orderRows[0].trang_thai_dh !== 'ChoXacNhan') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Chỉ được xóa đơn hàng đang ở trạng thái "Chờ xác nhận"!'
      });
    }

    const [items] = await connection.query(
      'SELECT ma_sp_sp, so_luong FROM CHITIET_DH WHERE ma_dh = ?',
      [id]
    );
    for (const item of items) {
      await connection.query(
        'UPDATE SANPHAM SET so_luong = so_luong + ? WHERE stt = ?',
        [item.so_luong, item.ma_sp_sp]
      );
    }

    await connection.query('DELETE FROM CHITIET_DH WHERE ma_dh = ?', [id]);
    await connection.query('DELETE FROM DONHANG WHERE ma_dh = ?', [id]);

    await connection.commit();
    res.json({ success: true, message: `Đã xóa đơn hàng #${id}!` });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({ success: false, message: error.sqlMessage || error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;