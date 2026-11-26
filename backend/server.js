const express = require('express');
const cors = require('cors');
const sanPhamRoutes = require('./routes/sanPhamRoutes');
const authRoutes = require('./routes/authRoutes');
const donHangRoutes = require('./routes/donHangRoutes');
const nguoiDungRoutes = require('./routes/nguoiDungRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (req, res) => {
  res.send(`
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #FAF6F0; margin: 0; font-family: 'Georgia', serif;">
      <div style="background: #ffffff; padding: 40px 60px; border-radius: 16px; box-shadow: 0 10px 30px rgba(92, 58, 33, 0.1); border: 1px solid #E8DFD8; text-align: center;">
        <h1 style="color: #5C3A21; font-size: 32px; margin: 0 0 15px 0; letter-spacing: 1px;">
          👑 ArentFashion Backend API 👑
        </h1>
        <p style="color: #8C6D53; font-size: 16px; margin: 0; font-style: italic;">
          Hệ thống máy chủ đang hoạt động ổn định và sẵn sàng kết nối!
        </p>
      </div>
    </div>
  `);
});

app.use('/api/sanpham', sanPhamRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/donhang', donHangRoutes);
app.use('/api/nguoidung', nguoiDungRoutes);

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});