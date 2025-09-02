import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Gravity Admin</h2>
        <nav>
          <ul>
            <li className="depth-1-menu">ABOUT US</li>
            <li className={location.pathname === '/admin' || location.pathname === '/admin/overview' ? 'active' : ''}>
              <Link to="/admin/overview">Overview</Link>
            </li>
            <li className={location.pathname === '/admin/organization' ? 'active' : ''}>
              <Link to="/admin/organization">Organization</Link>
            </li>
            <li className={location.pathname === '/admin/leadership' ? 'active' : ''}>
              <Link to="/admin/leadership">Leadership</Link>
            </li>
            <li className={location.pathname === '/admin/contact' ? 'active' : ''}>
              <Link to="/admin/contact">Contact us</Link>
            </li>
            <li className="depth-1-portfolio">PORTFOLIO</li>
            <li className={location.pathname === '/admin/portfolio' ? 'active' : ''}>
              <Link to="/admin/portfolio">Portfolio</Link>
            </li>
            <li className="depth-1-menu">BUSINESS STRATEGY</li>
            <li className={location.pathname === '/admin/investment-strategy' ? 'active' : ''}>
              <Link to="/admin/investment-strategy">Investment Strategy</Link>
            </li>
            <li className={location.pathname === '/admin/investment-process' ? 'active' : ''}>
              <Link to="/admin/investment-process">Investment Process</Link>
            </li>
            <li className={location.pathname === '/admin/risk-compliance' ? 'active' : ''}>
              <Link to="/admin/risk-compliance">Risk & Compliance</Link>
            </li>
            <li className="depth-1-menu">NEWS</li>
            <li className={location.pathname === '/admin/news' ? 'active' : ''}>
              <Link to="/admin/news">소식</Link>
            </li>
            <li className={location.pathname === '/admin/disclosure' ? 'active' : ''}>
              <Link to="/admin/disclosure">공시</Link>
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
