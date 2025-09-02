import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import AdminLayout from '../components/AdminLayout';

const OrganizationManager = () => {
  const [orgData, setOrgData] = useState({
    title: '',
    description: '',
    content: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOrgData();
  }, []);

  const loadOrgData = async () => {
    try {
      setLoading(true);
      const data = await dataService.organization.getAll();
      if (data.length > 0) {
        setOrgData(data[0]);
      }
    } catch (error) {
      // console.error('Organization 데이터 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (orgData.id) {
        await dataService.organization.update(orgData.id, orgData);
      } else {
        await dataService.organization.add(orgData);
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
          <h2 className="admin-page-title">Organization 관리</h2>
                <div className="admin-content-wrapper">
            <div className="admin-content">
              <div className="admin-content-header">
                <h3>Organization 관리</h3>
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
                      <h2 className="admin-page-title">Organization 관리</h2>
                          <div className="admin-content-layout">
<p style={{fontSize: '1.8rem', lineHeight: '1.8'}}>Organization 페이지 수정이 필요하시면 <a href="mailto:contact@alolot.kr" style={{color: 'black', textDecoration: 'underline'}}>contact@alolot.kr</a>로 문의해주세요.<br/>빠른 시일 내에 반영해드리겠습니다.</p>
                          </div>
                          </div>
                  </div>
      </div>
    </AdminLayout>
  );
};

export default OrganizationManager;
