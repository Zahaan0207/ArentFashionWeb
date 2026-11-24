import { useState } from 'react';
// Nếu bạn lưu ảnh minh họa phần khung xanh vào Pictures/login-art.png thì mở 2 dòng dưới:
// import loginArt from '../../Pictures/login-art.png';

function LoginPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      return setErrorMsg('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!');
    }

    // Phân quyền mẫu: nhập admin -> vào AdminPage, nhập user -> vào UserShop
    if (cleanUser === 'admin') {
      onLoginSuccess({ username: 'admin', role: 'admin' });
    } else if (cleanUser === 'user') {
      onLoginSuccess({ username: 'user', role: 'user' });
    } else {
      // Nếu đăng ký hoặc nhập tài khoản khách mới thì mặc định vào giao diện User
      onLoginSuccess({ username: cleanUser, role: 'user' });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FBF3F1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 16px',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        color: '#4B3635'
      }}
    >
      {/* Tiêu đề "Welcome to" phía trên */}
      <h1
        style={{
          margin: '0 0 8px 0',
          fontSize: '42px',
          fontFamily: 'Georgia, serif',
          fontWeight: '700',
          color: '#A47974',
          letterSpacing: '0.5px',
          textAlign: 'center'
        }}
      >
        Welcome to
      </h1>

      {/* Khung minh họa / Logo ngay trên đỉnh thẻ form */}
      <div
        style={{
          marginBottom: '-26px',
          zIndex: 2,
          textAlign: 'center'
        }}
      >
        {/* Nếu có file ảnh minh họa thì dùng:
        <img src={loginArt} alt="Arent Dress Rental" style={{ maxWidth: '280px', height: 'auto', display: 'block', margin: '0 auto' }} />
        */}
        <div
          style={{
            display: 'inline-block',
            backgroundColor: '#FFFDFC',
            border: '1.5px solid #C69F9A',
            borderRadius: '999px',
            padding: '8px 24px',
            boxShadow: '0 4px 12px rgba(169, 130, 126, 0.14)'
          }}
        >
          <span
            style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              fontSize: '24px',
              fontWeight: '700',
              color: '#A9827E'
            }}
          >
            Arent
          </span>
          <div style={{ fontSize: '10px', letterSpacing: '2px', color: '#8A6562', fontWeight: '600' }}>
            DRESS RENTAL
          </div>
        </div>
      </div>

      {/* Thẻ form chính */}
      <div
        style={{
          width: '100%',
          maxWidth: '390px',
          backgroundColor: '#FAF0E4',
          border: '1.5px solid #B68F8B',
          borderRadius: '26px',
          padding: '44px 32px 28px 32px',
          boxShadow: '0 8px 22px rgba(120, 86, 82, 0.14)',
          boxSizing: 'border-box'
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '7px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#4B3635'
              }}
            >
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin hoặc user..."
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '999px',
                border: '1px solid #E5D5C8',
                backgroundColor: '#FFFFFF',
                color: '#4B3635',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '7px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#4B3635'
              }}
            >
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '999px',
                border: '1px solid #E5D5C8',
                backgroundColor: '#FFFFFF',
                color: '#4B3635',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {errorMsg && (
            <div style={{ color: '#C53030', fontSize: '13px', textAlign: 'center', fontWeight: '600' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
            <button
              type="submit"
              style={{
                minWidth: '175px',
                padding: '11px 28px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: '#C49692',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(169, 130, 126, 0.28)'
              }}
            >
              {isRegister ? 'Đăng ký' : 'Đăng nhập'}
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <button
            type="button"
            onClick={() => alert('Vui lòng liên hệ quản trị viên Arent Fashion để cấp lại mật khẩu.')}
            style={{
              background: 'none',
              border: 'none',
              color: '#5A4240',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Quên mật khẩu?
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#4B3635' }}>
          {isRegister ? (
            <>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#2563EB',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Đăng nhập ngay!
              </button>
            </>
          ) : (
            <>
              Tình yêu có tài khoản chưa?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#2563EB',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Đăng ký ngay đi!
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;