import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAllSurveys, deleteSurvey } from '../../services/surveyService';
import { getSurveySchemaByVersion, getSurveySchemaById } from '../../services/surveySchemaService';
import * as XLSX from 'xlsx';

const CollaborationManager = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [selectedInquirySchema, setSelectedInquirySchema] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [schemaCache, setSchemaCache] = useState(new Map());

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const data = await getAllSurveys();
      // 브랜드 협업 문의만 필터링 (visitPurpose에 "brand_collaboration"이 포함된 경우)
      const collaborationInquiries = data.filter(survey => 
        Array.isArray(survey.visitPurpose) 
          ? survey.visitPurpose.includes('brand_collaboration')
          : survey.visitPurpose === 'brand_collaboration'
      );
      setInquiries(collaborationInquiries);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleView = async (inquiry) => {
    setSelectedInquiry(inquiry);
    
    // 응답의 스키마 버전에 맞는 스키마 가져오기
    const schema = await getSchemaForInquiry(inquiry);
    setSelectedInquirySchema(schema);
  };

  // 설문 응답에 맞는 스키마 가져오기 (캐시 사용)
  const getSchemaForInquiry = async (inquiry) => {
    const schemaKey = inquiry.schemaId || inquiry.schemaVersion || 'v1.0';
    
    // 캐시에서 먼저 확인
    if (schemaCache.has(schemaKey)) {
      return schemaCache.get(schemaKey);
    }
    
    let schema = null;
    
    // Firebase에서 모든 스키마 가져오기
    const { getAllSurveySchemas } = await import('../../services/surveySchemaService');
    const allSchemas = await getAllSurveySchemas();
    
    // schemaId가 있으면 ID로 조회
    if (inquiry.schemaId) {
      schema = await getSurveySchemaById(inquiry.schemaId);
    } else if (inquiry.schemaVersion) {
      schema = await getSurveySchemaByVersion(inquiry.schemaVersion);
    } else {
      // schemaId/schemaVersion이 없는 경우 활성 스키마 또는 가장 최근 스키마 사용
      const activeSchema = allSchemas.find(s => s.isActive);
      if (activeSchema) {
        schema = activeSchema;
      } else if (allSchemas.length > 0) {
        schema = allSchemas.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        })[0];
      }
    }
    
    // Firebase에서도 스키마를 찾을 수 없는 경우에만 최소한의 기본 스키마 사용
    if (!schema) {
      schema = getMinimalDefaultSchema();
    }
    
    // 캐시에 저장
    const newCache = new Map(schemaCache);
    newCache.set(schemaKey, schema);
    setSchemaCache(newCache);
    
    return schema;
  };

  // 최소한의 기본 스키마 (Firebase 스키마를 찾을 수 없는 경우에만 사용)
  const getMinimalDefaultSchema = () => {
    return {
      version: 'fallback',
      steps: [
        {
          id: "brand_collaboration",
          questions: [
            { id: "companyName", title: "회사명", type: "text" },
            { id: "contactPerson", title: "담당자명", type: "text" },
            { id: "brandPhoneNumber", title: "전화번호", type: "tel" },
            { id: "email", title: "이메일", type: "email" },
            { id: "collaborationTitle", title: "제목", type: "text" },
            { id: "collaborationContent", title: "협업 제안 내용", type: "textarea" }
          ]
        }
      ]
    };
  };

  // 동적 응답 값 가져오기 (스키마에 따라)
  const getDynamicAnswerValue = (inquiry, question) => {
    const value = inquiry[question.id];
    
    // 특별 처리가 필요한 필드들
    if (question.id === 'brandPhoneNumber') {
      return inquiry.brandPhoneNumber || inquiry.phoneNumber || '';
    }
    
    switch (question.type) {
      case 'radio':
        if (question.options) {
          const option = question.options.find(opt => opt.value === value);
          let result = option ? option.label : value;
          
          if (option) {
            const followUpKey = `${question.id}_${option.value}_followUp`;
            const followUpValue = inquiry[followUpKey];
            if (followUpValue && followUpValue.trim() !== '') {
              result += ` (${followUpValue})`;
            }
          }
          
          return result;
        }
        return value;
        
      case 'checkbox':
        if (Array.isArray(value) && question.options) {
          return value.map(v => {
            const option = question.options.find(opt => opt.value === v);
            let result = option ? option.label : v;
            
            if (option) {
              const followUpKey = `${question.id}_${option.value}_followUp`;
              const followUpValue = inquiry[followUpKey];
              if (followUpValue && followUpValue.trim() !== '') {
                result += ` (${followUpValue})`;
              }
            }
            
            return result;
          }).join(', ');
        }
        return Array.isArray(value) ? value.join(', ') : value;
        
      case 'email':
      case 'tel':
      case 'text':
      case 'textarea':
      case 'file':
      default:
        return value || '';
    }
  };

  // 동적 질문 렌더링 (협업 관련 질문만)
  const renderDynamicQuestion = (inquiry, question, schema) => {
    const value = getDynamicAnswerValue(inquiry, question);
    
    return (
      <div className="admin-form-group" key={question.id}>
        <label>{question.title}</label>
        {question.description && (
          <div className="uploadInfo" style={{ whiteSpace: 'pre-line', marginBottom: '10px', fontSize: '14px', color: '#666' }}>
            {question.description}
          </div>
        )}
        {question.type === 'file' && value ? (
          <div className="admin-photo-preview" style={{ marginTop: '10px' }}>
            {value.startsWith('data:') ? (
              <>
                <img 
                  src={value} 
                  alt="업로드된 파일" 
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
                    link.href = value;
                    link.download = `collaboration-file-${inquiry.id}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  다운로드
                </button>
              </>
            ) : (
              <>
                <img 
                  src={value} 
                  alt="업로드된 파일" 
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
                    e.target.nextSibling.textContent = '파일을 불러올 수 없습니다.';
                  }}
                />
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={async () => {
                      try {
                        const response = await fetch(value, { 
                          mode: 'cors'
                        });
                        
                        if (response.ok) {
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `collaboration-file-${inquiry.id}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } else {
                          throw new Error('Fetch failed');
                        }
                      } catch (error) {
                        try {
                          const link = document.createElement('a');
                          link.href = value;
                          link.download = `collaboration-file-${inquiry.id}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        } catch (linkError) {
                          console.error('All download methods failed:', linkError);
                          window.open(value, '_blank');
                        }
                      }
                    }}
                  >
                    다운로드
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <p style={{ whiteSpace: 'pre-wrap' }}>{value || '-'}</p>
        )}
      </div>
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const result = await deleteSurvey(id);
      if (result.success) {
        const updatedInquiries = inquiries.filter(inquiry => inquiry.id !== id);
        setInquiries(updatedInquiries);
        
        // 현재 페이지에 아이템이 없으면 이전 페이지로 이동
        const totalPages = Math.ceil(updatedInquiries.length / itemsPerPage);
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
  const currentItems = inquiries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(inquiries.length / itemsPerPage);

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

  const handleExport = async () => {
    const workbook = await createExcelWorkbook(inquiries);
    
    // Excel 파일 생성 및 다운로드
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `brand_collaboration_inquiries_${new Date().toISOString().split('T')[0]}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const createExcelWorkbook = async (data) => {
    // 헤더 생성
    const headers = [
      '순번', 
      '회사명',
      '담당자명', 
      '이메일', 
      '전화번호', 
      '협업 제목',
      '협업 내용',
      '개인정보 동의', 
      '접수 시간'
    ];

    // 데이터 행 생성
    const rows = data.map((inquiry, index) => [
      // 순번 (역순)
      data.length - index,
      // 회사명
      inquiry.companyName || '',
      // 담당자명
      inquiry.contactPerson || inquiry.fullName || '',
      // 이메일
      inquiry.email || '',
      // 전화번호
      inquiry.brandPhoneNumber || inquiry.phoneNumber || '',
      // 협업 제목
      inquiry.collaborationTitle || '',
      // 협업 내용
      inquiry.collaborationContent || '',
      // 개인정보 동의
      inquiry.privacyAgreement ? '동의' : '',
      // 접수 시간
      (() => {
        const dateStr = inquiry.createdAt || inquiry.submittedAt;
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      })()
    ]);

    // 워크시트 생성
    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // 열 너비 자동 조정
    const colWidths = headers.map((header, i) => {
      const maxLength = Math.max(
        header.length,
        ...rows.map(row => String(row[i] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) }; // 최대 50자
    });
    worksheet['!cols'] = colWidths;

    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '브랜드협업문의');
    
    return workbook;
  };

  return (
    <AdminLayout>
      <div className="admin-content">
        <div className="admin-header">
          <h1>협업 문의 관리</h1>
          <div className="admin-actions" style={{ textAlign: 'right' }}>
            <button onClick={handleExport} className="btn btn-primary">
              Excel 내보내기
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading"></div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>순번</th>
                  <th>담당자명</th>
                  <th>이메일</th>
                  <th>전화번호</th>
                  <th>접수 시간</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((inquiry, index) => (
                  <tr key={inquiry.id}>
                    <td>{inquiries.length - (indexOfFirstItem + index)}</td>
                    <td>{inquiry.contactPerson || inquiry.fullName}</td>
                    <td>{inquiry.email || '-'}</td>
                    <td>{inquiry.brandPhoneNumber || inquiry.phoneNumber || '-'}</td>
                    <td>{(() => {
                      const dateStr = inquiry.createdAt || inquiry.submittedAt;
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
                        onClick={() => handleView(inquiry)} 
                        className="btn btn-sm btn-primary"
                      >
                        상세
                      </button>
                      <button 
                        onClick={() => handleDelete(inquiry.id)} 
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
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16.1795 3.26875C15.7889 2.87823 15.1558 2.87823 14.7652 3.26875L8.12078 9.91322C6.94952 11.0845 6.94916 12.9833 8.11996 14.155L14.6903 20.7304C15.0808 21.121 15.714 21.121 16.1045 20.7304C16.495 20.3399 16.495 19.7067 16.1045 19.3162L9.53246 12.7442C9.14194 12.3536 9.14194 11.7205 9.53246 11.33L16.1795 4.68297C16.57 4.29244 16.57 3.65928 16.1795 3.26875Z" fill="#000000"></path> </g></svg>
                </button>
                
                {renderPageNumbers()}
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7.82054 20.7313C8.21107 21.1218 8.84423 21.1218 9.23476 20.7313L15.8792 14.0868C17.0505 12.9155 17.0508 11.0167 15.88 9.84497L9.3097 3.26958C8.91918 2.87905 8.28601 2.87905 7.89549 3.26958C7.50497 3.6601 7.50497 4.29327 7.89549 4.68379L14.4675 11.2558C14.8581 11.6464 14.8581 12.2795 14.4675 12.67L7.82054 19.317C7.43002 19.7076 7.43002 20.3407 7.82054 20.7313Z" fill="#000000"></path> </g></svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 상세 보기 모달 */}
        {selectedInquiry && (
          <div className="admin-modal-overlay" onClick={() => setSelectedInquiry(null)}>
            <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>협업 문의 상세</h2>
                <button className="admin-modal-close" onClick={() => setSelectedInquiry(null)}>
                  <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#000000" d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"></path></g></svg>
                </button>
              </div>
              <div className="admin-modal-body survey-manager-modal-body">
                <div className="admin-form-group">
                  <label>접수 시간</label>
                  <p>{(() => {
                    const dateStr = selectedInquiry.createdAt || selectedInquiry.submittedAt;
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

                {/* 동적 스키마 기반 렌더링 - 브랜드 협업 관련 질문만 */}
                {selectedInquirySchema && selectedInquirySchema.steps ? (
                  selectedInquirySchema.steps
                    .filter(step => step.id === 'brand_collaboration' || step.conditional === true)
                    .map((step) => (
                      <div key={step.id} className="survey-step-manager">
                        <h3>
                          {step.title || '브랜드 협업 정보'}
                        </h3>
                        {step.questions
                          .filter(question => {
                            // 브랜드 협업 관련 질문만 필터링
                            const collaborationFields = ['companyName', 'contactPerson', 'brandPhoneNumber', 'email', 'collaborationTitle', 'collaborationContent'];
                            return collaborationFields.includes(question.id);
                          })
                          .filter(question => {
                            // 응답 데이터에 해당 질문의 답변이 있는지 확인
                            const value = getDynamicAnswerValue(selectedInquiry, question);
                            if (value !== null && value !== undefined && value !== '') {
                              return true;
                            }
                            return false;
                          })
                          .map((question) => 
                            renderDynamicQuestion(selectedInquiry, question, selectedInquirySchema)
                          )}
                      </div>
                    ))
                ) : (
                  /* 기본 스키마가 없는 경우 기본 필드들 표시 */
                  <>
                    <div className="admin-form-group">
                      <label>회사 정보</label>
                      <p><strong>회사명:</strong> {selectedInquiry.companyName || '-'}</p>
                      <p><strong>담당자명:</strong> {selectedInquiry.contactPerson || selectedInquiry.fullName || '-'}</p>
                      <p><strong>이메일:</strong> {selectedInquiry.email || '-'}</p>
                      <p><strong>전화번호:</strong> {selectedInquiry.brandPhoneNumber || selectedInquiry.phoneNumber || '-'}</p>
                    </div>
                    
                    <div className="admin-form-group">
                      <label>협업 제안</label>
                      <p><strong>제목:</strong> {selectedInquiry.collaborationTitle || '-'}</p>
                      <p><strong>내용:</strong></p>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{selectedInquiry.collaborationContent || '-'}</p>
                    </div>
                  </>
                )}



                <div className="admin-form-group">
                  <label>개인정보 동의</label>
                  <p>{selectedInquiry.privacyAgreement ? '동의' : '미동의'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CollaborationManager;