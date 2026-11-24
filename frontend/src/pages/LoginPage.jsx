import { useState } from 'react';
import logoDnhap1 from '../../Pictures/logodnhap1.png';
import logoDnhap2 from '../../Pictures/logodnhap2.png';

function LoginPage({ onLoginSuccess, onSwitchToSignup }) {
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

    if (cleanUser === 'admin') {
      onLoginSuccess({ username: 'admin', role: 'admin' });
    } else if (cleanUser === 'user') {
      onLoginSuccess({ username: 'user', role: 'user' });
    } else {
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
        padding: '24px 16px 36px 16px',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        color: '#4B3635'
      }}
    >
{/* Chữ "Welcome to" phía trên */}
      <h1
        style={{
          margin: '14px 0 4px 0',
          fontSize: '44px',
          fontFamily: 'Georgia, serif',
          fontWeight: '700',
          color: '#A47974',
          letterSpacing: '0.5px',
          textAlign: 'center',
          lineHeight: 1.15
        }}
      >
        Welcome to
      </h1>

    {/* Ảnh trang trí phía trên khung form (logodnhap1.png) */}
      <div
        style={{
          marginBottom: '-92px',
          transform: 'translateY(10px)',
          zIndex: 2,
          textAlign: 'center',
          width: '100%',
          maxWidth: '486px', // tăng thêm ~1.5cm (≈ 56px)
          pointerEvents: 'none'
        }}
      >
        <img
          src={logoDnhap1}
          alt="Arent Dress Rental"
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '286px', // tăng thêm ~1.5cm (≈ 56px) để ảnh phóng to đúng tỷ lệ
            objectFit: 'contain',
            display: 'block',
            margin: '0 auto',
            mixBlendMode: 'multiply'
          }}
        />
      </div>

      {/* Thẻ form chính */}
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: '#FAF0E4',
          border: '1.5px solid #B68F8B',
          borderRadius: '26px',
          padding: '78px 32px 0 32px',
          boxShadow: '0 8px 22px rgba(120, 86, 82, 0.14)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '7px', fontSize: '14px', fontWeight: '600', color: '#4B3635' }}>
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
            <label style={{ display: 'block', marginBottom: '7px', fontSize: '14px', fontWeight: '600', color: '#4B3635' }}>
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
              Đăng nhập
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

        <div style={{ textAlign: 'center', marginTop: '14px', marginBottom: '8px', fontSize: '13px', color: '#4B3635', position: 'relative', zIndex: 2 }}>
          Tình yêu có tài khoản chưa?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
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
        </div>

        {/* Ảnh trang trí đáy khung form (logodnhap2.png) */}
        <div
          style={{
            margin: '0 -32px',
            lineHeight: 0,
            pointerEvents: 'none'
          }}
        >
          <img
            src={logoDnhap2}
            alt="Floral & Butterfly Border"
            style={{
              width: '100%',
              height: '108px',
              objectFit: 'cover',
              objectPosition: 'center bottom',
              display: 'block',
              mixBlendMode: 'multiply'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;