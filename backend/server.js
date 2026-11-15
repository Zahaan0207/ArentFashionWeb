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