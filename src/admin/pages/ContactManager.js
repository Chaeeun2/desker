import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { imageService } from '../services/imageService';
import AdminLayout from '../components/AdminLayout';

const ContactManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactData, setContactData] = useState({
    addressKo: '',
    addressEn: '',
    phone: '',
    fax: '',
    email: '',
    privacyVideoPolicyPdf: '',
    creditInfoPdf: ''
  });

  // Contact 데이터 로드
  const loadContactData = async () => {
    try {
      setLoading(true);
      const data = await dataService.contact.get();
      if (data) {
        setContactData({
          addressKo: data.addressKo || '',
          addressEn: data.addressEn || '',
          phone: data.phone || '',
          fax: data.fax || '',
          email: data.email || '',
          privacyVideoPolicyPdf: data.privacyVideoPolicyPdf || '',
          creditInfoPdf: data.creditInfoPdf || ''
        });
      }
    } catch (error) {
      // console.error('Contact 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadContactData();
  }, []);

  // 저장 처리
  const handleSubmit = async () => {
    try {
      setSaving(true);
      await dataService.contact.update(contactData);
      alert('저장되었습니다.');
    } catch (error) {
      // console.error('저장 오류:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 입력 필드 변경 처리
  const handleInputChange = (field, value) => {
    setContactData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // PDF 파일 업로드 처리
  const handlePdfUpload = async (field, file) => {
    if (!file) return;

    // 파일 타입 검증
    if (file.type !== 'application/pdf') {
      alert('PDF 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    try {
      // Cloudflare R2에 PDF 업로드 (기존 uploadFile 메서드 사용)
      const result = await imageService.uploadFile(file, { 
        source: 'contact-policy',
        prefix: field
      });
      
      if (result.success) {

        
        // 데이터에 URL 저장
        setContactData(prev => {
          const newData = {
            ...prev,
            [field]: result.fileUrl
          };
  
          return newData;
        });
        
        alert(`${file.name} 파일이 업로드되었습니다.`);
      } else {
        throw new Error('PDF 업로드에 실패했습니다.');
      }
    } catch (error) {
      // console.error('파일 업로드 오류:', error);
      alert('파일 업로드에 실패했습니다: ' + error.message);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-content-wrapper">
          <div className="admin-content">
            <h2 className="admin-page-title">Contact Us 관리</h2>
            <div className="admin-content-layout">
              <div className="admin-content-main">
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
          <h2 className="admin-page-title">Contact Us 관리</h2>
          
          <div className="admin-content-layout">
            <div className="admin-content-main">
              <div className="admin-content-header">
                <h3>연락처 정보 관리</h3>
                <button
                  type="button"
                  className="admin-button"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            
            <div className="admin-form">
              <div className="admin-form-section">
                <h4>본사 주소</h4>
                <div className="admin-form-row">
                  <div className="admin-form-group" style={{marginBottom: '0px'}}>
                    <label>국문</label>
                    <input
                      className="admin-input"
                      value={contactData.addressKo}
                      onChange={(e) => handleInputChange('addressKo', e.target.value)}
                      placeholder="국문 주소를 입력하세요"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="admin-form-group"  style={{marginBottom: '0px'}}>
                    <label>영문</label>
                    <input
                      className="admin-input"
                      value={contactData.addressEn}
                      onChange={(e) => handleInputChange('addressEn', e.target.value)}
                      placeholder="영문 주소를 입력하세요"
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-section">
                <h4>연락처 정보</h4>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>대표전화</label>
                    <input
                      type="tel"
                      className="admin-input"
                      value={contactData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="전화번호를 입력하세요 (예: 02-1234-5678)"
                      required
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label>대표팩스</label>
                    <input
                      type="tel"
                      className="admin-input"
                      value={contactData.fax}
                      onChange={(e) => handleInputChange('fax', e.target.value)}
                      placeholder="팩스번호를 입력하세요 (예: 02-1234-5679)"
                    />
                  </div>
                </div>
                
                <div className="admin-form-row">
                  <div className="admin-form-group"  style={{marginBottom: '0px'}}>
                    <label>대표메일</label>
                    <input
                      type="email"
                      className="admin-input"
                      value={contactData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="이메일을 입력하세요 (예: contact@company.com)"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-section">
                <h4>푸터 PDF 관리</h4>
                <div className="admin-form-row">
                  <div className="admin-form-group"  style={{marginBottom: '0px'}}>
                    <label>개인정보처리 및 영상정보처리기기운영관리방침</label>
                    <div className="pdf-upload-container">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handlePdfUpload('privacyVideoPolicyPdf', e.target.files[0])}
                        className="pdf-file-input"
                      />
                      {contactData.privacyVideoPolicyPdf && (
                        <div className="current-pdf" style={{paddingTop: '10px'}}>
                          <small>현재 파일: {imageService.getOriginalFileName(contactData.privacyVideoPolicyPdf.split('/').pop())}</small>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="admin-form-group"  style={{marginBottom: '0px'}}>
                    <label>신용정보활용체제</label>
                    <div className="pdf-upload-container">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handlePdfUpload('creditInfoPdf', e.target.files[0])}
                        className="pdf-file-input"
                      />
                      {contactData.creditInfoPdf && (
                        <div className="current-pdf" style={{paddingTop: '10px'}}>
                          <small>현재 파일: {imageService.getOriginalFileName(contactData.creditInfoPdf.split('/').pop())}</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
  );
};

export default ContactManager;
