import { useState } from 'react';
import logoDnhap1 from '../../Pictures/logodnhap1.png';
import logoDnhap2 from '../../Pictures/logodnhap2.png';
import okhoatim from '../../Pictures/okhoatim.png';
import API from '../api/axios';

function LoginPage({ onLoginSuccess, onSwitchToSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim();

    if (!cleanUser || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await API.post('/api/auth/login', {
        email: cleanUser,
        password
      });
      onLoginSuccess(data.user);
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || 'Không thể kết nối máy chủ. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FFF2F2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px 40px 16px',
        color: '#4B3635'
      }}
    >
      {/* Tiêu đề uốn cong "Welcome to" */}
      <div style={{ width: 'min(520px, 94vw)', marginBottom: '-22px', zIndex: 3, pointerEvents: 'none' }}>
        <svg viewBox="0 0 540 120" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
          <defs>
            <path id="welcomeArcPath" d="M 35,108 Q 270,18 505,108" />
          </defs>
          <text className="arent-arched-title" fontSize="58" textAnchor="middle">
            <textPath href="#welcomeArcPath" startOffset="50%">
              Welcome to
            </textPath>
          </text>
        </svg>
      </div>

      {/* Wrapper chứa ảnh ruy-băng & khung form */}
      <div
        style={{
          position: 'relative',
          width: 'min(500px, 94vw)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Ảnh trang trí phía trên khung form (logodnhap1.png) giữ nguyên tỉ lệ */}
        <div
          style={{
            width: '118%',
            maxWidth: '586px',
            marginBottom: '-172px',
            zIndex: 3,
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <img
            src={logoDnhap1}
            alt="Arent Dress Rental"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
        </div>

        {/* Thẻ form chính */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#F6E8DA',
            border: '3px solid #AF8888',
            borderRadius: '30px',
            padding: '132px 44px 0 44px',
            boxShadow: '0 8px 20px rgba(95, 68, 65, 0.24)',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#2B1F1E'
                }}
              >
                Tên đăng nhập
              </label>
              <input
                type="text"
                autoComplete="username"
                className="arent-auth-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=""
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 18px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#4B3635',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#2B1F1E'
                }}
              >
                Mật khẩu
              </label>
              <input
                type="password"
                autoComplete="current-password"
                className="arent-auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 18px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#4B3635',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            {errorMsg && (
              <div style={{ color: '#C53030', fontSize: '13px', textAlign: 'center', fontWeight: '700' }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <button
                type="submit"
                style={{
                  minWidth: '215px',
                  height: '46px',
                  padding: '0 32px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#CD9593',
                  color: '#FFFFFF',
                  fontSize: '19px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(175, 131, 131, 0.25)'
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </div>
          </form>

          {/* Quên mật khẩu với icon okhoatim */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => alert('Vui lòng liên hệ quản trị viên Arent Fashion để cấp lại mật khẩu.')}
              style={{
                background: 'none',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#5C4341',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <img src={okhoatim} alt="Lock icon" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
              <span>Quên mật khẩu?</span>
            </button>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: '24px',
              marginBottom: '6px',
              fontSize: '14px',
              fontWeight: '700',
              color: '#1F1716',
              position: 'relative',
              zIndex: 2
            }}
          >
            Tình yêu có tài khoản chưa?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#3B6EF5',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Đăng ký ngay đi!
            </button>
          </div>

          {/* Ảnh trang trí đáy khung form (logodnhap2.png) */}
          <div
            style={{
              margin: '-12px -44px 0 -44px',
              lineHeight: 0,
              pointerEvents: 'none'
            }}
          >
            <img
              src={logoDnhap2}
              alt="Floral & Butterfly Border"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                mixBlendMode: 'multiply'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;