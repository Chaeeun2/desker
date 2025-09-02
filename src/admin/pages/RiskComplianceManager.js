import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import AdminLayout from '../components/AdminLayout';

const RiskComplianceManager = () => {
  const [riskData, setRiskData] = useState({
    title: '',
    description: '',
    content: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    try {
      setLoading(true);
      const data = await dataService.riskCompliance.getAll();
      if (data.length > 0) {
        setRiskData(data[0]);
      }
    } catch (error) {
      // console.error('Risk & Compliance 데이터 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (riskData.id) {
        await dataService.riskCompliance.update(riskData.id, riskData);
      } else {
        await dataService.riskCompliance.add(riskData);
      }
      alert('저장되었습니다.');
    } catch (error) {
      // console.error('저장 오류:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-content">
          <h2 className="admin-page-title">Risk & Compliance 관리</h2>
                <div className="admin-content-wrapper">
            <div className="admin-content">
              <div className="admin-content-header">
                <h3>Risk & Compliance 관리</h3>
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
                      <h2 className="admin-page-title">Risk & Compliance 관리</h2>
                          <div className="admin-content-layout">
<p style={{fontSize: '1.8rem', lineHeight: '1.8'}}>Risk & Compliance 페이지 수정이 필요하시면 <a href="mailto:contact@alolot.kr" style={{color: 'black', textDecoration: 'underline'}}>contact@alolot.kr</a>로 문의해주세요.<br/>빠른 시일 내에 반영해드리겠습니다.</p>
                          </div>
                          </div>
                  </div>
      </div>
    </AdminLayout>
  );
};

export default RiskComplianceManager;
