const express = require('express');
const cors = require('cors');
const dressRoutes = require('./routes/dressRoutes'); // hoặc đường dẫn tới file routes của bạn

const app = express(); // <-- Phải khởi tạo app ở đây trước!

// Sau đó mới dùng app.use
app.use(cors());
app.use(express.json());
app.use('/api/dresses', dressRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
}); 
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