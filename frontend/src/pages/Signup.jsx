import { useState } from 'react';
import logoDnhap2 from '../../Pictures/logodnhap2.png';
import butterflyLeft from '../assets/figma/butterfly-left.png';
import butterflyRight from '../assets/figma/butterfly-right.png';

function Signup({ onSignupSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim();
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();

    if (!cleanUser || !password.trim() || !confirmPassword.trim() || !cleanName || !cleanPhone) {
      return setErrorMsg('Vui lòng nhập đầy đủ tất cả các thông tin trên!');
    }
    if (password !== confirmPassword) {
      return setErrorMsg('Mật khẩu nhập lại chưa khớp!');
    }

    onSignupSuccess({
      username: cleanUser,
      fullName: cleanName,
      phone: cleanPhone,
      role: 'user'
    });
  };

  const inputStyle = {
    width: '100%',
    height: '44px',
    padding: '0 20px',
    borderRadius: '999px',
    border: 'none',
    backgroundColor: '#FFFFFF',
    color: '#4B3635',
    fontSize: '15px',
    fontWeight: '600',
    outline: 'none'
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
        padding: '24px 16px 36px 16px',
        color: '#4B3635'
      }}
    >
      {/* Tiêu đề uốn cong "Đăng Ký Thành Viên" */}
      <div style={{ width: 'min(660px, 96vw)', marginBottom: '-10px', pointerEvents: 'none' }}>
        <svg viewBox="0 0 680 116" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
          <defs>
            <path id="signupArcPath" d="M 30,108 Q 340,14 650,108" />
          </defs>
          <text className="arent-arched-title" fontSize="50" textAnchor="middle">
            <textPath href="#signupArcPath" startOffset="50%">
              Đăng Ký Thành Viên
            </textPath>
          </text>
        </svg>
      </div>

      {/* Wrapper chứa 2 con bướm trang trí tràn viền card */}
      <div
        style={{
          position: 'relative',
          width: 'min(520px, 92vw)'
        }}
      >
        <img
          src={butterflyLeft}
          alt="Butterfly left"
          style={{
            position: 'absolute',
            top: '96px',
            left: '-44px',
            width: '92px',
            height: 'auto',
            zIndex: 4,
            pointerEvents: 'none'
          }}
        />

        <img
          src={butterflyRight}
          alt="Butterfly right"
          style={{
            position: 'absolute',
            bottom: '198px',
            right: '-62px',
            width: '138px',
            height: 'auto',
            zIndex: 4,
            pointerEvents: 'none'
          }}
        />

        {/* Thẻ form chính */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#F8EADB',
            border: '3px solid #AF8888',
            borderRadius: '30px',
            padding: '28px 34px 0 34px',
            boxShadow: '0 8px 20px rgba(95, 68, 65, 0.24)',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1
          }}
        >
          <p
            style={{
              margin: '0 0 22px 0',
              textAlign: 'center',
              fontSize: '18px',
              fontWeight: '700',
              color: '#1F1716'
            }}
          >
            Vui lòng nhập đầy đủ các thông tin sau:
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input
              type="text"
              className="arent-auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên đăng nhập"
              style={inputStyle}
            />

            <input
              type="password"
              className="arent-auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              style={inputStyle}
            />

            <input
              type="password"
              className="arent-auth-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              style={inputStyle}
            />

            <input
              type="text"
              className="arent-auth-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Họ và tên"
              style={inputStyle}
            />

            <input
              type="tel"
              className="arent-auth-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Số điện thoại"
              style={inputStyle}
            />

            {errorMsg && (
              <div style={{ color: '#C53030', fontSize: '13px', textAlign: 'center', fontWeight: '700' }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px', position: 'relative', zIndex: 2 }}>
              <button
                type="submit"
                style={{
                  minWidth: '210px',
                  height: '48px',
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
              >
                Đăng ký
              </button>
            </div>
          </form>

          {/* Ảnh trang trí đáy khung form (logodnhap2.png) */}
          <div
            style={{
              margin: '-10px -34px 0 -34px',
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

      {/* Link chuyển về đăng nhập */}
      <div style={{ marginTop: '16px', fontSize: '14px', fontWeight: '600', color: '#4B3635' }}>
        Đã có tài khoản?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: '#3B6EF5',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Đăng nhập ngay!
        </button>
      </div>
    </div>
  );
}

export default Signup;
