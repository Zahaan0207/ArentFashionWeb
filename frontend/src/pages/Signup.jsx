import { useState } from 'react';
import logoImg from '../../Pictures/logo.png';

function Signup({ onSignupSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim();
    if (!cleanUser || !password.trim()) {
      return setErrorMsg('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!');
    }
    if (password !== confirmPassword) {
      return setErrorMsg('Mật khẩu nhập lại chưa khớp!');
    }

    onSignupSuccess({ username: cleanUser, role: 'user' });
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
      <h1
        style={{
          margin: '0 0 8px 0',
          fontSize: '38px',
          fontFamily: 'Georgia, serif',
          fontWeight: '700',
          color: '#A47974',
          textAlign: 'center'
        }}
      >
        Đăng Ký Tài Khoản
      </h1>

      <div style={{ marginBottom: '-24px', zIndex: 2, textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFDFC',
            border: '1.5px solid #C69F9A',
            borderRadius: '999px',
            padding: '8px 22px',
            boxShadow: '0 4px 12px rgba(169, 130, 126, 0.14)'
          }}
        >
          <img
            src={logoImg}
            alt="Arent Fashion Logo"
            style={{ height: '26px', width: 'auto', objectFit: 'contain' }}
          />
          <span
            style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              fontSize: '22px',
              fontWeight: '700',
              color: '#A9827E'
            }}
          >
            Arent Fashion
          </span>
        </div>
      </div>

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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#4B3635' }}>
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên tài khoản của bạn..."
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
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#4B3635' }}>
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

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#4B3635' }}>
              Nhập lại mật khẩu
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Đăng ký
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#4B3635' }}>
          Đã có tài khoản?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
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
        </div>
      </div>
    </div>
  );
}

export default Signup;