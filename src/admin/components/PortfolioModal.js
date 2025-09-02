import React, { useState, useEffect } from 'react';
import { imageService } from '../services/imageService';
import { dataService } from '../services/dataService';

const PortfolioModal = ({ isOpen, onClose, onSave, portfolio, categories = [] }) => {
  // 카테고리 옵션을 props로 받아서 사용
  const categoryOptions = categories.length > 0 ? categories : [
    { id: 'office', label: 'Office' },
    { id: 'logistics', label: 'Logistics' },
    { id: 'residence', label: 'Residence' },
    { id: 'hotel', label: 'Hotel' },
    { id: 'others', label: 'Others' }
  ];

  // 초기 formData 생성 함수
  const createInitialFormData = (portfolioData = null) => {
    const baseData = {
      image: '',
      category: 'office',
      categoryKo: '',
      categoryEn: '',
      titleKo: '',
      titleEn: '',
      locationKo: '',
      locationEn: '',
      gfaKo: '',
      gfaEn: '',
      floorsKo: '',
      floorsEn: ''
    };

    // 포트폴리오 데이터가 있으면 해당 데이터로 초기화
    if (portfolioData) {
      Object.keys(portfolioData).forEach(key => {
        if (key in baseData) {
          baseData[key] = portfolioData[key] || '';
        } else {
          // 동적 라벨 필드도 포함
          baseData[key] = portfolioData[key] || '';
        }
      });
    }

    return baseData;
  };

  const [formData, setFormData] = useState(() => createInitialFormData());
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [portfolioLabels, setPortfolioLabels] = useState([
    { id: 'location', label: 'Location' },
    { id: 'gfa', label: 'GFA' },
    { id: 'floor', label: 'Floor' }
  ]);

  useEffect(() => {
    if (portfolio) {
      // 기존 이미지 데이터 검증 (표시용)
      let displayImage = portfolio.image || '';
      let validImage = portfolio.image || '';
      
      // 표시용 이미지는 Base64도 허용 (미리보기용)
      if (displayImage && typeof displayImage === 'string') {
        if (displayImage.length > 1000000) {

          displayImage = '';
        }
      }
      
      // 저장용 이미지는 기존 이미지를 그대로 유지 (Base64도 허용)
      // 수정 시에는 기존 이미지를 보존하는 것이 중요
      if (validImage && typeof validImage === 'string') {
        if (validImage.length > 1000000) {

          validImage = '';
        }
      }
      
      const portfolioFormData = createInitialFormData(portfolio);
      portfolioFormData.image = validImage; // 기존 이미지 보존
      setFormData(portfolioFormData);
      setImagePreview(displayImage); // 표시용 (Base64도 허용)
    } else {
      setFormData(createInitialFormData());
      setImagePreview('');
      setImageFile(null);
    }
  }, [portfolio]);

  // 포트폴리오 라벨 로드
  useEffect(() => {
    const loadPortfolioLabels = async () => {
      try {
        const result = await dataService.getDocument('portfolio', 'labels');
        if (result.success && result.data && result.data.labels) {
          setPortfolioLabels(result.data.labels);
        }
      } catch (error) {

        // 기본 라벨 사용
      }
    };

    if (isOpen) {
      loadPortfolioLabels();
    }
  }, [isOpen]);

  // 컴포넌트 언마운트 시 Object URL 정리
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 2MB 이하 체크
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        alert(`이미지 파일 크기가 너무 큽니다.\n\n현재 파일 크기: ${fileSizeMB}MB\n최대 허용 크기: 2MB\n\n더 작은 이미지 파일을 선택해주세요.`);
        e.target.value = '';
        return;
      }

      // 파일 타입 체크 (이미지 파일만 허용)
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.\n\n지원되는 형식: JPG, PNG, GIF, WebP 등');
        e.target.value = '';
        return;
      }

      // 이전 Object URL 정리 (메모리 누수 방지)
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }

      setImageFile(file);
      
      // 메모리 효율적인 미리보기 생성 (Base64 대신 Object URL 사용)
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titleKo && !formData.titleEn) {
      alert('국문 또는 영문 제목을 입력해주세요.');
      return;
    }

    if (!formData.categoryKo && !formData.categoryEn) {
      alert('국문 또는 영문 분류를 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      
      // 이미지 데이터 검증 및 정리
      let finalImageUrl = formData.image;
      
      // 새로 선택된 이미지 파일이 있는 경우
      if (imageFile) {
        try {
          // 이미지 서비스를 사용하여 Cloudflare R2에 업로드
          const uploadResult = await imageService.uploadImage(imageFile, {
            prefix: 'portfolio',
            metadata: {
              category: formData.category || '',
              title: (formData.titleKo || formData.titleEn || '').substring(0, 100), // 길이 제한
              uploadedBy: 'admin-panel',
              timestamp: new Date().toISOString()
            }
          });
          
          if (uploadResult.success) {
            // Cloudflare에서 반환된 URL 사용
            finalImageUrl = uploadResult.publicUrl || uploadResult.imageUrl || uploadResult.url;
          } else {
            throw new Error('이미지 업로드에 실패했습니다.');
          }
        } catch (uploadError) {

          alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
          return;
        }
      }
      
      // 이미지 데이터 최종 검증 (Base64도 허용)
      if (finalImageUrl && typeof finalImageUrl === 'string') {
        // 길이 검증 (Firestore 1MB 제한 대비 안전 마진)
        if (finalImageUrl.length > 1000000) {

          alert('이미지 데이터가 너무 깁니다. 다시 시도해주세요.');
          return;
        }
      }

      const portfolioData = {
        ...formData,
        image: finalImageUrl
      };

      // 새로 추가하는 경우에만 createdAt과 order 설정
      if (!portfolio) {
        portfolioData.createdAt = new Date();
        portfolioData.order = 999;
      }

      await onSave(portfolioData);
    } catch (error) {

      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    if (saving) return;
    
    // 작성 중인 내용이 있는지 확인 (동적 필드 포함)
    const hasContent = Object.values(formData).some(value => value && value.toString().trim() !== '') || imageFile;
    
    if (hasContent) {
      if (window.confirm('작성 중인 내용이 있습니다. 닫으시겠습니까?')) {
        // 이미지가 Cloudflare에 업로드된 경우 삭제
        if (formData.image && formData.image !== portfolio?.image) {
          try {
            await imageService.deleteFromCloudflare(formData.image);
          } catch (error) {
  
          }
        }
        
        // 모든 내용 초기화
        setFormData(createInitialFormData());
        setImageFile(null);
        setImagePreview('');
        
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
                  <div className="admin-modal-header">
          <h3>{portfolio ? '포트폴리오 수정' : '새 포트폴리오 추가'}</h3>
          <div className="admin-button-group">
            <button
              type="button"
              className="admin-button admin-button-secondary"
              onClick={handleClose}
              disabled={saving}
            >
              취소
            </button>
            <button
              type="submit"
              className="admin-button"
              disabled={saving}
            >
              {saving ? '저장 중...' : (portfolio ? '수정' : '추가')}
            </button>
          </div>
        </div>

                  <div className="admin-modal-body">
            {/* 이미지 업로드 */}
            <div className="admin-form-section">
              <h4>이미지</h4>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="admin-input"
                  id="portfolio-image"
                />
                <small className="admin-form-help-text" style={{paddingTop: '0px', marginBottom: '10px', lineHeight: '1.6' }}>
                  지원 형식: JPG, PNG, GIF, WebP | 최대 크기: 2MB<br/><a href="https://www.adobe.com/kr/express/feature/image/resize/jpg" target="_blank" rel="noopener noreferrer" style={{color: '#666', textDecoration: 'underline'}}>이미지 용량 줄이기 →</a>
                </small>
                {imagePreview && (
                  <div className="admin-image-preview">
                    <img 
                      src={imagePreview} 
                      alt="미리보기" 
                      style={{ 
                        maxWidth: '80%', 
                        objectFit: 'contain',
                        borderRadius: '4px',
                        display: 'block',
                        margin: '0 auto'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 카테고리 선택 */}
            <div className="admin-form-section">
              <h4>카테고리</h4>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="admin-select"
                >
                  {categoryOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 분류 */}
            <div className="admin-form-section">
              <h4>운용 펀드</h4>
              <div className="admin-form-row">
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>국문</label>
                  <input
                    type="text"
                    value={formData.categoryKo}
                    onChange={(e) => handleInputChange('categoryKo', e.target.value)}
                    placeholder="운용 펀드(국문)을 입력하세요"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>영문</label>
                  <input
                    type="text"
                    value={formData.categoryEn}
                    onChange={(e) => handleInputChange('categoryEn', e.target.value)}
                    placeholder="운용 펀드(영문)을 입력하세요"
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

            {/* 제목 */}
            <div className="admin-form-section">
              <h4>펀드명</h4>
              <div className="admin-form-row">
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>국문</label>
                  <input
                    type="text"
                    value={formData.titleKo}
                    onChange={(e) => handleInputChange('titleKo', e.target.value)}
                    placeholder="펀드명(국문)을 입력하세요"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>영문</label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => handleInputChange('titleEn', e.target.value)}
                    placeholder="펀드명(영문)을 입력하세요"
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

            {/* 동적 라벨 섹션들 - 순서대로 렌더링 */}
            {portfolioLabels.map((labelItem) => {
              // 각 라벨에 대한 필드명 결정
              let koField, enField, koPlaceholder, enPlaceholder;
              
              if (labelItem.id === 'location') {
                koField = 'locationKo';
                enField = 'locationEn';
                koPlaceholder = `${labelItem.label}(국문)을 입력하세요`;
                enPlaceholder = `${labelItem.label}(영문)을 입력하세요`;
              } else if (labelItem.id === 'gfa') {
                koField = 'gfaKo';
                enField = 'gfaEn';
                koPlaceholder = `${labelItem.label}(국문)을 입력하세요`;
                enPlaceholder = `${labelItem.label}(영문)을 입력하세요`;
              } else if (labelItem.id === 'floor') {
                koField = 'floorsKo';
                enField = 'floorsEn';
                koPlaceholder = `${labelItem.label}(국문)을 입력하세요`;
                enPlaceholder = `${labelItem.label}(영문)을 입력하세요`;
              } else {
                koField = `${labelItem.id}Ko`;
                enField = `${labelItem.id}En`;
                koPlaceholder = `${labelItem.label}(국문)을 입력하세요`;
                enPlaceholder = `${labelItem.label}(영문)을 입력하세요`;
              }

              return (
                <div key={labelItem.id} className="admin-form-section">
                  <h4>{labelItem.label}</h4>
                  <div className="admin-form-row">
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label>국문</label>
                      <input
                        type="text"
                        value={formData[koField] || ''}
                        onChange={(e) => handleInputChange(koField, e.target.value)}
                        placeholder={koPlaceholder}
                        className="admin-input"
                      />
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label>영문</label>
                      <input
                        type="text"
                        value={formData[enField] || ''}
                        onChange={(e) => handleInputChange(enField, e.target.value)}
                        placeholder={enPlaceholder}
                        className="admin-input"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioModal;
