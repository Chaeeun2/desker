import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginAdmin } from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { updateAuthState } = useAuth();

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
      
      
      navigate('/admin/overview');
    } catch (error) {
      // console.error('로그인 오류:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form onSubmit={handleSubmit}>
              <h2>그래비티자산운용 Admin</h2>
                      
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
