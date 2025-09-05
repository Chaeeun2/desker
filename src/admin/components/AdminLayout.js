import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import './AdminLayout.css';

const AdminLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      alert('로그아웃 실패: ' + error.message);
    }
  };

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  // 모바일에서는 PC 접속 안내 메시지 표시
  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          maxWidth: '400px',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>
            관리자 페이지
          </h2>
          <p style={{ 
            fontSize: '16px', 
            lineHeight: '1.6', 
            color: '#666',
            marginBottom: '30px'
          }}>
            관리자 페이지는 PC에서만 이용 가능합니다.<br/>
            PC 또는 태블릿에서 접속해주세요.
          </p>
          <div style={{
            padding: '15px',
            backgroundColor: '#e3f2fd',
            borderRadius: '5px',
            fontSize: '14px',
            color: '#1565c0'
          }}>
            💻 데스크톱 브라우저에서 접속해주세요
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>데스커워케이션 Admin</h2>
        <nav>
          <ul>
            <li className={isActive('survey') && !isActive('survey-editor') ? 'active' : ''}>
            <Link to="/admin/survey">
              설문 응답 관리
            </Link>
          </li>
            <li className={isActive('survey-editor') ? 'active' : ''}>
            <Link to="/admin/survey-editor">
              설문지 수정
            </Link>
          </li>
            <li className={isActive('email-templates') ? 'active' : ''}>
            <Link to="/admin/email-templates">
              이메일 템플릿
            </Link>
          </li>
            <li className={isActive('gallery') ? 'active' : ''}>
            <Link to="/admin/gallery">
              갤러리 관리
            </Link>
          </li>
            <li className={isActive('work-life') ? 'active' : ''}>
            <Link to="/admin/work-life">
              워크라이프 관리
            </Link>
          </li>

          </ul>
        </nav>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;