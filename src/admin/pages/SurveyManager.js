import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAllSurveys, deleteSurvey } from '../../services/surveyService';
import { getSurveySchemaByVersion, getSurveySchemaById } from '../../services/surveySchemaService';
import * as XLSX from 'xlsx';


const SurveyManager = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [selectedSurveySchema, setSelectedSurveySchema] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [visibleFields, setVisibleFields] = useState(new Set());
  const [schemaCache, setSchemaCache] = useState(new Map());

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
      setLoading(false);
    }
  };

  const handleView = async (survey) => {
    setSelectedSurvey(survey);
    
    // 응답의 스키마 버전에 맞는 스키마 가져오기
    const schema = await getSchemaForSurvey(survey);
    setSelectedSurveySchema(schema);
  };

  // 설문 응답에 맞는 스키마 가져오기 (캐시 사용)
  const getSchemaForSurvey = async (survey) => {
    const schemaKey = survey.schemaId || survey.schemaVersion || 'v1.0';
    
    // 캐시에서 먼저 확인
    if (schemaCache.has(schemaKey)) {
      return schemaCache.get(schemaKey);
    }
    
    let schema = null;
    
    // Firebase에서 모든 스키마 가져오기
    const { getAllSurveySchemas } = await import('../../services/surveySchemaService');
    const allSchemas = await getAllSurveySchemas();
    
    // schemaId가 있으면 ID로 조회
    if (survey.schemaId) {
      schema = await getSurveySchemaById(survey.schemaId);
    } else if (survey.schemaVersion) {
      schema = await getSurveySchemaByVersion(survey.schemaVersion);
    } else {
      // schemaId/schemaVersion이 없는 경우 활성 스키마 또는 가장 최근 스키마 사용
      const activeSchema = allSchemas.find(s => s.isActive);
      if (activeSchema) {
        schema = activeSchema;
      } else if (allSchemas.length > 0) {
        // 활성 스키마가 없으면 가장 최근 스키마 사용 (생성일 기준 내림차순 정렬)
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
          id: "basic_info",
          questions: [
            { id: "fullName", title: "이름", type: "text" },
            { id: "email", title: "이메일", type: "email" },
            { id: "phoneNumber", title: "전화번호", type: "tel" },
            { id: "hasExperienced", title: "양양 워케이션 경험 여부", type: "text" }
          ]
        }
      ]
    };
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



  // 동적 응답 값 가져오기 (스키마에 따라)
  const getDynamicAnswerValue = (survey, question) => {
    const value = survey[question.id];
    
    // 특별 처리가 필요한 필드들
    if (question.id === 'phoneNumber') {
      return survey.phoneNumber || '';
    }
    
    if (question.id === 'brandPhoneNumber') {
      return survey.brandPhoneNumber || '';
    }
    
    if (question.id === 'emailForPrizes') {
      // 경품용 이메일 또는 일반 이메일 찾기
      return survey.emailForPrizes || survey.email || '';
    }
    
    switch (question.type) {
      case 'radio':
        // 옵션 매핑
        if (question.options) {
          const option = question.options.find(opt => opt.value === value);
          let result = option ? option.label : value;
          
          // 추가질문이 있는 옵션인 경우 추가질문 응답도 포함
          // 스키마에 hasFollowUpQuestion이 없어도 실제 저장된 답변이 있으면 표시
          if (option) {
            const followUpKey = `${question.id}_${option.value}_followUp`;
            const followUpValue = survey[followUpKey];
            if (followUpValue && followUpValue.trim() !== '') {
              result += ` (${followUpValue})`;
            }
          }
          
          return result;
        }
        return value;
        
      case 'checkbox':
        // 다중 선택 매핑
        if (Array.isArray(value) && question.options) {
          return value.map(v => {
            const option = question.options.find(opt => opt.value === v);
            let result = option ? option.label : v;
            
            // 추가질문이 있는 옵션인 경우 추가질문 응답도 포함
            // 스키마에 hasFollowUpQuestion이 없어도 실제 저장된 답변이 있으면 표시
            if (option) {
              const followUpKey = `${question.id}_${option.value}_followUp`;
              const followUpValue = survey[followUpKey];
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
  };;

  // 동적 질문 렌더링
  const renderDynamicQuestion = (survey, question, schema) => {
    const value = getDynamicAnswerValue(survey, question);
    
    // 모든 질문을 표시하되, 값이 없으면 '-' 표시
    
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
                    link.href = value;
                    link.download = `survey-photo-${survey.id}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  이미지 다운로드
                </button>
              </>
            ) : (
              <>
                <img 
                  src={value} 
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
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={async () => {
                      try {
                        const response = await fetch(value);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `survey-photo-${survey.id}.jpg`;
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
        ) : (
          <p>{value || '-'}</p>
        )}
        

      </div>
    );
  };

  const handleExport = async () => {
    const workbook = await createExcelWorkbook(surveys);
    
    // Excel 파일 생성 및 다운로드
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `survey_responses_${new Date().toISOString().split('T')[0]}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const createExcelWorkbook = async (data) => {
    
    // 먼저 모든 스키마를 가져오기
    const { getAllSurveySchemas } = await import('../../services/surveySchemaService');
    const allSchemas = await getAllSurveySchemas();
    
    // 스키마별로 데이터 그룹화 - schemaId를 우선 사용
    const schemaGroups = {};
    
    // 모든 스키마에 대해 빈 그룹 생성
    allSchemas.forEach(schema => {
      if (schema.id) {
        schemaGroups[schema.id] = [];
      }
    });
    
    // 기본 v1.0 그룹도 추가
    schemaGroups['v1.0'] = [];
    
    // 설문 응답을 해당 스키마 그룹에 할당
    data.forEach(survey => {
      // schemaId를 우선 사용, 없으면 schemaVersion, 그것도 없으면 v1.0
      const schemaKey = survey.schemaId || survey.schemaVersion || 'v1.0';
      
      if (schemaGroups[schemaKey]) {
        schemaGroups[schemaKey].push(survey);
      } else {
        // 해당 스키마 그룹이 없으면 v1.0에 추가
        schemaGroups['v1.0'].push(survey);
      }
    });
    
    const workbook = XLSX.utils.book_new();
    
    // 각 스키마별로 시트 생성
    let createdSheets = 0;
    for (const [schemaKey, surveys] of Object.entries(schemaGroups)) {
      // 응답이 없는 스키마도 빈 시트 생성 (모든 스키마 버전 확인 가능)
      // 주석 처리하면 응답이 있는 스키마만 표시
      // 응답이 없는 스키마 처리 옵션
      const INCLUDE_EMPTY_SCHEMAS = true; // true로 변경하면 모든 스키마의 시트 생성
      if (surveys.length === 0) {
        if (!INCLUDE_EMPTY_SCHEMAS) {
          continue;
        }
      }
      
      
      try {
        // 해당 스키마 가져오기
        let schema = null;
        
        // schemaId가 있으면 ID로 조회
        if (schemaKey && schemaKey !== 'v1.0') {
          // schemaId가 Firebase 문서 ID 형태인지 확인
          if (schemaKey.length > 10 && !schemaKey.startsWith('v')) {
            schema = await getSurveySchemaById(schemaKey);
          } else {
            // 버전 형태면 버전으로 조회
            schema = await getSurveySchemaByVersion(schemaKey);
          }
        } else if (schemaKey === 'v1.0') {
          // v1.0은 레거시 데이터용 - 활성 스키마나 가장 최근 스키마로 대체
          const activeSchema = allSchemas.find(s => s.isActive);
          if (activeSchema) {
            schema = activeSchema;
          } else if (allSchemas.length > 0) {
            // 활성 스키마가 없으면 가장 최근 스키마 사용 (생성일 기준 내림차순 정렬)
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
        
        
        // 스키마의 모든 질문 수집 (추가질문 포함)
        const schemaQuestions = new Map();
        const collectQuestions = (schema) => {
          if (!schema || !schema.steps) {
            return;
          }
          
          schema.steps.forEach(step => {
            // 조건부 스텝도 포함
            
            step.questions?.forEach(question => {
              // 기본 질문 추가
              schemaQuestions.set(question.id, {
                title: question.title || question.id,
                type: question.type,
                options: question.options
              });
              
              // 추가질문은 별도 열로 추가하지 않음 (괄호로만 표시)
            });
          });
        };
        
        collectQuestions(schema);
        
        
        // 헤더 생성
        const headers = [
          '순번', 
          '이름', 
          '이메일', 
          '전화번호', 
          '주소'
        ];
        
        // 스키마의 모든 질문을 헤더에 추가
        for (const [, questionInfo] of schemaQuestions) {
          headers.push(questionInfo.title);
        }
        
        // 메타 정보 헤더 추가
        headers.push('스키마 버전', '개인정보 동의', '제출 시간');
        
        
        // 데이터 행 생성
        const rows = surveys.map((survey, index) => {
          const row = [
            // 순번 (역순)
            surveys.length - index,
            // 이름
            survey.fullName || '',
            // 이메일
            survey.email || survey.emailForPrizes || '',
            // 전화번호
            survey.phoneNumber || '',
            // 주소
            survey.address || ''
          ];
          
          // 각 질문에 대한 답변 추가
          for (const [questionId, questionInfo] of schemaQuestions) {
            // getDynamicAnswerValue를 사용하여 메인 질문의 답변 가져오기
            // 추가질문 응답은 자동으로 괄호로 포함됨
            const questionObj = {
              id: questionId,
              type: questionInfo.type,
              options: questionInfo.options
            };
            const value = getDynamicAnswerValue(survey, questionObj);
            
            // Excel용으로 값 정리 (안전한 문자열 처리)
            if (questionInfo.type === 'file' && value) {
              if (typeof value === 'string' && value.startsWith('data:')) {
                row.push('[이미지 데이터]');
              } else if (typeof value === 'string' && value.startsWith('http')) {
                row.push(value);
              } else {
                row.push(String(value || ''));
              }
            } else {
              // 모든 값을 안전한 문자열로 변환
              const cleanValue = String(value || '').replace(/[\x00-\x1F\x7F-\x9F]/g, '');
              row.push(cleanValue);
            }
          }
          
          // 메타 정보 추가
          row.push(
            // 스키마 버전 표시
            survey.schemaVersion || schema.version || schemaKey,
            // 개인정보 동의
            survey.privacyAgreement ? '동의' : '',
            // 제출 시간
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
          );
          
          return row;
        });
        
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
        
        // 시트 이름 생성 (Excel 시트명 31자 제한)
        let sheetName = '';
        if (schemaKey === 'v1.0') {
          sheetName = 'v1.0 (기본)';
        } else if (schema && schema.version) {
          // 날짜와 시간 포함 (예: v2024.12.19.1543 -> 2024.12.19_15:43)
          const versionMatch = schema.version.match(/v?(\d{4})\.(\d{2})\.(\d{2})\.?(\d{2})?(\d{2})?/);
          if (versionMatch) {
            sheetName = `${versionMatch[1]}.${versionMatch[2]}.${versionMatch[3]}`;
            // 시간 정보가 있으면 추가 (콜론은 Excel 시트명에서 허용되지 않으므로 하이픈으로 대체)
            if (versionMatch[4] && versionMatch[5]) {
              sheetName += `_${versionMatch[4]}-${versionMatch[5]}`;
            }
          } else {
            sheetName = schema.version;
          }
        } else {
          // schemaKey가 긴 ID인 경우 앞 8자만 사용
          sheetName = schemaKey.length > 20 ? schemaKey.substring(0, 8) : schemaKey;
        }
        
        // 시트명 길이 제한 및 특수문자 처리
        if (sheetName.length > 31) {
          sheetName = sheetName.substring(0, 28) + '...';
        }
        // Excel에서 허용하지 않는 특수문자 제거
        sheetName = sheetName.replace(/[\\/\?\*\[\]]/g, '_');
        
        // 중복 시트명 방지
        let finalSheetName = sheetName;
        let counter = 1;
        while (workbook.SheetNames && workbook.SheetNames.includes(finalSheetName)) {
          finalSheetName = `${sheetName} (${counter})`;
          counter++;
        }
        
        XLSX.utils.book_append_sheet(workbook, worksheet, finalSheetName);
        createdSheets++;
        
      } catch (error) {
        
        // 오류 발생 시 기본 형식으로 시트 생성
        const headers = [
          '순번', '이름', '이메일', '전화번호', '주소',
          '양양 경험', '좋았던 점', '사이트 경로', '방문 목적',
          '개인정보 동의', '제출 시간'
        ];
        
        const rows = surveys.map((survey, index) => [
          surveys.length - index,
          survey.fullName || '',
          survey.email || survey.emailForPrizes || '',
          survey.phoneNumber || '',
          survey.address || '',
          survey.hasExperienced === 'yes' ? '네' : survey.hasExperienced === 'no' ? '아니오' : '',
          survey.goodPoints || '',
          Array.isArray(survey.siteDiscovery) ? survey.siteDiscovery.join(', ') : '',
          Array.isArray(survey.visitPurpose) ? survey.visitPurpose.join(', ') : '',
          survey.privacyAgreement ? '동의' : '',
          (() => {
            const dateStr = survey.createdAt || survey.submittedAt;
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
          })()
        ]);
        
        const worksheetData = [headers, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        
        let sheetName = `오류_${schemaKey}`.substring(0, 31);
        sheetName = sheetName.replace(/[\\/\?\*\[\]]/g, '_');
        
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    }
    
    // 스키마 정보가 없는 응답들이 있는지 확인
    const unassignedSurveys = data.filter(survey => {
      const schemaKey = survey.schemaId || survey.schemaVersion || 'v1.0';
      return !Object.keys(schemaGroups).includes(schemaKey) && schemaKey !== 'v1.0';
    });
    
    if (unassignedSurveys.length > 0) {
    }
    
    return workbook;
  };



  return (
    <AdminLayout>
      <div className="admin-content">
        <div className="admin-header">
          <h1>설문 응답 관리</h1>
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
                    <td>{survey.email || survey.emailForPrizes || '-'}</td>
                    <td>{survey.phoneNumber || '-'}</td>
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

        {/* 리스트 관리 모달 */}


        {/* 상세 보기 모달 */}
        {selectedSurvey && (
          <div className="admin-modal-overlay" onClick={() => setSelectedSurvey(null)}>
            <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>설문 응답 상세</h2>
                <button className="admin-modal-close" onClick={() => setSelectedSurvey(null)}><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#000000" d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"></path></g></svg></button>
              </div>
              <div className="admin-modal-body survey-manager-modal-body">
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

                {/* 동적 스키마 기반 렌더링 */}
                {selectedSurveySchema && selectedSurveySchema.steps ? (
                  selectedSurveySchema.steps.map((step) => (
                    <div key={step.id} className="survey-step-manager">
                      <h3>
                        {step.title || step.id}
                      </h3>
                      {step.questions
                        .filter(question => {
                          // 응답 데이터에 해당 질문의 답변이 있는지 확인
                          const value = getDynamicAnswerValue(selectedSurvey, question);
                          if (value !== null && value !== undefined && value !== '') {
                            return true;
                          }
                          
                          // 추가질문 답변이 있는지 직접 확인 (스키마와 관계없이)
                          const surveyKeys = Object.keys(selectedSurvey);
                          const hasFollowUp = surveyKeys.some(key => 
                            key.startsWith(`${question.id}_`) && 
                            key.endsWith('_followUp') && 
                            selectedSurvey[key] && 
                            selectedSurvey[key].trim() !== ''
                          );
                          
                          if (hasFollowUp) {
                            return true;
                          }
                          
                          return false;
                        })
                        .map((question) => 
                          renderDynamicQuestion(selectedSurvey, question, selectedSurveySchema)
                        )}
                    </div>
                  ))
                ) : (
                  /* 기본 스키마가 없는 경우 기본 필드들 표시 */
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SurveyManager;