const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM dresses ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, slug, category, price, stock_quantity, description } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO dresses (name, slug, category, price, stock_quantity, description) VALUES (?, ?, ?, ?, ?, ?)',
      [name, slug, category, price, stock_quantity || 0, description || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, slug, category, price, stock_quantity, description } = req.body;
  try {
    await db.query(
      'UPDATE dresses SET name = ?, slug = ?, category = ?, price = ?, stock_quantity = ?, description = ? WHERE id = ?',
      [name, slug, category, price, stock_quantity || 0, description || null, id]
    );
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM dresses WHERE id = ?', [id]);
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;