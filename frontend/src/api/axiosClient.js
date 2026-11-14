import axiosClient from './api/axiosClient'; 

const axiosClient = axios.create({
  // Lấy link từ biến môi trường của Vite, nếu không có sẽ tự động trỏ về link Render của bạn
  baseURL: import.meta.env.VITE_API_URL || 'https://arentfashionweb-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default axiosClient;