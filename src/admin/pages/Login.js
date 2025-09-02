import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginAdmin } from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { updateAuthState } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        fontFamily: 'var(--font-pret)'
      }}>
        <div style={{
          textAlign: 'center',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h2 style={{ 
            marginBottom: '20px', 
            fontSize: '24px',
            fontWeight: '700',
            color: '#333'
          }}>
            관리자 로그인
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#666',
            lineHeight: '1.5',
            margin: 0
          }}>
            관리자 페이지는 PC에서만 이용 가능합니다.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await loginAdmin(email, password);
      
      // 인증 상태 즉시 업데이트
      await updateAuthState(result.user, result.isAdmin);
      
      
      navigate('/admin/survey');
    } catch (error) {

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form onSubmit={handleSubmit}>
              <h2>데스커워케이션 Admin</h2>
                      
        <div className="admin-login-guide">
          <p>관리자 계정은 제작사에 문의 바랍니다.</p>
        </div>
        
        <div className="admin-form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            className="admin-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="관리자 이메일을 입력하세요"
            required
          />
        </div>
        
        <div className="admin-form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            className="admin-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>
        
        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading}
          className="admin-button"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
};

export default Login;
