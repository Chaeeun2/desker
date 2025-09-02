import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import AdminLayout from '../components/AdminLayout';

const OverviewManager = () => {
  const [overviewData, setOverviewData] = useState({
    subtitleKo: '',
    subtitleEn: '',
    descriptionKo: [''],
    descriptionEn: ['']
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('korean');

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      const data = await dataService.overview.getAll();
      
      if (data.length > 0) {
        // 기존 데이터가 있으면 로드
        setOverviewData({
          id: data[0].id,
          subtitleKo: data[0].subtitleKo || '',
          subtitleEn: data[0].subtitleEn || '',
          descriptionKo: data[0].descriptionKo || [''],
          descriptionEn: data[0].descriptionEn || ['']
        });
      } else {
        // 데이터가 없으면 빈 상태로 설정
        setOverviewData({
          subtitleKo: '',
          subtitleEn: '',
          descriptionKo: [''],
          descriptionEn: ['']
        });
      }
    } catch (error) {
      // console.error('Overview 데이터 로딩 오류:', error);
      setOverviewData({
        subtitleKo: '',
        subtitleEn: '',
        descriptionKo: [''],
        descriptionEn: ['']
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (overviewData.id) {
        await dataService.overview.update(overviewData.id, overviewData);
      } else {
        await dataService.overview.add(overviewData);
      }
      alert('저장되었습니다.');
    } catch (error) {
      // console.error('저장 오류:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubtitleChange = (language, value) => {
    if (language === 'ko') {
      setOverviewData({...overviewData, subtitleKo: value});
    } else {
      setOverviewData({...overviewData, subtitleEn: value});
    }
  };

  const handleDescriptionChange = (language, index, value) => {
    if (language === 'ko') {
      const newDescription = [...overviewData.descriptionKo];
      newDescription[index] = value;
      setOverviewData({...overviewData, descriptionKo: newDescription});
    } else {
      const newDescription = [...overviewData.descriptionEn];
      newDescription[index] = value;
      setOverviewData({...overviewData, descriptionEn: newDescription});
    }
  };

  const removeDescriptionParagraph = (language, index) => {
    if (language === 'ko') {
      if (overviewData.descriptionKo.length > 1) {
        const newDescription = overviewData.descriptionKo.filter((_, i) => i !== index);
        setOverviewData({...overviewData, descriptionKo: newDescription});
      }
    } else {
      if (overviewData.descriptionEn.length > 1) {
        const newDescription = overviewData.descriptionEn.filter((_, i) => i !== index);
        setOverviewData({...overviewData, descriptionEn: newDescription});
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-content">
          <h2 className="admin-page-title">Overview 관리</h2>
                <div className="admin-content-wrapper">
            <div className="admin-content">
              <div className="admin-content-header">
                <h3>Overview 관리</h3>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
      <AdminLayout>
          <div className="admin-content-wrapper">
      <div className="admin-content">
        <h2 className="admin-page-title">Overview 관리</h2>
        
        {/* 탭 네비게이션 */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'korean' ? 'active' : ''}`}
            onClick={() => setActiveTab('korean')}
          >
            국문
          </button>
          <button
            className={`admin-tab ${activeTab === 'english' ? 'active' : ''}`}
            onClick={() => setActiveTab('english')}
          >
            영문
          </button>
        </div>
        
        <div className="admin-content-layout">
          <div className="admin-content-main">
            <div className="admin-content-header">
              <h3>Overview 관리</h3>             <div className="admin-button-group">
              <button
                className="admin-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
            </div>
            
            {/* 국문 탭 */}
            {activeTab === 'korean' && (
              <div className="admin-content-section">
                <div className="admin-form-section">
                  <h4>부제목 (국문)</h4>
                  <textarea
                    className="admin-textarea"
                    value={overviewData.subtitleKo}
                    onChange={(e) => handleSubtitleChange('ko', e.target.value)}
                    placeholder="국문 부제목을 입력하세요"
                    rows="3"
                  />
                </div>
                
                <div className="admin-form-section">
                  <h4>설명 (국문)</h4>
                  {overviewData.descriptionKo.map((paragraph, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '10px'
                      }}>
                      </div>
                      <textarea
                        className="admin-textarea"
                        value={paragraph}
                        onChange={(e) => handleDescriptionChange('ko', index, e.target.value)}
                        placeholder={`국문 내용을 입력하세요`}
                              rows="6"
                              style={{ minHeight: '400px' }}
                      />
                      <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                        <strong>**텍스트**</strong> 형태로 강조할 텍스트를 표시할 수 있습니다.
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 영문 탭 */}
            {activeTab === 'english' && (
              <div className="admin-content-section">
                <div className="admin-form-section">
                  <h4>부제목 (영문)</h4>
                  <textarea
                    className="admin-textarea"
                    value={overviewData.subtitleEn}
                    onChange={(e) => handleSubtitleChange('en', e.target.value)}
                    placeholder="영문 부제목을 입력하세요"
                    rows="3"
                  />
                </div>
                
                <div className="admin-form-section">
                  <h4>설명 (영문)</h4>
                  {overviewData.descriptionEn.map((paragraph, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '10px'
                      }}>
                      </div>
                      <textarea
                        className="admin-textarea"
                        value={paragraph}
                        onChange={(e) => handleDescriptionChange('en', index, e.target.value)}
                        placeholder={`영문 내용을 입력하세요`}
                              rows="6"
                              style={{ minHeight: '400px' }}
                      />
                      <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                        <strong>**텍스트**</strong> 형태로 강조할 텍스트를 표시할 수 있습니다.
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            )}
        
          </div>
        </div>
              </div>
              </div>
    </AdminLayout>
  );
};

export default OverviewManager;
