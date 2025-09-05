import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getActiveSurveySchema, createSurveySchema, getAllSurveySchemas, toggleSchemaActive } from '../../services/surveySchemaService';
import './SurveyEditor.css';

const SurveyEditor = () => {
  const [currentSchema, setCurrentSchema] = useState(null);
  const [allSchemas, setAllSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'versions'
  const [expandedQuestions, setExpandedQuestions] = useState(new Set()); // 토글 상태 관리

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [activeSchema, allSchemas] = await Promise.all([
      getActiveSurveySchema(),
      getAllSurveySchemas()
    ]);
    setCurrentSchema(activeSchema);
    setAllSchemas(allSchemas);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // 현재 활성화된 스키마가 있으면 새 버전 생성, 없으면 첫 스키마 생성
    const result = await createSurveySchema(currentSchema);
    if (result.success) {
      alert('새로운 설문지 버전이 생성되었습니다.');
      await loadData();
      // 새로 생성된 스키마를 현재 스키마로 설정
      const newActiveSchema = allSchemas.find(s => s.id === result.id) || await getActiveSurveySchema();
      if (newActiveSchema) {
        setCurrentSchema(newActiveSchema);
      }
    } else {
      alert('저장 중 오류가 발생했습니다: ' + result.error);
    }
    setSaving(false);
  };

  const handleSchemaActivate = async (schemaId) => {
    const result = await toggleSchemaActive(schemaId);
    if (result.success) {
      await loadData();
      alert('설문지 버전이 활성화되었습니다.');
    } else {
      alert('활성화 중 오류가 발생했습니다.');
    }
  };



  const updateStep = (stepIndex, field, value) => {
    setCurrentSchema(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? { ...step, [field]: value } : step
      )
    }));
  };

  // 질문 토글 함수
  const toggleQuestion = (stepIndex, questionIndex) => {
    const questionKey = `${stepIndex}-${questionIndex}`;
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionKey)) {
        newSet.delete(questionKey);
      } else {
        newSet.add(questionKey);
      }
      return newSet;
    });
  };

  const updateQuestion = (stepIndex, questionIndex, field, value) => {
    setCurrentSchema(prev => ({
      ...prev,
      steps: prev.steps.map((step, sIndex) => 
        sIndex === stepIndex 
          ? {
              ...step,
              questions: step.questions.map((q, qIndex) => 
                qIndex === questionIndex ? { ...q, [field]: value } : q
              )
            }
          : step
      )
    }));
  };

  const addQuestion = (stepIndex) => {
    const newQuestion = {
      id: `question_${Date.now()}`,
      type: "text",
      title: "새로운 질문",
      required: false,
      options: []
    };

    setCurrentSchema(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex 
          ? { ...step, questions: [...step.questions, newQuestion] }
          : step
      )
    }));
  };

  const removeQuestion = (stepIndex, questionIndex) => {
    setCurrentSchema(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex 
          ? { 
              ...step, 
              questions: step.questions.filter((_, qIndex) => qIndex !== questionIndex)
            }
          : step
      )
    }));
  };

  const addOption = (stepIndex, questionIndex) => {
    const newOption = { value: "", label: "" };
    updateQuestion(stepIndex, questionIndex, 'options', [
      ...(currentSchema.steps[stepIndex].questions[questionIndex].options || []),
      newOption
    ]);
  };

  const updateOption = (stepIndex, questionIndex, optionIndex, field, value) => {
    const question = currentSchema.steps[stepIndex].questions[questionIndex];
    const updatedOptions = question.options.map((option, oIndex) => 
      oIndex === optionIndex ? { ...option, [field]: value } : option
    );
    updateQuestion(stepIndex, questionIndex, 'options', updatedOptions);
  };

  const removeOption = (stepIndex, questionIndex, optionIndex) => {
    const question = currentSchema.steps[stepIndex].questions[questionIndex];
    const updatedOptions = question.options.filter((_, oIndex) => oIndex !== optionIndex);
    updateQuestion(stepIndex, questionIndex, 'options', updatedOptions);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading">데이터를 불러오는 중...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-content">
        <div className="admin-header">
          <h1>설문지 수정</h1>
          <div className="admin-actions">
            {activeTab === 'edit' && (
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="btn btn-success"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            )}
          </div>
        </div>

        {activeTab === 'edit' && currentSchema && (
          <div className="survey-editor">
            <div className="survey-wrap">
            <div className="admin-form-group">
              <label>설문지 제목</label>
              <input
                value={currentSchema.title || ''}
                onChange={(e) => setCurrentSchema(prev => ({ ...prev, title: e.target.value }))}
                className="admin-input"
                rows="2"
              />
            </div>

            <div className="admin-form-group">
              <label>설문지 설명</label>
              <textarea
                value={currentSchema.description || ''}
                onChange={(e) => setCurrentSchema(prev => ({ ...prev, description: e.target.value }))}
                className="admin-input"
                rows="6"
              />
              </div>
              </div>

            {currentSchema.steps?.map((step, stepIndex) => (
              <div key={step.id || stepIndex} className="survey-wrap">
              <div className="survey-step-editor">
                <h3>{step.id}</h3>
                




                {step.questions?.map((question, questionIndex) => (
                  <div key={question.id} className="question-editor">
                    <div 
                      className="question-header clickable"
                      onClick={() => toggleQuestion(stepIndex, questionIndex)}
                    >
                      <h4>
                        <span className="toggle-icon">
                          {expandedQuestions.has(`${stepIndex}-${questionIndex}`) ? '▼' : '▶'}
                        </span>
                        {question.title && `${question.title}`}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // 토글 방지
                          removeQuestion(stepIndex, questionIndex);
                        }}
                        className="btn btn-danger btn-sm"
                      >
                        삭제
                      </button>
                    </div>

                    {expandedQuestions.has(`${stepIndex}-${questionIndex}`) && (
                      <div className="question-content">
                        <div className="admin-form-group">
                          <label>질문 타입</label>
                      <select
                        value={question.type || 'text'}
                        onChange={(e) => updateQuestion(stepIndex, questionIndex, 'type', e.target.value)}
                        className="admin-input"
                      >
                        <option value="text">텍스트</option>
                        <option value="email">이메일</option>
                        <option value="tel">전화번호</option>
                        <option value="radio">단일 선택</option>
                        <option value="checkbox">다중 선택</option>
                        <option value="file">파일 업로드</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label>질문 제목</label>
                      <input
                        value={question.title || ''}
                        onChange={(e) => updateQuestion(stepIndex, questionIndex, 'title', e.target.value)}
                        className="admin-input"
                        rows="2"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>질문 설명</label>
                      <textarea
                        value={question.description || ''}
                        onChange={(e) => updateQuestion(stepIndex, questionIndex, 'description', e.target.value)}
                        className="admin-input"
                        placeholder="질문에 대한 추가 설명이나 안내 문구"
                        rows="3"
                      />
                    </div>

                    {(question.type === 'text' || question.type === 'textarea' || question.type === 'email' || question.type === 'tel') && (
                      <div className="admin-form-group">
                        <label>플레이스홀더</label>
                        <input
                          type="text"
                          value={question.placeholder || ''}
                          onChange={(e) => updateQuestion(stepIndex, questionIndex, 'placeholder', e.target.value)}
                          className="admin-input"
                          placeholder="입력 필드의 안내 텍스트"
                        />
                      </div>
                    )}

                    {question.type === 'email' && (
                      <div className="admin-form-group" style={{ marginBottom: '0px' }}>
                        <label className="workation-yes">
                          <input
                            type="checkbox"
                            checked={question.sendCouponToThisEmail || false}
                            onChange={(e) => updateQuestion(stepIndex, questionIndex, 'sendCouponToThisEmail', e.target.checked)}
                            style={{ marginRight: '8px' }}
                          />
                          이 메일로 쿠폰 발송
                        </label>
                      </div>
                    )}

                    {(question.type === 'radio' || question.type === 'checkbox') && (
                      <div className="options-editor">
                        <label>선택지<br/><span style={{ fontSize: '1.5rem', color: '#999' }}>* value는 답변 저장에 필요한 값이므로 다른 선택지와 겹치지 않게 작성하세요.<br/>* label은 설문지에서 사용자에게 보여지는 텍스트입니다.</span></label>
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="option-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                            <p>value</p>
                            <input
                              type="text"
                              placeholder="값"
                              value={option.value || ''}
                              onChange={(e) => updateOption(stepIndex, questionIndex, optionIndex, 'value', e.target.value)}
                              className="admin-input"
                              />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1  }}>
                            <p>label</p>
                            <input
                              type="text"
                              placeholder="표시 텍스트"
                              value={option.label || ''}
                              onChange={(e) => updateOption(stepIndex, questionIndex, optionIndex, 'label', e.target.value)}
                              className="admin-input"
                              />
                              </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {(question.type === 'checkbox' || question.type === 'radio') && (
                                <div style={{ flex: 1, padding: '10px', minWidth: '350px' }}>
                                  <label style={{ marginBottom: '0px' }}>
                                    <input
                                      type="checkbox"
                                      checked={option.hasFollowUpQuestion || false}
                                      onChange={(e) => updateOption(stepIndex, questionIndex, optionIndex, 'hasFollowUpQuestion', e.target.checked)}
                                      style={{ marginRight: '8px' }}
                                    />
                                    선택 시 추가질문
                                  </label>
                                  
                                  {option.hasFollowUpQuestion && (
                                    <input
                                      type="text"
                                      placeholder="추가질문을 입력하세요"
                                      value={option.followUpQuestion || ''}
                                      onChange={(e) => updateOption(stepIndex, questionIndex, optionIndex, 'followUpQuestion', e.target.value)}
                                      className="admin-input"
                                      style={{ marginTop: '10px' }}
                                    />
                                  )}
                                </div>
                              )}
                              
                              <button
                                onClick={() => removeOption(stepIndex, questionIndex, optionIndex)}
                                className="btn btn-danger btn-sm"
                                style={{ minWidth: '60px', height: 'fit-content'}}
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(stepIndex, questionIndex)}
                          className="btn btn-secondary btn-sm"
                        >
                          선택지 추가
                        </button>
                      </div>
                    )}

                    <div className="admin-form-group" style={{ marginTop: '20px' }}>
                      <label className="workation-yes">
                        <input
                          type="checkbox"
                          checked={question.condition?.field === 'hasExperienced' && question.condition?.value === 'yes'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateQuestion(stepIndex, questionIndex, 'condition', { field: 'hasExperienced', value: 'yes' });
                            } else {
                              updateQuestion(stepIndex, questionIndex, 'condition', null);
                            }
                          }}
                          style={{ marginRight: '8px' }}
                        />
                        양양 워케이션 참여자에게만 노출
                      </label>
                    </div>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => addQuestion(stepIndex)}
                  className="btn btn-primary btn-sm"
                >
                  질문 추가
                </button>
                </div>
                </div>
            ))}
          </div>
        )}

        {activeTab === 'versions' && (
          <div className="versions-manager">
            <h3>설문지 버전 관리</h3>
            <div className="versions-list">
              {allSchemas.map((schema) => (
                <div key={schema.id} className={`version-item ${schema.isActive ? 'active' : ''}`}>
                  <div className="version-info">
                    <h4>{schema.version} {schema.isActive && <span className="badge badge-success">활성</span>}</h4>
                    <p>{schema.title}</p>
                    <small>생성일: {new Date(schema.createdAt?.toDate?.() || schema.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div className="version-actions">
                    {!schema.isActive && (
                      <button
                        onClick={() => handleSchemaActivate(schema.id)}
                        className="btn btn-primary btn-sm"
                      >
                        활성화
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


    </AdminLayout>
  );
};

export default SurveyEditor;