import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>데스커워케이션 Admin</h2>
        <nav>
          <ul>
            <li className="depth-1-menu">설문 관리</li>
            <li className={location.pathname === '/admin' || location.pathname === '/admin/survey' ? 'active' : ''}>
              <Link to="/admin/survey">설문 응답 관리</Link>
            </li>
            <li className={location.pathname === '/admin/survey-stats' ? 'active' : ''}>
              <Link to="/admin/survey-stats">설문 통계</Link>
            </li>
            <li className="depth-1-menu">콘텐츠 관리</li>
            <li className={location.pathname === '/admin/sections' ? 'active' : ''}>
              <Link to="/admin/sections">섹션 관리</Link>
            </li>
            <li className={location.pathname === '/admin/media' ? 'active' : ''}>
              <Link to="/admin/media">미디어 관리</Link>
            </li>
            <li className="depth-1-menu">이메일 관리</li>
            <li className={location.pathname === '/admin/email-templates' ? 'active' : ''}>
              <Link to="/admin/email-templates">이메일 템플릿</Link>
            </li>
            <li className={location.pathname === '/admin/email-logs' ? 'active' : ''}>
              <Link to="/admin/email-logs">발송 로그</Link>
            </li>
            <li className="depth-1-menu">시스템</li>
            <li className={location.pathname === '/admin/settings' ? 'active' : ''}>
              <Link to="/admin/settings">설정</Link>
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
