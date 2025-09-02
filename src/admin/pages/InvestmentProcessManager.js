import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';

const InvestmentProcessManager = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 간단한 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-content">
          <h2 className="admin-page-title">Investment Process 관리</h2>
          <div className="admin-content-wrapper">
            <div className="admin-content">
              <div className="admin-content-header">
                <h3>Investment Process 관리</h3>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-layout">
        
              <div className="admin-content-wrapper">
                  <div className="admin-content">
                      <h2 className="admin-page-title">Investment Process 관리</h2>
                          <div className="admin-content-layout">
<p style={{fontSize: '1.8rem', lineHeight: '1.8'}}>Investment Process 페이지 수정이 필요하시면 <a href="mailto:contact@alolot.kr" style={{color: 'black', textDecoration: 'underline'}}>contact@alolot.kr</a>로 문의해주세요.<br/>빠른 시일 내에 반영해드리겠습니다.</p>
                          </div>
                          </div>
                  </div>
      </div>
    </AdminLayout>
  );
};

export default InvestmentProcessManager;
