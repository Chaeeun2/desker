import React, { useState, useEffect } from 'react';
import { getActiveSurveySchema } from '../../services/surveySchemaService';
import './ListManagementModal.css';

const ListManagementModal = ({ isOpen, onClose, onSave }) => {
  const [surveySchema, setSurveySchema] = useState(null);
  const [selectedFields, setSelectedFields] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSchema();
    }
  }, [isOpen]);

  const loadSchema = async () => {
    setLoading(true);
    const schema = await getActiveSurveySchema();
    setSurveySchema(schema);
    
    // 기본적으로 모든 필드 선택
    if (schema?.steps) {
      const allFields = new Set();
      schema.steps.forEach(step => {
        step.questions?.forEach(question => {
          allFields.add(question.id);
        });
      });
      setSelectedFields(allFields);
    }
    
    setLoading(false);
  };

  const toggleField = (fieldId) => {
    setSelectedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId);
      } else {
        newSet.add(fieldId);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    onSave(Array.from(selectedFields));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="list-modal-overlay">
      <div className="list-modal">
        <div className="list-modal-header">
          <h2>리스트 관리</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="list-modal-body">
          {loading ? (
            <p>로딩 중...</p>
          ) : (
            <div className="field-list">
              <h3>표시할 질문 선택</h3>
              {surveySchema?.steps?.map((step, stepIndex) => (
                <div key={step.id} className="step-section">
                  <h4>{step.id}</h4>
                  {step.questions?.map((question) => (
                    <label key={question.id} className="field-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedFields.has(question.id)}
                        onChange={() => toggleField(question.id)}
                      />
                      <span>{question.title} ({question.type})</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="list-modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            취소
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            적용
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListManagementModal;