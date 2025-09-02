import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import './AdminLayout.css';

const AdminLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();

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

    return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>데스커워케이션 Admin</h2>
        <nav>
          <ul>
            <li className={isActive('survey') ? 'active' : ''}>
            <Link to="/admin/survey">
              설문 응답 관리
            </Link>
          </li>
            <li className={isActive('email-templates') ? 'active' : ''}>
            <Link to="/admin/email-templates">
              이메일 템플릿
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