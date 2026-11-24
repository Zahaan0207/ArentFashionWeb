import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import Signup from './pages/Signup';
import AdminPage from './pages/AdminPage';
import UserShop from './pages/UserShop';

const STORAGE_KEY = 'arent_current_user';

function App() {
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'signup'
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
    setAuthScreen('login');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Bỏ qua nếu trình duyệt chặn localStorage
    }
  };

  if (!currentUser) {
    if (authScreen === 'signup') {
      return (
        <Signup
          onSignupSuccess={handleLoginSuccess}
          onSwitchToLogin={() => setAuthScreen('login')}
        />
      );
    }

    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => setAuthScreen('signup')}
      />
    );
  }

  if (currentUser.role === 'admin') {
    return <AdminPage user={currentUser} onLogout={handleLogout} />;
  }

  return <UserShop user={currentUser} onLogout={handleLogout} />;
}

export default App;