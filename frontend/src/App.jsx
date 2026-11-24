import { useState } from 'react';
import LoginPage from './pages/login/LoginPage';
import AdminPage from './admin/AdminPage';
import UserShop from './user/UserShop';

const STORAGE_KEY = 'arent_current_user';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch {
      // Bỏ qua nếu trình duyệt chặn localStorage
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Bỏ qua nếu trình duyệt chặn localStorage
    }
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminPage user={currentUser} onLogout={handleLogout} />;
  }

  return <UserShop user={currentUser} onLogout={handleLogout} />;
}

export default App;