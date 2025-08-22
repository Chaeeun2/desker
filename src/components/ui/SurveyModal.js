import React, { useEffect, useState } from 'react';
import styles from './SurveyModal.module.css';

const SurveyModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0); // 0: 인트로, 1-5: 설문 단계
  const [indicatorStep, setIndicatorStep] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState({
    hasExperienced: '', // 양양 워케이션 경험 여부
    goodPoints: '', // 좋았던 점
    photoUpload: null, // 사진 업로드
    siteDiscovery: [], // 사이트를 어떤 경로로 알게 되셨나요
    visitPurpose: [], // 사이트 방문 목적
    companyName: '', // 회사명
    contactPerson: '', // 담당자명
    phoneNumber: '', // 전화번호
    email: '', // 이메일
    collaborationTitle: '', // 제목
    collaborationContent: '' // 협업제안내용
  });

  // 모달이 열려있을 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
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
    }
  }, [isOpen]);

  // 모달이 열릴 때 초기 상태로 리셋
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIndicatorStep(0);
      setSurveyAnswers({
        hasExperienced: '',
        goodPoints: '',
        photoUpload: null,
        siteDiscovery: [],
        visitPurpose: [],
        siteDiscoveryOther: '',
        visitPurposeOther: '',
        companyName: '',
        contactPerson: '',
        phoneNumber: '',
        email: '',
        collaborationTitle: '',
        collaborationContent: '',
        workEnvironment: '',
        workEnvironmentOther: '',
        expectedActivities: [],
        expectedActivitiesOther: '',
        fullName: '',
        phoneFirst: '',
        phoneSecond: '',
        phoneThird: '',
        address: '',
        emailForPrizes: '',
        privacyAgreement: false
      });
    }
  }, [isOpen]);

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
      // '보내기' 버튼 클릭 시 alert 표시 후 모달 닫기
      alert('설문에 참여해주셔서 감사합니다.');
      onClose();
    }
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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSurveyAnswers(prev => ({
        ...prev,
        photoUpload: file
      }));
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

  const renderSurveyStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className={styles.modalBodyImg}>
              <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/modal.png" alt="데스커" />
            </div>
            
            <div className={styles.modalBody}>
              <h2 className={styles.title}>
                <span style={{ color: 'var(--color-primary)' }}>더 나은 워크라이프</span>를 꿈꾸는<br/>여러분의 이야기를 들려주세요.
              </h2>
              
              <p className={styles.description}>
                데스커는 일하는 사람들의 새로운 가능을 응원하는 워크 앤 라이프스타일 브랜드입니다. 
                <br/>현재 일하는 환경에 대한 여러분의 생각을 남겨주시면, 앞으로의 활동에 참고하겠습니다.
                <br/>
                <br/>설문에 참여해주신 모든 분께는 <span style={{ fontWeight: '700' }}>공식몰 00% 할인쿠폰</span>과 <br/><span style={{ fontWeight: '700' }}>워케이션 준비하기 툴킷 패키지(PDF)</span>를 드리며, 
                <br/>추첨을 통해 <span style={{ fontWeight: '700' }}>데스커 라운지 홍대 0시간 이용권</span>을 드립니다. (매월 추첨 10명)
              </p>
            </div>
          </>
        );

      case 1:
        return (
          <div className={styles.modalBody}>
            <div className={styles.questionSection}>
              <div className={styles.questionWrap}>
                <h3 className={styles.questionTitle}>양양 워케이션을 경험해보셨나요?</h3>
                
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="hasExperienced"
                      value="yes"
                      checked={surveyAnswers.hasExperienced === 'yes'}
                      onChange={(e) => handleAnswerChange('hasExperienced', e.target.value)}
                    />
                    <span className={styles.radioText}>네</span>
                  </label>
                  
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="hasExperienced"
                      value="no"
                      checked={surveyAnswers.hasExperienced === 'no'}
                      onChange={(e) => handleAnswerChange('hasExperienced', e.target.value)}
                    />
                    <span className={styles.radioText}>아니오</span>
                  </label>
                </div>
              </div>

              {/* 2번째 질문 - '네' 선택 시에만 표시 */}
              {surveyAnswers.hasExperienced === 'yes' && (
                <div className={styles.questionWrap}>
                  <h3 className={styles.questionTitle}>
                    데스커 워케이션을 경험하면서 특별히 좋았던 점이 있다면 알려주세요.
                  </h3>
                  
                  <textarea
                    className={styles.textArea}
                    value={surveyAnswers.goodPoints}
                    onChange={(e) => handleAnswerChange('goodPoints', e.target.value)}
                    placeholder="좋았던 점을 자유롭게 작성해주세요."
                    rows={4}
                  />
                </div>
              )}

              {/* 3번째 질문 - '네' 선택 시에만 표시 */}
              {surveyAnswers.hasExperienced === 'yes' && (
                <div className={styles.questionWrap}>
                  <h3 className={styles.questionTitle}>
                    데스커 워케이션을 추억할 수 있는 사진을 남겨주세요.
                  </h3>
                  
                  <p className={styles.uploadInfo}>
                    ∙ 사진을 남겨주신 분들께는 데스커 워케이션 키트를 보내드립니다.
                    <br />
                    ∙ 남겨주신 사진은 마케팅 용도로 활용될 수 있습니다.
                  </p>
                  
                  <label className={styles.fileUploadButton}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
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
                  
                  {surveyAnswers.photoUpload && (
                    <p className={styles.fileName}>{surveyAnswers.photoUpload.name}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.modalBody}>
                <div className={styles.questionSection}>
                    <div className={styles.questionWrap}>
              <h3 className={styles.questionTitle}>사이트를 어떤 경로로 알게 되셨나요? (중복 선택 가능)</h3>
              
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value="desker_homepage"
                    checked={surveyAnswers.siteDiscovery.includes('desker_homepage')}
                    onChange={() => handleCheckboxChange('siteDiscovery', 'desker_homepage')}
                  />
                  <span className={styles.checkboxText}>데스커 홈페이지</span>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value="sns"
                    checked={surveyAnswers.siteDiscovery.includes('sns')}
                    onChange={() => handleCheckboxChange('siteDiscovery', 'sns')}
                  />
                  <span className={styles.checkboxText}>SNS</span>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value="search"
                    checked={surveyAnswers.siteDiscovery.includes('search')}
                    onChange={() => handleCheckboxChange('siteDiscovery', 'search')}
                  />
                  <span className={styles.checkboxText}>검색</span>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value="differ"
                    checked={surveyAnswers.siteDiscovery.includes('differ')}
                    onChange={() => handleCheckboxChange('siteDiscovery', 'differ')}
                  />
                  <span className={styles.checkboxText}>differ</span>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value="desker_lounge"
                    checked={surveyAnswers.siteDiscovery.includes('desker_lounge')}
                    onChange={() => handleCheckboxChange('siteDiscovery', 'desker_lounge')}
                  />
                  <span className={styles.checkboxText}>데스커 라운지</span>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value="other"
                    checked={surveyAnswers.siteDiscovery.includes('other')}
                    onChange={() => handleCheckboxChange('siteDiscovery', 'other')}
                  />
                  <span className={styles.checkboxText}>기타</span>
                </label>
              </div>
              
              {surveyAnswers.siteDiscovery.includes('other') && (
                <input
                  type="text"
                  className={styles.otherInput}
                  placeholder="기타 내용을 입력해주세요"
                  value={surveyAnswers.siteDiscoveryOther || ''}
                  onChange={(e) => setSurveyAnswers(prev => ({
                    ...prev,
                    siteDiscoveryOther: e.target.value
                  }))}
                />
              )}
            </div>
<div className={styles.questionWrap}>
              <h3 className={styles.questionTitle}>사이트 방문 목적이 어떻게 되시나요? (중복 선택 가능)</h3>
              
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value="curious_activities"
                    checked={surveyAnswers.visitPurpose.includes('curious_activities')}
                    onChange={() => handleCheckboxChange('visitPurpose', 'curious_activities')}
                  />
                  <span className={styles.checkboxText}>데스커의 활동이 궁금해서</span>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value="workation_info"
                    checked={surveyAnswers.visitPurpose.includes('workation_info')}
                    onChange={() => handleCheckboxChange('visitPurpose', 'workation_info')}
                  />
                  <span className={styles.checkboxText}>워케이션 정보를 얻고 싶어서</span>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value="brand_collaboration"
                    checked={surveyAnswers.visitPurpose.includes('brand_collaboration')}
                    onChange={() => handleCheckboxChange('visitPurpose', 'brand_collaboration')}
                  />
                  <span className={styles.checkboxText}>브랜드 협업을 제안하고 싶어서</span>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value="work_culture"
                    checked={surveyAnswers.visitPurpose.includes('work_culture')}
                    onChange={() => handleCheckboxChange('visitPurpose', 'work_culture')}
                  />
                  <span className={styles.checkboxText}>업무 문화나 일하는 방식에 대해 알고 싶어서</span>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value="space_interior"
                    checked={surveyAnswers.visitPurpose.includes('space_interior')}
                    onChange={() => handleCheckboxChange('visitPurpose', 'space_interior')}
                  />
                  <span className={styles.checkboxText}>공간, 인테리어에 관심이 있어서</span>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value="other"
                    checked={surveyAnswers.visitPurpose.includes('other')}
                    onChange={() => handleCheckboxChange('visitPurpose', 'other')}
                  />
                  <span className={styles.checkboxText}>기타</span>
                </label>
              </div>
              
              {surveyAnswers.visitPurpose.includes('other') && (
                <input
                  type="text"
                  className={styles.otherInput}
                  placeholder="기타 내용을 입력해주세요"
                  value={surveyAnswers.visitPurposeOther || ''}
                  onChange={(e) => setSurveyAnswers(prev => ({
                    ...prev,
                    visitPurposeOther: e.target.value
                  }))}
                />
              )}
            </div>
                </div>
                </div>
        );

      case 3:
        // 브랜드 협업에 체크한 경우에만 브랜드 협업 제안 폼 표시
        if (surveyAnswers.visitPurpose.includes('brand_collaboration')) {
          return (
            <div className={styles.modalBody}>
              <div className={styles.questionSection}>
                <div className={styles.questionWrap}>
                  <h3 className={styles.questionTitle}>브랜드 협업 제안</h3>
                  
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>회사명</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={surveyAnswers.companyName}
                        onChange={(e) => handleAnswerChange('companyName', e.target.value)}
                        placeholder="회사명을 입력해주세요"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>담당자명</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={surveyAnswers.contactPerson}
                        onChange={(e) => handleAnswerChange('contactPerson', e.target.value)}
                        placeholder="담당자명을 입력해주세요"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>전화번호</label>
                      <input
                        type="tel"
                        className={styles.formInput}
                        value={surveyAnswers.phoneNumber}
                        onChange={(e) => handleAnswerChange('phoneNumber', e.target.value)}
                        placeholder="전화번호를 입력해주세요"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>이메일</label>
                      <input
                        type="email"
                        className={styles.formInput}
                        value={surveyAnswers.email}
                        onChange={(e) => handleAnswerChange('email', e.target.value)}
                        placeholder="이메일을 입력해주세요"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>제목</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={surveyAnswers.collaborationTitle}
                        onChange={(e) => handleAnswerChange('collaborationTitle', e.target.value)}
                        placeholder="협업 제안 제목을 입력해주세요"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>협업 제안 내용</label>
                      <textarea
                        className={styles.formTextarea}
                        value={surveyAnswers.collaborationContent}
                        onChange={(e) => handleAnswerChange('collaborationContent', e.target.value)}
                        placeholder="제안 내용 및 기대효과를 작성해주세요"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        } else {
          // 브랜드 협업을 체크하지 않은 경우 건너뛰기 메시지 표시
          return (
            <div className={styles.modalBody}>
              <div className={styles.questionSection}>
                <div className={styles.questionWrap}>
                  <h3 className={styles.questionTitle}>브랜드 협업</h3>
                  <p className={styles.skipMessage}>
                    브랜드 협업을 선택하지 않으셨습니다. 다음 단계로 진행합니다.
                  </p>
                </div>
              </div>
            </div>
          );
        }

      case 4:
        return (
          <div className={styles.modalBody}>
            <div className={styles.questionSection}>
              <div className={styles.questionWrap}>
                <h3 className={styles.questionTitle}>어떤 일을 하고 계시나요?</h3>
                <input
                  type="text"
                  className={styles.formInput}
                  value={surveyAnswers.workType || ''}
                  onChange={(e) => handleAnswerChange('workType', e.target.value)}
                  placeholder="직업이나 업무를 입력해주세요"
                />
              </div>
              
              <div className={styles.questionWrap}>
                <h3 className={styles.questionTitle}>오피스나 일하는 공간에서 가장 중요하게 보는 공간은 무엇인가요?</h3>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="importantSpace"
                      value="personal_workspace"
                      checked={surveyAnswers.importantSpace === 'personal_workspace'}
                      onChange={(e) => handleAnswerChange('importantSpace', e.target.value)}
                    />
                    <span className={styles.radioText}>개인 업무 공간</span>
                  </label>
                  
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="importantSpace"
                      value="meeting_space"
                      checked={surveyAnswers.importantSpace === 'meeting_space'}
                      onChange={(e) => handleAnswerChange('importantSpace', e.target.value)}
                    />
                    <span className={styles.radioText}>회의 공간</span>
                  </label>
                  
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="importantSpace"
                      value="lounge"
                      checked={surveyAnswers.importantSpace === 'lounge'}
                      onChange={(e) => handleAnswerChange('importantSpace', e.target.value)}
                    />
                    <span className={styles.radioText}>라운지 (휴식 공간)</span>
                  </label>
                  
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="importantSpace"
                      value="cafe"
                      checked={surveyAnswers.importantSpace === 'cafe'}
                      onChange={(e) => handleAnswerChange('importantSpace', e.target.value)}
                    />
                    <span className={styles.radioText}>카페</span>
                  </label>
                  
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="importantSpace"
                      value="other"
                      checked={surveyAnswers.importantSpace === 'other'}
                      onChange={(e) => handleAnswerChange('importantSpace', e.target.value)}
                    />
                    <span className={styles.radioText}>기타</span>
                  </label>
                </div>
                
                {surveyAnswers.importantSpace === 'other' && (
                  <input
                    type="text"
                    className={styles.otherInput}
                    placeholder="기타 내용을 입력해주세요"
                    value={surveyAnswers.importantSpaceOther || ''}
                    onChange={(e) => handleAnswerChange('importantSpaceOther', e.target.value)}
                  />
                )}
              </div>
              
              <div className={styles.questionWrap}>
                <h3 className={styles.questionTitle}>업무 공간에서 가장 불편함을 느끼는 부분은 무엇인가요?</h3>
                <textarea
                  className={styles.formTextarea}
                  value={surveyAnswers.discomfortPoints || ''}
                  onChange={(e) => handleAnswerChange('discomfortPoints', e.target.value)}
                  placeholder="ex. 레이아웃, 가구, 실내 공기질 등"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className={styles.modalBody}>
            <div className={styles.questionSection}>
              <div className={styles.questionWrap}>
                <h3 className={styles.questionTitle}>다음 중 가장 관심 있는 업무 환경은 어떤 모습인가요?</h3>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="workEnvironment"
                      value="work_rest_balance"
                      checked={surveyAnswers.workEnvironment === 'work_rest_balance'}
                      onChange={(e) => handleAnswerChange('workEnvironment', e.target.value)}
                    />
                    <span className={styles.radioText}>일과 쉼이 자연스럽게 조화되는 환경</span>
                  </label>
                  
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="workEnvironment"
                      value="continuous_motivation"
                      checked={surveyAnswers.workEnvironment === 'continuous_motivation'}
                      onChange={(e) => handleAnswerChange('workEnvironment', e.target.value)}
                    />
                    <span className={styles.radioText}>꾸준히 동기부여가 되는 환경</span>
                  </label>
                  
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="workEnvironment"
                      value="nature_worklife"
                      checked={surveyAnswers.workEnvironment === 'nature_worklife'}
                      onChange={(e) => handleAnswerChange('workEnvironment', e.target.value)}
                    />
                    <span className={styles.radioText}>자연 속의 편안한 워크라이프</span>
                  </label>
                  
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="workEnvironment"
                      value="flexible_challenge"
                      checked={surveyAnswers.workEnvironment === 'flexible_challenge'}
                      onChange={(e) => handleAnswerChange('workEnvironment', e.target.value)}
                    />
                    <span className={styles.radioText}>새로운 도전이 가능한 유연한 환경</span>
                  </label>
                  
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="workEnvironment"
                      value="other"
                      checked={surveyAnswers.workEnvironment === 'other'}
                      onChange={(e) => handleAnswerChange('workEnvironment', e.target.value)}
                    />
                    <span className={styles.radioText}>기타</span>
                  </label>
                </div>
                
                {surveyAnswers.workEnvironment === 'other' && (
                  <input
                    type="text"
                    className={styles.otherInput}
                    placeholder="기타 내용을 입력해주세요"
                    value={surveyAnswers.workEnvironmentOther || ''}
                    onChange={(e) => handleAnswerChange('workEnvironmentOther', e.target.value)}
                  />
                )}
              </div>
              
              <div className={styles.questionWrap}>
                <h3 className={styles.questionTitle}>데스커에 기대하는 활동이 있나요? (중복 선택 가능)</h3>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      value="growth_content"
                      checked={surveyAnswers.expectedActivities.includes('growth_content')}
                      onChange={() => handleCheckboxChange('expectedActivities', 'growth_content')}
                    />
                    <span className={styles.checkboxText}>성장에 도움을 주는 컨텐츠 (ex. 인터뷰 아티클 등)</span>
                  </label>
                  
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      value="sustainable_culture"
                      checked={surveyAnswers.expectedActivities.includes('sustainable_culture')}
                      onChange={() => handleCheckboxChange('expectedActivities', 'sustainable_culture')}
                    />
                    <span className={styles.checkboxText}>지속가능한 업무 문화를 만들기 위한 활동</span>
                  </label>
                  
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      value="self_exploration"
                      checked={surveyAnswers.expectedActivities.includes('self_exploration')}
                      onChange={() => handleCheckboxChange('expectedActivities', 'self_exploration')}
                    />
                    <span className={styles.checkboxText}>나다움을 찾을 수 있는 자기 탐색 프로그램</span>
                  </label>
                  
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      value="community_sharing"
                      checked={surveyAnswers.expectedActivities.includes('community_sharing')}
                      onChange={() => handleCheckboxChange('expectedActivities', 'community_sharing')}
                    />
                    <span className={styles.checkboxText}>관심사를 공유할 수 있는 커뮤니티 운영</span>
                  </label>
                  
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      value="office_furniture"
                      checked={surveyAnswers.expectedActivities.includes('office_furniture')}
                      onChange={() => handleCheckboxChange('expectedActivities', 'office_furniture')}
                    />
                    <span className={styles.checkboxText}>몰입과 편안함을 고려한 사무가구</span>
                  </label>
                  
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      value="business_support"
                      checked={surveyAnswers.expectedActivities.includes('business_support')}
                      onChange={() => handleCheckboxChange('expectedActivities', 'business_support')}
                    />
                    <span className={styles.checkboxText}>신규 비즈니스의 성장을 위한 지원</span>
                  </label>
                  
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      value="other"
                      checked={surveyAnswers.expectedActivities.includes('other')}
                      onChange={() => handleCheckboxChange('expectedActivities', 'other')}
                    />
                    <span className={styles.checkboxText}>기타</span>
                  </label>
                </div>
                
                {surveyAnswers.expectedActivities.includes('other') && (
                  <input
                    type="text"
                    className={styles.otherInput}
                    placeholder="기타 내용을 입력해주세요"
                    value={surveyAnswers.expectedActivitiesOther || ''}
                    onChange={(e) => handleAnswerChange('expectedActivitiesOther', e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className={styles.modalBody}>
            <div className={styles.questionSection}>
              <div className={styles.questionWrap}>
                <p className={styles.privacyNotice}>
                  ∙ 경품 발송을 위한 최소한의 개인정보를 수집하며, 발송 후 즉시 파기됩니다.
                </p>
              </div>
              
              <div className={styles.questionWrap}>
                <h3 className={styles.questionTitle}>성함</h3>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.half}`}
                  value={surveyAnswers.fullName || ''}
                  onChange={(e) => handleAnswerChange('fullName', e.target.value)}
                  placeholder="성함을 입력해주세요"
                />
              </div>
              
              <div className={styles.questionWrap}>
                <h3 className={styles.questionTitle}>연락처</h3>
                <div className={styles.phoneInputGroup}>
                  <input
                    type="text"
                    className={`${styles.formInput} ${styles.half}`}
                    value={surveyAnswers.phoneFirst || ''}
                    onChange={(e) => handleAnswerChange('phoneFirst', e.target.value)}
                    placeholder="010"
                    maxLength={3}
                  />
                  <span className={styles.phoneSeparator}>-</span>
                  <input
                    type="text"
                    className={`${styles.formInput} ${styles.half}`}
                    value={surveyAnswers.phoneSecond || ''}
                    onChange={(e) => handleAnswerChange('phoneSecond', e.target.value)}
                    placeholder="XXXX"
                    maxLength={4}
                  />
                  <span className={styles.phoneSeparator}>-</span>
                  <input
                    type="text"
                    className={`${styles.formInput} ${styles.half}`}
                    value={surveyAnswers.phoneThird || ''}
                    onChange={(e) => handleAnswerChange('phoneThird', e.target.value)}
                    placeholder="XXXX"
                    maxLength={4}
                  />
                </div>
              </div>
              
              {surveyAnswers.hasExperienced === 'yes' && (
                <div className={styles.questionWrap}>
                  <h3 className={styles.questionTitle}>주소</h3>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={surveyAnswers.address || ''}
                    onChange={(e) => handleAnswerChange('address', e.target.value)}
                    placeholder="주소를 입력해주세요"
                  />
                </div>
              )}
              
              <div className={styles.questionWrap}>
                <h3 className={styles.questionTitle}>이메일을 남겨주시면 설문 참여 경품 및 데스커 소식을 보내드립니다.</h3>
                <input
                  type="email"
                  className={styles.formInput}
                  value={surveyAnswers.emailForPrizes || ''}
                  onChange={(e) => handleAnswerChange('emailForPrizes', e.target.value)}
                  placeholder="이메일을 입력해주세요"
                />
              </div>
              
              <div className={styles.questionWrap}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={surveyAnswers.privacyAgreement || false}
                    onChange={(e) => handleAnswerChange('privacyAgreement', e.target.checked)}
                  />
                  <span className={styles.checkboxText}>개인정보 수집/이용 및 마케팅 활용에 동의합니다.</span>
                </label>
              </div>
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
    if (currentStep === 2) return surveyAnswers.siteDiscovery.length > 0 && surveyAnswers.visitPurpose.length > 0;
    if (currentStep === 3) {
      // 브랜드 협업에 체크한 경우에만 브랜드 협업 제안 폼 표시
      if (surveyAnswers.visitPurpose.includes('brand_collaboration')) {
        return surveyAnswers.companyName !== '' && surveyAnswers.contactPerson !== '' && surveyAnswers.phoneNumber !== '' && surveyAnswers.email !== '' && surveyAnswers.collaborationTitle !== '' && surveyAnswers.collaborationContent !== '';
      }
      return true; // 브랜드 협업을 체크하지 않은 경우 건너뛰기 메시지 표시이므로 통과
    }
    if (currentStep === 4) return surveyAnswers.workType !== '' && surveyAnswers.importantSpace !== '' && surveyAnswers.discomfortPoints !== '';
    if (currentStep === 5) return surveyAnswers.workEnvironment !== '' && surveyAnswers.expectedActivities.length > 0;
    if (currentStep === 6) {
      const requiredFields = surveyAnswers.fullName !== '' && 
                           surveyAnswers.phoneFirst !== '' && 
                           surveyAnswers.phoneSecond !== '' && 
                           surveyAnswers.phoneThird !== '' && 
                           surveyAnswers.privacyAgreement === true;
      
      // 주소는 양양 워케이션 참여 시에만 필수
      if (surveyAnswers.hasExperienced === 'yes') {
        return requiredFields && surveyAnswers.address !== '';
      }
      
      return requiredFields;
    }
    return true;
  };

  const getButtonText = () => {
    if (currentStep === 6) return '보내기';
    return '다음 →';
  };

  if (!isOpen) return null;

  const handleCloseModal = () => {
    // 작성중인 내용이 있는지 확인
    const hasContent = surveyAnswers.hasExperienced !== '' || 
                      surveyAnswers.goodPoints.trim() !== '' || 
                      surveyAnswers.photoUpload !== null ||
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
                      surveyAnswers.phoneFirst !== '' ||
                      surveyAnswers.phoneSecond !== '' ||
                      surveyAnswers.phoneThird !== '' ||
                      surveyAnswers.address !== '' ||
                      surveyAnswers.emailForPrizes !== '' ||
                      surveyAnswers.privacyAgreement === true;
    
    if (hasContent) {
      const confirmClose = window.confirm('작성중인 내용이 있습니다. 닫으시겠습니까?');
      if (!confirmClose) {
        return; // 사용자가 취소한 경우 모달 닫지 않음
      }
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
            <button 
              className={`${styles.nextButton} ${!canProceed() ? styles.disabled : ''}`}
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {getButtonText()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyModal;
