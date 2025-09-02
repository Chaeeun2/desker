import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAllSurveys, deleteSurvey } from '../../services/surveyService';

const SurveyManager = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await getAllSurveys();
      setSurveys(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load surveys:', error);
      setLoading(false);
    }
  };

  const handleView = (survey) => {
    setSelectedSurvey(survey);
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const result = await deleteSurvey(id);
      if (result.success) {
        const updatedSurveys = surveys.filter(s => s.id !== id);
        setSurveys(updatedSurveys);
        
        // 현재 페이지에 아이템이 없으면 이전 페이지로 이동
        const totalPages = Math.ceil(updatedSurveys.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
        
        alert('삭제되었습니다.');
      } else {
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 페이지네이션 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = surveys.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(surveys.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-number ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }
    
    return pageNumbers;
  };

  const handleExport = () => {
    // CSV 내보내기 로직
    const csvContent = convertToCSV(surveys);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `survey_responses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data) => {
    // 모달과 동일한 전체 질문 텍스트를 헤더로 사용
    const headers = [
      '순번',
      '이름', 
      '이메일', 
      '전화번호',
      '주소',
      '양양 워케이션을 경험해보셨나요?', 
      '데스커 워케이션을 경험하면서 특별히 좋았던 점이 있다면 알려주세요.',
      '데스커 워케이션을 추억할 수 있는 사진',
      '사이트를 어떤 경로로 알게 되셨나요? (중복 선택 가능)', 
      '검색어', 
      '사이트 경로 기타', 
      '사이트 방문 목적이 어떻게 되시나요? (중복 선택 가능)', 
      '방문 목적 기타', 
      '협업 제안 - 회사명', 
      '협업 제안 - 담당자', 
      '협업 제안 - 전화번호',
      '협업 제안 - 이메일',
      '협업 제안 - 제목', 
      '협업 제안 - 내용',
      '어떤 일을 하고 계시나요?',
      '오피스나 일하는 공간에서 가장 중요하게 보는 공간은 무엇인가요?',
      '중요한 공간 기타',
      '업무 공간에서 가장 불편함을 느끼는 부분은 무엇인가요?',
      '다음 중 가장 관심 있는 업무 환경은 어떤 모습인가요?',
      '업무 환경 기타',
      '데스커에 기대하는 활동이 있나요? (중복 선택 가능)',
      '기대하는 활동 기타',
      '개인정보 동의',
      '제출 시간'
    ];
    
    // 답변 변환 맵
    const discoveryMap = {
      'desker_homepage': '데스커 홈페이지',
      'sns': 'SNS',
      'search': '검색',
      'differ': 'differ',
      'desker_lounge': '데스커 라운지',
      'other': '기타'
    };
    
    const purposeMap = {
      'curious_activities': '데스커의 활동이 궁금해서',
      'workation_info': '워케이션 정보를 얻고 싶어서',
      'brand_collaboration': '브랜드 협업을 제안하고 싶어서',
      'work_culture': '업무 문화나 일하는 방식에 대해 알고 싶어서',
      'space_interior': '공간, 인테리어에 관심이 있어서',
      'other': '기타'
    };
    
    const spaceMap = {
      'personal_workspace': '개인 업무 공간',
      'meeting_space': '회의 공간',
      'lounge': '라운지 (휴식 공간)',
      'cafe': '카페',
      'other': '기타'
    };
    
    const envMap = {
      'work_rest_balance': '일과 쉼이 자연스럽게 조화되는 환경',
      'continuous_motivation': '꾸준히 동기부여가 되는 환경',
      'nature_worklife': '자연 속의 편안한 워크라이프',
      'flexible_challenge': '새로운 도전이 가능한 유연한 환경',
      'other': '기타'
    };
    
    const activityMap = {
      'growth_content': '성장에 도움을 주는 컨텐츠 (ex. 인터뷰 아티클 등)',
      'sustainable_culture': '지속가능한 업무 문화를 만들기 위한 활동',
      'self_exploration': '나다움을 찾을 수 있는 자기 탐색 프로그램',
      'community_sharing': '관심사를 공유할 수 있는 커뮤니티 운영',
      'office_furniture': '몰입과 편안함을 고려한 사무가구',
      'business_support': '신규 비즈니스의 성장을 위한 지원',
      'other': '기타'
    };
    
    const rows = data.map((survey, index) => {
      // CSV 셀 내용 이스케이프 처리
      const escapeCSV = (value) => {
        if (!value) return '';
        const str = String(value);
        // 큰따옴표가 있으면 두 개로 변환하고, 줄바꿈이나 쉼표가 있으면 큰따옴표로 감싸기
        if (str.includes('"') || str.includes(',') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      return [
        data.length - index, // 순번
        survey.fullName || '',
        survey.email || survey.emailForPrizes || '',
        survey.phoneNumber || '',
        survey.address || '',
        // 양양 경험 - 모달과 동일하게 변환
        survey.hasExperienced === 'yes' ? '네' : survey.hasExperienced === 'no' ? '아니오' : '',
        survey.goodPoints || '',
        // 사진 URL (R2 링크 또는 base64)
        survey.photoUrl || '',
        // 사이트 경로 - 전체 텍스트로 변환
        Array.isArray(survey.siteDiscovery) 
          ? survey.siteDiscovery.map(item => discoveryMap[item] || item).join(', ')
          : '',
        survey.siteDiscoverySearch || '',
        survey.siteDiscoveryOther || '',
        // 방문 목적 - 전체 텍스트로 변환
        Array.isArray(survey.visitPurpose)
          ? survey.visitPurpose.map(item => purposeMap[item] || item).join(', ')
          : '',
        survey.visitPurposeOther || '',
        survey.companyName || '',
        survey.contactPerson || '',
        survey.phoneNumber || '',
        survey.email || survey.emailForPrizes || '',
        survey.collaborationTitle || '',
        survey.collaborationContent || '',
        survey.workType || '',
        // 중요한 공간 - 전체 텍스트로 변환
        spaceMap[survey.importantSpace] || survey.importantSpace || '',
        survey.importantSpaceOther || '',
        survey.discomfortPoints || '',
        // 업무 환경 - 전체 텍스트로 변환
        envMap[survey.workEnvironment] || survey.workEnvironment || '',
        survey.workEnvironmentOther || '',
        // 기대하는 활동 - 전체 텍스트로 변환
        Array.isArray(survey.expectedActivities)
          ? survey.expectedActivities.map(item => activityMap[item] || item).join(', ')
          : '',
        survey.expectedActivitiesOther || '',
        survey.privacyAgreement ? '동의' : '',
        (() => {
          const dateStr = survey.createdAt || survey.submittedAt;
          if (!dateStr) return '';
          const date = new Date(dateStr);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        })()
      ].map(escapeCSV);
    });
    
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return '\uFEFF' + csvContent; // UTF-8 BOM 추가
  };

  return (
    <AdminLayout>
      <div className="admin-content">
        <div className="admin-header">
          <h1>설문 응답 관리</h1>
          <div className="admin-actions" style={{ textAlign: 'right' }}>
            <button onClick={handleExport} className="btn btn-secondary">
              CSV 내보내기
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>순번</th>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>전화번호</th>
                  <th>제출 시간</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((survey, index) => (
                  <tr key={survey.id}>
                    <td>{surveys.length - (indexOfFirstItem + index)}</td>
                    <td>{survey.fullName}</td>
                    <td>{survey.email}</td>
                    <td>{survey.phoneNumber}</td>
                    <td>{(() => {
                      const dateStr = survey.createdAt || survey.submittedAt;
                      if (!dateStr) return '';
                      
                      const date = new Date(dateStr);
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      const hours = String(date.getHours()).padStart(2, '0');
                      const minutes = String(date.getMinutes()).padStart(2, '0');
                      
                      return `${year}-${month}-${day} ${hours}:${minutes}`;
                    })()}</td>
                    <td>
                      <button 
                        onClick={() => handleView(survey)} 
                        className="btn btn-sm btn-primary"
                      >
                        상세
                      </button>
                      <button 
                        onClick={() => handleDelete(survey.id)} 
                        className="btn btn-sm btn-danger"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16.1795 3.26875C15.7889 2.87823 15.1558 2.87823 14.7652 3.26875L8.12078 9.91322C6.94952 11.0845 6.94916 12.9833 8.11996 14.155L14.6903 20.7304C15.0808 21.121 15.714 21.121 16.1045 20.7304C16.495 20.3399 16.495 19.7067 16.1045 19.3162L9.53246 12.7442C9.14194 12.3536 9.14194 11.7205 9.53246 11.33L16.1795 4.68297C16.57 4.29244 16.57 3.65928 16.1795 3.26875Z" fill="#000000"></path> </g></svg>
                </button>
                
                {renderPageNumbers()}
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7.82054 20.7313C8.21107 21.1218 8.84423 21.1218 9.23476 20.7313L15.8792 14.0868C17.0505 12.9155 17.0508 11.0167 15.88 9.84497L9.3097 3.26958C8.91918 2.87905 8.28601 2.87905 7.89549 3.26958C7.50497 3.6601 7.50497 4.29327 7.89549 4.68379L14.4675 11.2558C14.8581 11.6464 14.8581 12.2795 14.4675 12.67L7.82054 19.317C7.43002 19.7076 7.43002 20.3407 7.82054 20.7313Z" fill="#000000"></path> </g></svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 상세 보기 모달 */}
        {selectedSurvey && (
          <div className="admin-modal-overlay" onClick={() => setSelectedSurvey(null)}>
            <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>설문 응답 상세</h2>
                <button className="admin-modal-close" onClick={() => setSelectedSurvey(null)}>×</button>
              </div>
              <div className="admin-modal-body survey-manager-modal-body">
                <div className="admin-form-group">
                  <label>개인정보</label>
                  <p><strong>이름:</strong> {selectedSurvey.fullName || '-'}</p>
                  <p><strong>이메일:</strong> {selectedSurvey.email || selectedSurvey.emailForPrizes || '-'}</p>
                  <p><strong>전화번호:</strong> {selectedSurvey.phoneNumber || '-'}</p>
                  <p><strong>주소:</strong> {selectedSurvey.address || '-'}</p>
                </div>
                
                <div className="admin-form-group">
                  <label>양양 워케이션을 경험해보셨나요?</label>
                  <p>{selectedSurvey.hasExperienced === 'yes' ? '네' : selectedSurvey.hasExperienced === 'no' ? '아니오' : '-'}</p>
                </div>
                
                {selectedSurvey.goodPoints && (
                  <div className="admin-form-group">
                    <label>데스커 워케이션을 경험하면서 특별히 좋았던 점이 있다면 알려주세요.</label>
                    <p>{selectedSurvey.goodPoints}</p>
                  </div>
                )}
                
                {selectedSurvey.photoUrl && (
                  <div className="admin-form-group">
                    <label>데스커 워케이션을 추억할 수 있는 사진을 남겨주세요.</label>
                    <div className="admin-photo-preview" style={{ marginTop: '10px' }}>
                      {selectedSurvey.photoUrl.startsWith('data:') ? (
                        // Base64 이미지인 경우
                        <>
                          <img 
                            src={selectedSurvey.photoUrl} 
                            alt="업로드된 사진" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '400px', 
                              borderRadius: '8px',
                              border: '1px solid #e0e0e0',
                              display: 'block',
                              marginBottom: '10px'
                            }}
                          />
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = selectedSurvey.photoUrl;
                              link.download = `survey-photo-${selectedSurvey.id}.jpg`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            이미지 다운로드
                          </button>
                        </>
                      ) : (
                        // R2 URL인 경우
                        <>
                          <img 
                            src={selectedSurvey.photoUrl} 
                            alt="업로드된 사진" 
                            style={{ 
                              maxWidth: '75%', 
                              maxHeight: '400px', 
                              borderRadius: '8px',
                              border: '1px solid #e0e0e0',
                              display: 'block',
                              marginBottom: '10px'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.textContent = '이미지를 불러올 수 없습니다.';
                            }}
                          />
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <button className="btn btn-sm btn-primary">
                            <a 
                              href={selectedSurvey.photoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              새 탭에서 보기
                                </a>
                                </button>
                            <button 
                              className="btn btn-sm btn-secondary"
                              onClick={async () => {
                                try {
                                  const response = await fetch(selectedSurvey.photoUrl);
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `survey-photo-${selectedSurvey.id}.jpg`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  window.URL.revokeObjectURL(url);
                                } catch (error) {
                                  alert('이미지 다운로드에 실패했습니다.');
                                }
                              }}
                            >
                              이미지 다운로드
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="admin-form-group">
                  <label>사이트를 어떤 경로로 알게 되셨나요? (중복 선택 가능)</label>
                  <p>{(() => {
                    const discoveryMap = {
                      'desker_homepage': '데스커 홈페이지',
                      'sns': 'SNS',
                      'search': '검색',
                      'differ': 'differ',
                      'desker_lounge': '데스커 라운지',
                      'other': '기타'
                    };
                    const discoveries = Array.isArray(selectedSurvey.siteDiscovery) 
                      ? selectedSurvey.siteDiscovery.map(item => discoveryMap[item] || item).join(', ')
                      : selectedSurvey.siteDiscovery || '-';
                    return discoveries;
                  })()}</p>
                  {selectedSurvey.siteDiscoverySearch && (
                    <p><span className="badge">검색어</span> {selectedSurvey.siteDiscoverySearch}</p>
                  )}
                  {selectedSurvey.siteDiscoveryOther && (
                    <p><span className="badge">기타</span> {selectedSurvey.siteDiscoveryOther}</p>
                  )}
                </div>
                
                <div className="admin-form-group">
                  <label>사이트 방문 목적이 어떻게 되시나요? (중복 선택 가능)</label>
                  <p>{(() => {
                    const purposeMap = {
                      'curious_activities': '데스커의 활동이 궁금해서',
                      'workation_info': '워케이션 정보를 얻고 싶어서',
                      'brand_collaboration': '브랜드 협업을 제안하고 싶어서',
                      'work_culture': '업무 문화나 일하는 방식에 대해 알고 싶어서',
                      'space_interior': '공간, 인테리어에 관심이 있어서',
                      'other': '기타'
                    };
                    const purposes = Array.isArray(selectedSurvey.visitPurpose)
                      ? selectedSurvey.visitPurpose.map(item => purposeMap[item] || item).join(', ')
                      : selectedSurvey.visitPurpose || '-';
                    return purposes;
                  })()}</p>
                  {selectedSurvey.visitPurposeOther && (
                    <p><span className="badge">기타</span> {selectedSurvey.visitPurposeOther}</p>
                  )}
                </div>
                {selectedSurvey.companyName && (
                  <div className="admin-form-group">
                    <label>브랜드 협업 제안</label>
                    <p><strong>회사명:</strong> {selectedSurvey.companyName}</p>
                    <p><strong>담당자:</strong> {selectedSurvey.contactPerson}</p>
                    <p><strong>전화번호:</strong> {selectedSurvey.phoneNumber || '-'}</p>
                    <p><strong>이메일:</strong> {selectedSurvey.email || selectedSurvey.emailForPrizes || '-'}</p>
                    <p><strong>제목:</strong> {selectedSurvey.collaborationTitle}</p>
                    <p><strong>협업 제안 내용:</strong> {selectedSurvey.collaborationContent}</p>
                  </div>
                )}
                
                {(selectedSurvey.workType || selectedSurvey.importantSpace || selectedSurvey.discomfortPoints || selectedSurvey.workEnvironment || selectedSurvey.expectedActivities) && (
                  <>
                    <div className="admin-form-group">
                      <label>어떤 일을 하고 계시나요?</label>
                      <p>{selectedSurvey.workType || '-'}</p>
                    </div>
                    
                    <div className="admin-form-group">
                      <label>오피스나 일하는 공간에서 가장 중요하게 보는 공간은 무엇인가요?</label>
                      <p>{(() => {
                        const spaceMap = {
                          'personal_workspace': '개인 업무 공간',
                          'meeting_space': '회의 공간',
                          'lounge': '라운지 (휴식 공간)',
                          'cafe': '카페',
                          'other': '기타'
                        };
                        const space = spaceMap[selectedSurvey.importantSpace] || selectedSurvey.importantSpace || '-';
                        return space;
                      })()}</p>
                      {selectedSurvey.importantSpaceOther && (
                        <p><span className="badge">기타</span> {selectedSurvey.importantSpaceOther}</p>
                      )}
                    </div>
                    
                    <div className="admin-form-group">
                      <label>업무 공간에서 가장 불편함을 느끼는 부분은 무엇인가요?</label>
                      <p>{selectedSurvey.discomfortPoints || '-'}</p>
                    </div>
                    
                    <div className="admin-form-group">
                      <label>다음 중 가장 관심 있는 업무 환경은 어떤 모습인가요?</label>
                      <p>{(() => {
                        const envMap = {
                          'work_rest_balance': '일과 쉼이 자연스럽게 조화되는 환경',
                          'continuous_motivation': '꾸준히 동기부여가 되는 환경',
                          'nature_worklife': '자연 속의 편안한 워크라이프',
                          'flexible_challenge': '새로운 도전이 가능한 유연한 환경',
                          'other': '기타'
                        };
                        const env = envMap[selectedSurvey.workEnvironment] || selectedSurvey.workEnvironment || '-';
                        return env;
                      })()}</p>
                      {selectedSurvey.workEnvironmentOther && (
                        <p><span className="badge">기타</span> {selectedSurvey.workEnvironmentOther}</p>
                      )}
                    </div>
                    
                    <div className="admin-form-group">
                      <label>데스커에 기대하는 활동이 있나요? (중복 선택 가능)</label>
                      <p>{(() => {
                        const activityMap = {
                          'growth_content': '성장에 도움을 주는 컨텐츠 (ex. 인터뷰 아티클 등)',
                          'sustainable_culture': '지속가능한 업무 문화를 만들기 위한 활동',
                          'self_exploration': '나다움을 찾을 수 있는 자기 탐색 프로그램',
                          'community_sharing': '관심사를 공유할 수 있는 커뮤니티 운영',
                          'office_furniture': '몰입과 편안함을 고려한 사무가구',
                          'business_support': '신규 비즈니스의 성장을 위한 지원',
                          'other': '기타'
                        };
                        const activities = Array.isArray(selectedSurvey.expectedActivities)
                          ? selectedSurvey.expectedActivities.map(item => activityMap[item] || item).join(', ')
                          : selectedSurvey.expectedActivities || '-';
                        return activities;
                      })()}</p>
                      {selectedSurvey.expectedActivitiesOther && (
                        <p><span className="badge">기타</span> {selectedSurvey.expectedActivitiesOther}</p>
                      )}
                    </div>
                  </>
                )}
                <div className="admin-form-group">
                  <label>제출 시간</label>
                  <p>{(() => {
                    const dateStr = selectedSurvey.createdAt || selectedSurvey.submittedAt;
                    if (!dateStr) return '-';
                    
                    const date = new Date(dateStr);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    
                    return `${year}-${month}-${day} ${hours}:${minutes}`;
                  })()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SurveyManager;