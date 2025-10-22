import React, { useEffect, useState, useRef } from 'react';
import styles from './SurveyModal.module.css';
import { saveSurveyResponse } from '../../services/surveyService';
import { imageService } from '../../admin/services/imageService';
import { sendSurveyConfirmationEmail, sendAdminNotificationEmail } from '../../services/emailService';
import { getActiveSurveySchema } from '../../services/surveySchemaService';

const SurveyModal = ({ isOpen, onClose }) => {
  const hasOpenedRef = useRef(false); // 모달이 실제로 열렸는지 추적
  const [currentStep, setCurrentStep] = useState(0); // 0: 인트로, 1-5: 설문 단계
  const [indicatorStep, setIndicatorStep] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState([]); // 여러 이미지 미리보기를 위한 배열로 변경
  const [emailError, setEmailError] = useState(''); // 이메일 에러 메시지
  const [emailForPrizesError, setEmailForPrizesError] = useState(''); // 경품용 이메일 에러
  const [surveySchema, setSurveySchema] = useState(null);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [surveyAnswers, setSurveyAnswers] = useState({
    hasExperienced: '', // 양양 워케이션 경험 여부
    goodPoints: '', // 좋았던 점
    photoUrls: [], // 업로드된 사진 URL들 (배열로 변경)
    siteDiscovery: [], // 사이트를 어떤 경로로 알게 되셨나요
    siteDiscoverySearch: '', // 검색 선택 시 검색어
    siteDiscoveryOther: '', // 기타 선택 시 내용
    visitPurpose: [], // 사이트 방문 목적
    visitPurposeOther: '', // 방문 목적 기타 내용
    companyName: '', // 회사명
    contactPerson: '', // 담당자명
    phoneNumber: '', // 전화번호 (개인정보용)
    brandPhoneNumber: '', // 전화번호 (브랜드 협업용)
    email: '', // 이메일
    emailForPrizes: '', // 경품용 이메일
    fullName: '', // 이름
    address: '', // 주소
    collaborationTitle: '', // 제목
    collaborationContent: '', // 협업제안내용
    workType: '', // 업무 유형
    importantSpace: [], // 중요한 공간
    importantSpaceOther: '', // 중요한 공간 기타
    discomfortPoints: '', // 불편한 점
    workEnvironment: [], // 업무 환경
    workEnvironmentOther: '', // 업무 환경 기타
    expectedActivities: [], // 기대 활동
    expectedActivitiesOther: '', // 기대 활동 기타
    privacyAgreement: false // 개인정보 동의
  });

  // 스키마 로드
  useEffect(() => {
    if (isOpen && !surveySchema) {
      loadSurveySchema();
    }
  }, [isOpen]);

  const loadSurveySchema = async () => {
    setSchemaLoading(true);
    const schema = await getActiveSurveySchema();
    setSurveySchema(schema);
    setSchemaLoading(false);
  };

  // 모달이 열려있을 때 body 스크롤 방지 및 URL 슬러그 추가
  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true; // 모달이 열렸음을 기록
      document.body.style.overflow = 'hidden';
      
      // URL에 survey 슬러그 추가
      const currentPath = window.location.pathname;
      if (!currentPath.includes('survey')) {
        window.history.pushState(null, '', '/survey');
      }
      
      // 모바일에서 키보드가 올라올 때 viewport 높이 변경 방지
      const handleViewportChange = () => {
        if (window.innerWidth <= 768) {
          // 모바일에서 키보드가 올라올 때 모달 위치 고정
          const modalContent = document.querySelector(`.${styles.modalContent}`);
          if (modalContent) {
            // dvh 값을 유지하면서 위치 고정
            modalContent.style.position = 'fixed';
            modalContent.style.top = '0';
            modalContent.style.left = '0';
            modalContent.style.right = '0';
            modalContent.style.bottom = '0';
            modalContent.style.height = '100dvh';
            modalContent.style.transform = 'translateZ(0)';
          
            // 스크롤 위치 고정
            if (modalContent.scrollTop > 0) {
              modalContent.scrollTop = 0;
            }
          }
        }
      };

      // viewport 높이 변경 감지
      window.addEventListener('resize', handleViewportChange);
      window.addEventListener('orientationchange', handleViewportChange);
    
      // 모바일에서 키보드 표시/숨김 감지
      const handleVisualViewportChange = () => {
        if (window.visualViewport && window.innerWidth <= 768) {
          const modalContent = document.querySelector(`.${styles.modalContent}`);
          if (modalContent) {
            // visualViewport 변경 시 모달 위치 조정
            const currentHeight = window.visualViewport.height;
            modalContent.style.height = `${currentHeight}px`;
          }
        }
      };
    
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      }
    
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('resize', handleViewportChange);
        window.removeEventListener('orientationchange', handleViewportChange);
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
        }
      };
    } else {
      document.body.style.overflow = 'unset';
    
      // 모달이 실제로 열렸다가 닫힐 때만 survey 슬러그 제거
      if (hasOpenedRef.current) {
        const currentHash = window.location.hash.replace('#', '');
        if (currentHash === 'survey') {
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    }
  }, [isOpen]);

  // 모달이 열릴 때 초기 상태로 리셋
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIndicatorStep(0);
      setPhotoPreview([]);
      setUploadingPhoto(false);
      setEmailError('');
      setEmailForPrizesError('');
      setSurveyAnswers({
        hasExperienced: '',
        goodPoints: '',
        photoUrls: [],
        siteDiscovery: [],
        visitPurpose: [],
        siteDiscoverySearch: '',
        siteDiscoveryOther: '',
        visitPurposeOther: '',
        companyName: '',
        contactPerson: '',
        phoneNumber: '',
        brandPhoneNumber: '',
        email: '',
        collaborationTitle: '',
        collaborationContent: '',
        workEnvironment: '',
        workEnvironmentOther: '',
        expectedActivities: [],
        expectedActivitiesOther: '',
        fullName: '',
        address: '',
        emailForPrizes: '',
        privacyAgreement: false
      });
    }
  }, [isOpen]);

  const handlePrev = () => {
    // 이전 버튼을 누를 때마다 indicatorStep을 -1씩 감소
    setIndicatorStep(prev => Math.max(1, prev - 1));
    
    // 모달 내 스크롤을 최상위로 이동
    const modalBodyContainer = document.querySelector(`.${styles.modalBodyContainer}`);
    if (modalBodyContainer) {
      modalBodyContainer.scrollTop = 0;
    }
    
    if (currentStep === 1) {
      setCurrentStep(0);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      // 브랜드 협업 체크 여부에 따라 이전 단계 결정
      if (surveyAnswers.visitPurpose.includes('brand_collaboration')) {
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 5) {
      setCurrentStep(4);
    } else if (currentStep === 6) {
      setCurrentStep(5);
    }
  };

  const handleNext = () => {
    // 다음 버튼을 누를 때마다 indicatorStep을 +1씩 증가
    setIndicatorStep(prev => prev + 1);
    
    // 모달 내 스크롤을 최상위로 이동
    const modalBodyContainer = document.querySelector(`.${styles.modalBodyContainer}`);
    if (modalBodyContainer) {
      modalBodyContainer.scrollTop = 0;
    }
    
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // 브랜드 협업에 체크했는지 확인
      if (surveyAnswers.visitPurpose.includes('brand_collaboration')) {
        setCurrentStep(3);
      } else {
        setCurrentStep(4); // case 3 건너뛰기
      }
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    } else if (currentStep === 5) {
      setCurrentStep(6);
    } else if (currentStep === 6) {
      // '보내기' 버튼 클릭 시 이메일 발송 및 설문 제출
      submitSurvey();
    }
  };

  // 이메일 형식 검증 함수
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAnswerChange = (question, value) => {
    setSurveyAnswers(prev => ({
      ...prev,
      [question]: value
    }));
  };

  const handleCheckboxChange = (question, value) => {
    setSurveyAnswers(prev => {
      const currentValues = prev[question] || [];
      if (currentValues.includes(value)) {
        // 이미 선택된 값이면 제거
        return {
          ...prev,
          [question]: currentValues.filter(item => item !== value)
        };
      } else {
        // 선택되지 않은 값이면 추가
        return {
          ...prev,
          [question]: [...currentValues, value]
        };
      }
    });
  };

  const handleFileUpload = async (event, fieldName = 'photoUrls', question = {}) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      // 파일 검증 (고정값 사용)
      const maxSize = 10 * 1024 * 1024; // 10MB 고정
      const acceptedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.hwp', '.docx', '.webp', '.xlsx'];
      
      // 파일 형식 및 크기 검증
      const invalidFiles = [];
      const validFiles = [];
      
      files.forEach(file => {
        const fileName = file.name.toLowerCase();
        const fileExt = '.' + fileName.split('.').pop();
        
        if (!acceptedFormats.includes(fileExt)) {
          invalidFiles.push(`${file.name} - 지원하지 않는 파일 형식`);
        } else if (file.size > maxSize) {
          invalidFiles.push(`${file.name} - 파일 크기 초과 (최대 10MB)`);
        } else {
          validFiles.push(file);
        }
      });
      
      if (invalidFiles.length > 0) {
        alert('다음 파일을 업로드할 수 없습니다:' + invalidFiles.join(''));
      }
      
      if (validFiles.length === 0) {
        return;
      }
      
      setUploadingPhoto(true);
      
      try {
        // 각 파일에 대해 미리보기 생성 및 업로드
        const uploadPromises = validFiles.map(async (file) => {
          // 미리보기 생성
          const previewPromise = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result);
            };
            reader.readAsDataURL(file);
          });
          
          // 파일 업로드
          const uploadResult = await imageService.uploadFile(file, { 
            source: 'survey',
            prefix: 'survey-photos'
          });
          
          const preview = await previewPromise;
          
          return {
            preview,
            url: uploadResult.success ? uploadResult.fileUrl : null,
            error: uploadResult.success ? null : uploadResult.error
          };
        });
        
        const results = await Promise.all(uploadPromises);
        
        // 성공적으로 업로드된 이미지들 처리
        const successfulUploads = results.filter(r => r.url !== null);
        const failedUploads = results.filter(r => r.url === null);
        
        if (successfulUploads.length > 0) {
          // 미리보기 추가
          setPhotoPreview(prev => [...prev, ...successfulUploads.map(u => u.preview)]);
          
          // URL 추가
          setSurveyAnswers(prev => ({
            ...prev,
            [fieldName]: [...(prev[fieldName] || []), ...successfulUploads.map(u => u.url)]
          }));
        }
        
        if (failedUploads.length > 0) {
          alert(`${failedUploads.length}개의 이미지 업로드에 실패했습니다.`);
        }
      } catch (error) {
        console.error('File upload error:', error);
        alert('이미지 업로드 중 오류가 발생했습니다.');
      }
      
      setUploadingPhoto(false);
    }
  };
  
  // 개별 이미지 삭제 함수 추가
  const removeImage = (index) => {
    setPhotoPreview(prev => prev.filter((_, i) => i !== index));
    setSurveyAnswers(prev => ({
      ...prev,
      photoUrls: prev.photoUrls.filter((_, i) => i !== index)
    }));
  };

  // 설문 제출 및 이메일 발송 함수
  const submitSurvey = async () => {
    try {
      // 로딩 상태 표시 (선택사항)
      const submitButton = document.querySelector(`.${styles.nextButton}`);
      if (submitButton) {
        submitButton.textContent = '전송 중...';
        submitButton.disabled = true;
      }

      // Firebase에 설문 데이터 저장
      
      // 쿠폰 발송용 이메일 주소 찾기
      const findCouponEmail = () => {
        // 모든 스텝의 이메일 타입 질문에서 sendCouponToThisEmail이 true인 것 찾기
        for (const step of surveySchema?.steps || []) {
          for (const question of step.questions || []) {
            if (question.type === 'email' && question.sendCouponToThisEmail) {
              const email = surveyAnswers[question.id];
              return email;
            }
          }
        }
        return null;
      };
      
      // 브랜드 협업 선택 여부 확인
      const isBrandCollaboration = surveyAnswers.visitPurpose && surveyAnswers.visitPurpose.includes('brand_collaboration');
      
      // 설문 데이터 생성 (불필요한 필드 제거)
      const cleanedAnswers = { ...surveyAnswers };
      
      // 브랜드 협업을 선택하지 않았으면 브랜드 협업 관련 필드들 제거
      if (!isBrandCollaboration) {
        delete cleanedAnswers.email;
        delete cleanedAnswers.companyName;
        delete cleanedAnswers.contactPerson;
        delete cleanedAnswers.collaborationTitle;
        delete cleanedAnswers.collaborationContent;
        delete cleanedAnswers.brandPhoneNumber;
      }
      
      
      const surveyData = {
        // 정리된 surveyAnswers 데이터를 포함
        ...cleanedAnswers,
        
        // 개인정보 (재정의)
        email: findCouponEmail() || (isBrandCollaboration ? surveyAnswers.email : surveyAnswers.emailForPrizes),
        fullName: surveyAnswers.fullName,
        phoneNumber: surveyAnswers.phoneNumber || '',
        address: surveyAnswers.address
      };

      // 스키마 버전 정보 추가
      const surveyDataWithSchema = {
        ...surveyData,
        schemaVersion: surveySchema?.version || 'v1.0',
        schemaId: surveySchema?.id || null
      };

      const result = await saveSurveyResponse(surveyDataWithSchema);
      
      if (result.success) {
        // 이메일 발송 (실패해도 설문 제출은 성공으로 처리)
        try {
          // 사용자에게 확인 이메일 발송
          const emailResult = await sendSurveyConfirmationEmail(surveyData);
          
          // 관리자에게 알림 이메일 발송
          const adminEmailResult = await sendAdminNotificationEmail(surveyData);
          
          // 이메일 발송 상태에 관계없이 설문 제출은 성공
          alert(`여러분의 WORK-LIFE에 대한 소중한 답변에 감사드립니다.
데스커 공식몰 쿠폰북 5종과 함께 워케이션 시작하기 툴키트를 메일로 보내드렸어요. 💌

지금 바로 메일함에서 확인해 보세요!
*발급 한달 이내 사용 가능`);
          
          // 이메일 발송 성공 시 추가 안내 (콘솔에만 로그)
          if (emailResult.success) {
          }
        } catch (emailError) {
          alert(`여러분의 WORK-LIFE에 대한 소중한 답변에 감사드립니다.
데스커 공식몰 쿠폰북 5종과 함께 워케이션 시작하기 툴키트를 메일로 보내드렸어요. 💌

지금 바로 메일함에서 확인해 보세요!
*발급 한달 이내 사용 가능`);
        }
        
        onClose();
      } else {
        throw new Error(result.error || '설문 저장에 실패했습니다.');
      }
    } catch (error) {
      alert('설문 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
      
      // 버튼 원래 상태로 복구
      const submitButton = document.querySelector(`.${styles.nextButton}`);
      if (submitButton) {
        submitButton.textContent = '보내기';
        submitButton.disabled = false;
      }
    }
  };

  const renderProgressIndicator = () => {
    // 브랜드 협업에 체크한 경우 6단계, 그렇지 않으면 5단계
    const totalSteps = surveyAnswers.visitPurpose.includes('brand_collaboration') ? 6 : 5;
    
    return (
      <div className={`${styles.progressIndicator} ${totalSteps === 6 ? styles.sixSteps : ''}`}>
        {Array.from({ length: totalSteps }, (_, index) => index + 1).map((step) => (
          <div
            key={step}
            className={`${styles.progressStep} ${
              step <= indicatorStep ? styles.completed : ''
            } ${step === indicatorStep ? styles.current : ''}`}
          >
            <span className={styles.checkmark}>✓</span>
          </div>
        ))}
      </div>
    );
  };

  // 동적 질문 렌더링 함수
  const renderDynamicQuestion = (question) => {
    const fieldName = question.id;
    
    switch (question.type) {
      case 'radio':
        return (
          <div className={styles.radioGroup}>
            {question.options?.map((option) => (
              <div key={option.value}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name={fieldName}
                    value={option.value}
                    checked={surveyAnswers[fieldName] === option.value}
                    onChange={(e) => handleAnswerChange(fieldName, e.target.value)}
                  />
                  <span className={styles.radioText}>{option.label}</span>
                </label>
                
                {/* 동적 추가 질문 처리 */}
                {option.hasFollowUpQuestion && surveyAnswers[fieldName] === option.value && (
                  <input
                    type="text"
                    className={styles.otherInput}
                    placeholder={option.followUpQuestion || '추가 정보를 입력해주세요'}
                    value={surveyAnswers[`${fieldName}_${option.value}_followUp`] || ''}
                    onChange={(e) => handleAnswerChange(`${fieldName}_${option.value}_followUp`, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className={styles.checkboxGroup}>
            {question.options?.map((option) => (
              <div key={option.value}>
                <label className={styles.checkboxLabel}>
                <input
                    type="checkbox"
                    
                  value={option.value}
                  checked={surveyAnswers[fieldName]?.includes?.(option.value)}
                  onChange={(e) => {
                    const currentValues = surveyAnswers[fieldName] || [];
                    const newValues = e.target.checked 
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleAnswerChange(fieldName, newValues);
                  }}
                />
                <span className={styles.checkboxText}>{option.label}</span>
                </label>
                
                {/* 동적 추가 질문 처리 */}
                {option.hasFollowUpQuestion && surveyAnswers[fieldName]?.includes(option.value) && (
                  <input
                    type="text"
                    className={styles.otherInput}
                    placeholder={option.followUpQuestion || '추가 정보를 입력해주세요'}
                    value={surveyAnswers[`${fieldName}_${option.value}_followUp`] || ''}
                    onChange={(e) => handleAnswerChange(`${fieldName}_${option.value}_followUp`, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        );
      
      case 'textarea':
        return (
          <textarea
            className={styles.formTextarea}
            value={surveyAnswers[fieldName] || ''}
            onChange={(e) => handleAnswerChange(fieldName, e.target.value)}
            placeholder={question.placeholder || ''}
            rows={4}
          />
        );
      
      case 'file':
        return (
          <div className={styles.fileUploadSection}>
            <label className={styles.fileUploadButton}>
              <input
                type="file"
                multiple={question.multiple !== false}
                accept=".jpg,.jpeg,.png,.gif,.pdf,.hwp,.docx,.webp,.xlsx"
                onChange={(e) => handleFileUpload(e, fieldName, question)}
                style={{ display: 'none' }}
                key={photoPreview.length > 0 ? 'has-photo' : 'no-photo'}
              />
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000" className={styles.uploadIcon}>
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <title></title>
                  <g id="Complete">
                    <g id="upload">
                      <g>
                        <path d="M3,12.3v7a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2v-7" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        <g>
                          <polyline data-name="Right" fill="none" id="Right-2" points="7.9 6.7 12 2.7 16.1 6.7" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline>
                          <line fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="12" x2="12" y1="16.3" y2="4.8"></line>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
              <span className={styles.uploadText}>파일 첨부</span>
            </label>
            
            {uploadingPhoto && (
              <p className={styles.uploadStatus}>이미지 업로드 중...</p>
            )}
            
            {photoPreview.length > 0 && !uploadingPhoto && (
              <div className={styles.photoPreviewContainer}>
                {photoPreview.map((preview, index) => (
                  <div key={index} className={styles.photoPreview}>
                    <img src={preview} alt={`업로드된 사진 ${index + 1}`} />
                    <button 
                      type="button"
                      className={styles.removePhoto}
                      onClick={() => removeImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'tel':
        
        // 일반 tel 필드는 단일 입력
        return (
          <input
            type="tel"
            className={styles.formInput}
            value={surveyAnswers[fieldName] || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 허용
              handleAnswerChange(fieldName, value);
            }}
            placeholder={question.placeholder || ''}
            pattern="[0-9]*"
            inputMode="numeric"
          />
        );
      
      case 'email':
        return (
          <div className={styles.inputWrapper}>
            <input
              type="email"
              className={`${styles.formInput} ${surveyAnswers[`${fieldName}Error`] ? styles.errorInput : ''}`}
              value={surveyAnswers[fieldName] || ''}
              onChange={(e) => {
                handleAnswerChange(fieldName, e.target.value);
                if (surveyAnswers[`${fieldName}Error`]) {
                  handleAnswerChange(`${fieldName}Error`, ''); // 입력 시 에러 초기화
                }
              }}
              onBlur={(e) => {
                if (e.target.value && !validateEmail(e.target.value)) {
                  handleAnswerChange(`${fieldName}Error`, '올바른 이메일 형식이 아닙니다. (예: example@email.com)');
                } else {
                  handleAnswerChange(`${fieldName}Error`, '');
                }
              }}
              placeholder={question.placeholder || ''}
            />
            {surveyAnswers[`${fieldName}Error`] && (
              <div className={styles.errorTooltip}>
                {surveyAnswers[`${fieldName}Error`]}
              </div>
            )}
          </div>
        );
      
      case 'text':
      default:
        return (
          <input
            type="text"
            className={styles.formInput}
            value={surveyAnswers[fieldName] || ''}
            onChange={(e) => handleAnswerChange(fieldName, e.target.value)}
            placeholder={question.placeholder || ''}
          />
        );
    }
  };

  const renderSurveyStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className={styles.modalBodyImg}>
              <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/coupons.png" alt="데스커" />
            </div>
            
            <div className={styles.modalBody}>
              <h2 className={styles.title} dangerouslySetInnerHTML={{ __html: surveySchema?.title?.replace(/\n/g, '<br/>') }}>
              </h2>
              
              <p className={styles.description} dangerouslySetInnerHTML={{ __html: surveySchema?.description?.replace(/\n/g, '<br/>') }}>
              </p>
            </div>
          </>
        );

      case 1:
        return (
          <div className={styles.modalBody}>
            <div className={styles.questionSection}>
              {surveySchema?.steps?.[0]?.questions?.map((question, questionIndex) => {
                // 조건부 표시 처리
                if (question.condition) {
                  const { field, value, includes } = question.condition;
                  if (includes && !surveyAnswers[field]?.includes?.(value)) return null;
                  if (value && surveyAnswers[field] !== value) return null;
                }
                
                return (
                  <div key={question.id} className={styles.questionWrap}>
                    <h3 className={styles.questionTitle}>
                      {question.title}
                      {question.subtitle && <span className={styles.subtitle}>{question.subtitle}</span>}
                    </h3>
                    
                    {question.description && (
                      <div className={styles.uploadInfo}>
                        {question.description}
                      </div>
                    )}
                    
                    {renderDynamicQuestion(question)}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.modalBody}>
            <div className={styles.questionSection}>
              {surveySchema?.steps?.[1]?.questions?.map((question, questionIndex) => {
                // 조건부 표시 처리
                if (question.condition) {
                  const { field, value, includes } = question.condition;
                  if (includes && !surveyAnswers[field]?.includes?.(value)) return null;
                  if (value && surveyAnswers[field] !== value) return null;
                }
                
                return (
                  <div key={question.id} className={styles.questionWrap}>
                    <h3 className={styles.questionTitle}>
                      {question.title}
                      {question.subtitle && <span className={styles.subtitle}> {question.subtitle}</span>}
                    </h3>
                    
                    {renderDynamicQuestion(question)}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 3:
        // 브랜드 협업 관련 질문들 (조건부 표시)
        const brandCollabStep = surveySchema?.steps?.[2];
        
        if (!brandCollabStep || !surveyAnswers.visitPurpose?.includes?.('brand_collaboration')) {
          return null;
        }
        
        return (
          <div className={styles.modalBody}>
            <div className={styles.questionSection}>
              {brandCollabStep.questions?.map((question, questionIndex) => {
                // 조건부 표시 처리
                if (question.condition) {
                  const { field, value, includes } = question.condition;
                  if (includes && !surveyAnswers[field]?.includes?.(value)) return null;
                  if (value && surveyAnswers[field] !== value) return null;
                }
                
                return (
                  <div key={question.id} className={styles.questionWrap}>
                    <h3 className={styles.questionTitle}>
                      {question.title}
                      {question.subtitle && <span className={styles.subtitle}> {question.subtitle}</span>}
                    </h3>
                    
                    {renderDynamicQuestion(question)}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className={styles.modalBody}>
            <div className={styles.questionSection}>
              {surveySchema?.steps?.[3]?.questions?.map((question, questionIndex) => {
                // 조건부 표시 처리
                if (question.condition) {
                  const { field, value, includes } = question.condition;
                  if (includes && !surveyAnswers[field]?.includes?.(value)) return null;
                  if (value && surveyAnswers[field] !== value) return null;
                }
                
                return (
                  <div key={question.id} className={styles.questionWrap}>
                    <h3 className={styles.questionTitle}>
                      {question.title}
                      {question.subtitle && <span className={styles.subtitle}> {question.subtitle}</span>}
                    </h3>
                    
                    {renderDynamicQuestion(question)}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 5:
        return (
          <div className={styles.modalBody}>
            <div className={styles.questionSection}>
              {surveySchema?.steps?.[4]?.questions?.map((question, questionIndex) => {
                // 조건부 표시 처리
                if (question.condition) {
                  const { field, value, includes } = question.condition;
                  if (includes && !surveyAnswers[field]?.includes?.(value)) return null;
                  if (value && surveyAnswers[field] !== value) return null;
                }
                
                return (
                  <div key={question.id} className={styles.questionWrap}>
                    <h3 className={styles.questionTitle}>
                      {question.title}
                      {question.subtitle && <span className={styles.subtitle}> {question.subtitle}</span>}
                    </h3>
                    
                    {renderDynamicQuestion(question)}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 6:
        return (
          <div className={styles.modalBody}>
            <div className={styles.questionSection}>
              {surveySchema?.steps?.[5]?.questions?.map((question, questionIndex) => {
                // 조건부 표시 처리
                if (question.condition) {
                  const { field, value, includes } = question.condition;
                  if (includes && !surveyAnswers[field]?.includes?.(value)) return null;
                  if (value && surveyAnswers[field] !== value) return null;
                }
                
                return (
                  <div key={question.id} className={styles.questionWrap}>
                    <h3 className={styles.questionTitle}>
                      {question.title}
                      {question.subtitle && <span className={styles.subtitle}> {question.subtitle}</span>}
                    </h3>
                    
                    {renderDynamicQuestion(question)}
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return surveyAnswers.hasExperienced !== '';
    if (currentStep === 2) {
      // 스키마 기반 동적 검증
      const step2Questions = surveySchema?.steps?.[1]?.questions;
      if (!step2Questions) return false;
      
      return step2Questions.every(question => {
        // 조건부 질문인 경우 조건 확인
        if (question.condition) {
          const { field, value, includes } = question.condition;
          if (includes && !surveyAnswers[field]?.includes?.(value)) return true; // 조건 미충족시 검증 패스
          if (value && surveyAnswers[field] !== value) return true; // 조건 미충족시 검증 패스
        }
        
        // 필수 질문인 경우 값 확인
        if (question.required) {
          const fieldValue = surveyAnswers[question.id];
          if (question.type === 'checkbox') {
            // 체크박스는 배열이고 최소 하나 선택 필요
            if (!fieldValue || fieldValue.length === 0) return false;
            
            // 체크박스 옵션 중 추가 질문이 있는 경우 체크
            for (const option of question.options || []) {
              if (option.hasFollowUpQuestion && fieldValue.includes(option.value)) {
                const followUpValue = surveyAnswers[`${question.id}_${option.value}_followUp`];
                if (!followUpValue || followUpValue.trim() === '') return false;
              }
            }
            return true;
          } else {
            // 일반 필드는 값이 있어야 함
            if (!fieldValue || fieldValue.trim() === '') return false;
            
            // 라디오 옵션 중 추가 질문이 있는 경우 체크
            if (question.type === 'radio') {
              for (const option of question.options || []) {
                if (option.hasFollowUpQuestion && fieldValue === option.value) {
                  const followUpValue = surveyAnswers[`${question.id}_${option.value}_followUp`];
                  if (!followUpValue || followUpValue.trim() === '') return false;
                }
              }
            }
            return true;
          }
        }
        return true; // 필수가 아닌 질문은 항상 통과
      });
    }
    if (currentStep === 3) {
      // 브랜드 협업에 체크한 경우에만 브랜드 협업 제안 폼 표시
      if (surveyAnswers.visitPurpose.includes('brand_collaboration')) {
        // 스키마 기반 동적 검증
        const step3Questions = surveySchema?.steps?.[2]?.questions;
        if (!step3Questions) return false;
        
        return step3Questions.every(question => {
          // 조건부 질문인 경우 조건 확인
          if (question.condition) {
            const { field, value, includes } = question.condition;
            if (includes && !surveyAnswers[field]?.includes?.(value)) return true; // 조건 미충족시 검증 패스
            if (value && surveyAnswers[field] !== value) return true; // 조건 미충족시 검증 패스
          }
          
          // 필수 질문인 경우 값 확인
          if (question.required) {
            const fieldValue = surveyAnswers[question.id];
            if (question.type === 'checkbox') {
              if (!fieldValue || fieldValue.length === 0) return false;
              
              // 체크박스 옵션 중 추가 질문이 있는 경우 체크
              for (const option of question.options || []) {
                if (option.hasFollowUpQuestion && fieldValue.includes(option.value)) {
                  const followUpValue = surveyAnswers[`${question.id}_${option.value}_followUp`];
                  if (!followUpValue || followUpValue.trim() === '') return false;
                }
              }
              return true;
            } else {
              if (!fieldValue || fieldValue.trim() === '') return false;
              
              // 라디오 옵션 중 추가 질문이 있는 경우 체크
              if (question.type === 'radio') {
                for (const option of question.options || []) {
                  if (option.hasFollowUpQuestion && fieldValue === option.value) {
                    const followUpValue = surveyAnswers[`${question.id}_${option.value}_followUp`];
                    if (!followUpValue || followUpValue.trim() === '') return false;
                  }
                }
              }
              return true;
            }
          }
          return true; // 필수가 아닌 질문은 항상 통과
        });
      }
      return true; // 브랜드 협업을 체크하지 않은 경우 건너뛰기 메시지 표시이므로 통과
    }
    if (currentStep === 4) {
      // 스키마 기반 동적 검증
      const step4Questions = surveySchema?.steps?.[3]?.questions;
      if (!step4Questions) return false;
      
      return step4Questions.every(question => {
        // 조건부 질문인 경우 조건 확인
        if (question.condition) {
          const { field, value, includes } = question.condition;
          if (includes && !surveyAnswers[field]?.includes?.(value)) return true; // 조건 미충족시 검증 패스
          if (value && surveyAnswers[field] !== value) return true; // 조건 미충족시 검증 패스
        }
        
        // 필수 질문인 경우 값 확인
        if (question.required) {
          const fieldValue = surveyAnswers[question.id];
          if (question.type === 'checkbox') {
            if (!fieldValue || fieldValue.length === 0) return false;
            
            // 체크박스 옵션 중 추가 질문이 있는 경우 체크
            for (const option of question.options || []) {
              if (option.hasFollowUpQuestion && fieldValue.includes(option.value)) {
                const followUpValue = surveyAnswers[`${question.id}_${option.value}_followUp`];
                if (!followUpValue || followUpValue.trim() === '') return false;
              }
            }
            return true;
          } else {
            if (!fieldValue || fieldValue.trim() === '') return false;
            
            // 라디오 옵션 중 추가 질문이 있는 경우 체크
            if (question.type === 'radio') {
              for (const option of question.options || []) {
                if (option.hasFollowUpQuestion && fieldValue === option.value) {
                  const followUpValue = surveyAnswers[`${question.id}_${option.value}_followUp`];
                  if (!followUpValue || followUpValue.trim() === '') return false;
                }
              }
            }
            return true;
          }
        }
        return true; // 필수가 아닌 질문은 항상 통과
      });
    }
    if (currentStep === 5) {
      // 스키마 기반 동적 검증
      const step5Questions = surveySchema?.steps?.[4]?.questions;
      if (!step5Questions) return false;
      
      return step5Questions.every(question => {
        // 조건부 질문인 경우 조건 확인
        if (question.condition) {
          const { field, value, includes } = question.condition;
          if (includes && !surveyAnswers[field]?.includes?.(value)) return true; // 조건 미충족시 검증 패스
          if (value && surveyAnswers[field] !== value) return true; // 조건 미충족시 검증 패스
        }
        
        // 필수 질문인 경우 값 확인
        if (question.required) {
          const fieldValue = surveyAnswers[question.id];
          if (question.type === 'checkbox') {
            if (!fieldValue || fieldValue.length === 0) return false;
            
            // 체크박스 옵션 중 추가 질문이 있는 경우 체크
            for (const option of question.options || []) {
              if (option.hasFollowUpQuestion && fieldValue.includes(option.value)) {
                const followUpValue = surveyAnswers[`${question.id}_${option.value}_followUp`];
                if (!followUpValue || followUpValue.trim() === '') return false;
              }
            }
            return true;
          } else {
            if (!fieldValue || fieldValue.trim() === '') return false;
            
            // 라디오 옵션 중 추가 질문이 있는 경우 체크
            if (question.type === 'radio') {
              for (const option of question.options || []) {
                if (option.hasFollowUpQuestion && fieldValue === option.value) {
                  const followUpValue = surveyAnswers[`${question.id}_${option.value}_followUp`];
                  if (!followUpValue || followUpValue.trim() === '') return false;
                }
              }
            }
            return true;
          }
        }
        return true; // 필수가 아닌 질문은 항상 통과
      });
    }
    if (currentStep === 6) {
      // 스키마 기반 동적 검증
      const step6Questions = surveySchema?.steps?.[5]?.questions;
      if (!step6Questions) return true;
      
      return step6Questions.every(question => {
        // 조건부 질문인 경우 조건 확인
        if (question.condition) {
          const { field, value, includes } = question.condition;
          if (includes && !surveyAnswers[field]?.includes?.(value)) return true; // 조건 미충족시 검증 패스
          if (value && surveyAnswers[field] !== value) return true; // 조건 미충족시 검증 패스
        }
        
        // 필수 질문인 경우 값 확인
        if (question.required) {
          // phoneNumber 필드 검증
          if (question.id === 'phoneNumber') {
            return surveyAnswers.phoneNumber?.trim() !== '';
          }
          
          const fieldValue = surveyAnswers[question.id];
          if (question.type === 'checkbox') {
            return fieldValue && fieldValue.length > 0;
          } else {
            return fieldValue && fieldValue.trim() !== '';
          }
        }
        return true; // 필수가 아닌 질문은 항상 통과
      });
    }
    return true;
  };

  const getButtonText = () => {
    if (currentStep === 6) return '보내기';
    return '다음 →';
  };

  if (!isOpen) return null;

  // 스키마 로딩 중일 때
  if (schemaLoading) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.loading}>설문지를 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  const handleCloseModal = () => {
    // 작성중인 내용이 있는지 확인
    const hasContent = surveyAnswers.hasExperienced !== '' || 
                      surveyAnswers.goodPoints.trim() !== '' || 
                      surveyAnswers.photoUrl !== '' ||
                      surveyAnswers.siteDiscovery.length > 0 ||
                      surveyAnswers.visitPurpose.length > 0 ||
                      surveyAnswers.companyName !== '' ||
                      surveyAnswers.contactPerson !== '' ||
                      surveyAnswers.phoneNumber !== '' ||
                      surveyAnswers.email !== '' ||
                      surveyAnswers.collaborationTitle !== '' ||
                      surveyAnswers.collaborationContent !== '' ||
                      surveyAnswers.workEnvironment !== '' ||
                      surveyAnswers.expectedActivities.length > 0 ||
                      surveyAnswers.fullName !== '' ||
                      surveyAnswers.address !== '' ||
                      surveyAnswers.emailForPrizes !== '' ||
                      surveyAnswers.privacyAgreement === true;
    
    if (hasContent) {
      const confirmClose = window.confirm('작성중인 내용이 있습니다. 닫으시겠습니까?');
      if (!confirmClose) {
        return; // 사용자가 취소한 경우 모달 닫지 않음
      }
    }
    
    // URL에서 survey 슬러그 제거
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash === 'survey') {
      window.history.pushState(null, '', window.location.pathname);
    }
    
    // 모달 닫기
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleCloseModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header - 상단 고정 */}
        <div className={styles.modalHeader}>
          {currentStep > 0 && renderProgressIndicator()}
          <button className={styles.closeButton} onClick={handleCloseModal}>
            <span className={styles.closeLine1}></span>
            <span className={styles.closeLine2}></span>
          </button>
        </div>
        
        {/* Modal Body - 스크롤 가능한 콘텐츠 */}
        <div className={styles.modalBodyContainer}>
          {renderSurveyStep()}
        </div>
        
        {/* Modal Footer - 하단 고정 */}
        {currentStep === 0 && (
          <div className={styles.modalFooter}>
            <button 
              className={styles.nextButton}
              onClick={handleNext}
            >
              다음 →
            </button>
          </div>
        )}
        
        {currentStep > 0 && currentStep < 7 && (
          <div className={styles.modalFooter}>
            <div className={styles.buttonGroup}>
              {currentStep >= 1 && (
                <button 
                  className={styles.prevButton}
                  onClick={handlePrev}
                >
                  ← 이전
                </button>
              )}
              <button 
                className={`${styles.nextButton} ${!canProceed() ? styles.disabled : ''}`}
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {getButtonText()}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyModal;
