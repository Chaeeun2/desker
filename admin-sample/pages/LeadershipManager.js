import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { dataService } from '../services/dataService';
import AdminLayout from '../components/AdminLayout';
import SortableLineSet from '../components/SortableLineSet';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const LeadershipManager = () => {
  const [leadershipData, setLeadershipData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('management'); // 기본값을 management로 설정
  const [formData, setFormData] = useState({
    nameKo: '',
    nameEn: '',
    positionKo: '',
    positionEn: '',
    experienceKo: [''],
    experienceEn: [''],
    educationKo: [''],
    educationEn: [''],
    category: 'management'
  });

  // 개별 입력 필드 상태 관리
  const [experienceInputs, setExperienceInputs] = useState({ ko: [''], en: [''] });
  const [educationInputs, setEducationInputs] = useState({ ko: [''], en: [''] });

  // formData와 입력 필드 상태 동기화
  useEffect(() => {
    // 초기 로드 시에만 동기화 (빈 배열로 설정)
    if (formData.experienceKo.length === 1 && formData.experienceKo[0] === '') {
      setExperienceInputs({
        ko: [...formData.experienceKo],
        en: [...formData.experienceKo]
      });
      setEducationInputs({
        ko: [...formData.educationKo],
        en: [...formData.educationKo]
      });
    }
  }, [formData.experienceKo, formData.educationKo]); // 의존성 배열 수정

  useEffect(() => {
    loadLeadershipData();
  }, []);

  // 리더쉽 데이터 로드
  const loadLeadershipData = async () => {
    try {
      setLoading(true);
      const data = await dataService.leadership.getAll();
      
      // order 필드가 없는 기존 데이터에 order 추가
      const dataWithOrder = await Promise.all(
        data.map(async (item, index) => {
          if (item.order === undefined) {
            try {
              await dataService.leadership.update(item.id, { order: index });
              return { ...item, order: index };
            } catch (error) {
              // console.error('order 필드 추가 오류:', error);
              return { ...item, order: index };
            }
          }
          return item;
        })
      );
      
      // 카테고리 순서대로 정렬: management -> part1 -> part2 -> part3
      // 각 카테고리 내에서는 order 필드로 정렬
      const sortedData = dataWithOrder.sort((a, b) => {
        const categoryOrder = { 'management': 0, 'part1': 1, 'part2': 2, 'part3': 3 };
        const orderA = categoryOrder[a.category] ?? 999;
        const orderB = categoryOrder[b.category] ?? 999;
        
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        
        // 같은 카테고리 내에서는 order 필드로 정렬
        const itemOrderA = a.order ?? 999;
        const itemOrderB = b.order ?? 999;
        return itemOrderA - itemOrderB;
      });
      
      setLeadershipData(sortedData);
    } catch (error) {
      // console.error('리더쉽 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 추가 모달 열기
  const openAddModal = () => {
    setEditingId(null);
    resetForm();
    setModalOpen(true);
  };

  // 수정 모달 열기
  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      nameKo: item.nameKo || '',
      nameEn: item.nameEn || '',
      positionKo: item.positionKo || '',
      positionEn: item.positionEn || '',
      experienceKo: item.experienceKo || [''],
      experienceEn: item.experienceEn || [''],
      educationKo: item.educationKo || [''],
      educationEn: item.educationEn || [''],
      category: item.category || 'management'
    });
    
    // 개별 입력 필드 상태도 함께 설정
    setExperienceInputs({
      ko: [...(item.experienceKo || [''])],
      en: [...(item.experienceEn || [''])]
    });
    setEducationInputs({
      ko: [...(item.educationKo || [''])],
      en: [...(item.educationEn || [''])]
    });
    
    setModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && modalOpen) {
        closeModal();
      }
    };

    if (modalOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [modalOpen]);

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      nameKo: '',
      nameEn: '',
      positionKo: '',
      positionEn: '',
      experienceKo: [''],
      experienceEn: [''],
      educationKo: [''],
      educationEn: [''],
      category: 'management'
    });
    
    // 개별 입력 필드 상태도 초기화
    setExperienceInputs({ ko: [''], en: [''] });
    setEducationInputs({ ko: [''], en: [''] });
  };

  // 경력 줄 추가
  const addExperienceLine = () => {
    setFormData(prev => ({
      ...prev,
      experienceKo: [...prev.experienceKo, ''],
      experienceEn: [...prev.experienceEn, '']
    }));
    
    // 개별 입력 필드 상태도 함께 업데이트
    setExperienceInputs(prev => ({
      ko: [...prev.ko, ''],
      en: [...prev.en, '']
    }));
  };

  // 학력 줄 추가
  const addEducationLine = () => {
    setFormData(prev => ({
      ...prev,
      educationKo: [...prev.educationKo, ''],
      educationEn: [...prev.educationEn, '']
    }));
    
    // 개별 입력 필드 상태도 함께 업데이트
    setExperienceInputs(prev => ({
      ko: [...prev.ko, ''],
      en: [...prev.en, '']
    }));
  };

  // 경력 줄 삭제
  const removeExperienceLine = (index) => {
    if (formData.experienceKo.length > 1) {
      setFormData(prev => ({
        ...prev,
        experienceKo: prev.experienceKo.filter((_, i) => i !== index),
        experienceEn: prev.experienceEn.filter((_, i) => i !== index)
      }));
      
      // 개별 입력 필드 상태도 함께 업데이트
      setExperienceInputs(prev => ({
        ko: prev.ko.filter((_, i) => i !== index),
        en: prev.en.filter((_, i) => i !== index)
      }));
    }
  };

  // 학력 줄 삭제
  const removeEducationLine = (index) => {
    if (formData.educationKo.length > 1) {
      setFormData(prev => ({
        ...prev,
        educationKo: prev.educationKo.filter((_, i) => i !== index),
        educationEn: prev.educationEn.filter((_, i) => i !== index)
      }));
      
      // 개별 입력 필드 상태도 함께 업데이트
      setEducationInputs(prev => ({
        ko: prev.ko.filter((_, i) => i !== index),
        en: prev.en.filter((_, i) => i !== index)
      }));
    }
  };



  // 개별 경력 입력 필드 변경 처리
  const handleExperienceInputChange = useCallback((language, index, value) => {
    if (language === 'ko') {
      setExperienceInputs(prev => ({
        ...prev,
        ko: prev.ko.map((line, i) => i === index ? value : line)
      }));
    } else {
      setExperienceInputs(prev => ({
        ...prev,
        en: prev.en.map((line, i) => i === index ? value : line)
      }));
    }
  }, []);

  // 개별 학력 입력 필드 변경 처리
  const handleEducationInputChange = useCallback((language, index, value) => {
    if (language === 'ko') {
      setEducationInputs(prev => ({
        ...prev,
        ko: prev.ko.map((line, i) => i === index ? value : line)
      }));
    } else {
      setEducationInputs(prev => ({
        ...prev,
        en: prev.en.map((line, i) => i === index ? value : line)
      }));
    }
  }, []);

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 개별 입력 필드 상태를 formData에 반영
    const finalFormData = {
      ...formData,
      experienceKo: experienceInputs.ko,
      experienceEn: experienceInputs.en,
      educationKo: educationInputs.ko,
      educationEn: educationInputs.en
    };
    
    try {
      if (editingId) {
        // 수정 모드
        await dataService.leadership.update(editingId, {
          ...finalFormData,
          updatedAt: new Date()
        });
        alert('수정되었습니다.');
      } else {
        // 추가 모드 - 현재 카테고리의 마지막 순서로 설정
        const currentCategoryItems = leadershipData.filter(item => item.category === finalFormData.category);
        const maxOrder = currentCategoryItems.length > 0 
          ? Math.max(...currentCategoryItems.map(item => item.order ?? 0))
          : -1;
        
        await dataService.leadership.add({
          ...finalFormData,
          order: maxOrder + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        alert('추가되었습니다.');
      }
      
      await loadLeadershipData();
      closeModal();
    } catch (error) {
      // console.error('저장 오류:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await dataService.leadership.delete(id);
        await loadLeadershipData();
        alert('삭제되었습니다.');
      } catch (error) {
        // console.error('삭제 오류:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  // 선택된 카테고리에 따라 데이터 필터링
  const filteredLeadershipData = useMemo(() => {
    return leadershipData.filter(item => item.category === selectedCategory);
  }, [leadershipData, selectedCategory]);

  // 드래그앤드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 드래그 종료 시 순서 변경
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    


    if (active.id !== over.id) {
      const oldIndex = filteredLeadershipData.findIndex(item => item.id === active.id);
      const newIndex = filteredLeadershipData.findIndex(item => item.id === over.id);



      if (oldIndex !== -1 && newIndex !== -1) {
        // 전체 leadershipData에서 해당 카테고리의 아이템들을 찾아서 순서 변경
        const categoryItems = leadershipData.filter(item => item.category === selectedCategory);
        const categoryItemIds = categoryItems.map(item => item.id);
        
        const oldCategoryIndex = categoryItemIds.indexOf(active.id);
        const newCategoryIndex = categoryItemIds.indexOf(over.id);
        
        if (oldCategoryIndex !== -1 && newCategoryIndex !== -1) {
          const newCategoryOrder = arrayMove(categoryItems, oldCategoryIndex, newCategoryIndex);

          
          // 순서 변경된 데이터를 Firebase에 저장
          try {
            for (let i = 0; i < newCategoryOrder.length; i++) {
              const updateData = {
                ...newCategoryOrder[i],
                order: i
              };

              await dataService.leadership.update(newCategoryOrder[i].id, updateData);
            }
            
            // 전체 데이터를 다시 로드하여 순서 반영
            await loadLeadershipData();

          } catch (error) {
            // console.error('순서 변경 저장 오류:', error);
            alert('순서 변경에 실패했습니다.');
          }
        }
      }
    }
  };

  // 드래그 가능한 아이템 컴포넌트
  const SortableItem = ({ item }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: item.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="admin-leadership-item"
      >
        <div className="admin-leadership-item-content">
          <div 
            className="admin-leadership-item-drag-handle"
            {...attributes}
            {...listeners}
            style={{ cursor: 'grab', padding: '5px', marginRight: '5px' }}
          >
            ⠿
          </div>
          <div className="admin-leadership-item-info">
            <div className="admin-leadership-item-name">
              {item.nameKo}
            </div>
            <div className="admin-leadership-item-position">
              {item.positionKo}
            </div>
          </div>
          <div className="admin-leadership-item-actions">
            <button
              type="button"
              className="admin-button"
              onClick={() => openEditModal(item)}
            >
              수정
            </button>
            <button
              type="button"
              className="admin-button admin-button-secondary"
              onClick={() => handleDelete(item.id)}
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 드래그 가능한 경력/학력 줄 컴포넌트
  const SortableLine = ({ type, language, index, value, onChange, onDelete, placeholder }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: `${type}-${language}-${index}` });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`admin-form-${type}-line`}
      >
        <div 
          className="admin-form-drag-handle"
          {...attributes}
          {...listeners}
          style={{ cursor: 'grab', padding: '4px', marginRight: '8px', color: '#999' }}
        >
          ⠿
        </div>
        <input
          type="text"
          className="admin-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        {language === 'en' && (
          <button
            type="button"
            className="admin-button delete-line"
            onClick={onDelete}
          >
            ×
          </button>
        )}
      </div>
    );
  };

  // 경력/학력 줄 드래그 종료 시 순서 변경
  const handleLineDragEnd = async (event, type, language) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = formData[`${type}${language}`].findIndex(item => item.id === active.id);
      const newIndex = formData[`${type}${language}`].findIndex(item => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newLines = arrayMove(formData[`${type}${language}`], oldIndex, newIndex);
        setFormData(prev => ({
          ...prev,
          [`${type}${language}`]: newLines
        }));
      }
    }
  };

  // 국영문 세트 드래그 종료 시 순서 변경
  const handleLineSetDragEnd = (event, type) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = parseInt(active.id.split('-')[1]);
      const newIndex = parseInt(over.id.split('-')[1]);

      if (!isNaN(oldIndex) && !isNaN(newIndex)) {
        // 국문과 영문 배열을 동시에 순서 변경
        if (type === 'experience') {
          const newKoLines = arrayMove(experienceInputs.ko, oldIndex, newIndex);
          const newEnLines = arrayMove(experienceInputs.en, oldIndex, newIndex);
          
          setExperienceInputs(prev => ({
            ko: newKoLines,
            en: newEnLines
          }));
        } else if (type === 'education') {
          const newKoLines = arrayMove(educationInputs.ko, oldIndex, newIndex);
          const newEnLines = arrayMove(educationInputs.en, oldIndex, newIndex);
          
          setEducationInputs(prev => ({
            ko: newKoLines,
            en: newEnLines
          }));
        }
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-content-wrapper">
          <div className="admin-content">
            <h2 className="admin-page-title">Leadership 관리</h2>
            <div className="admin-content-layout">
              <div className="admin-content-main">
                <div className="admin-content-header">
                  <h3>Leadership 관리</h3>
                </div>
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
          <h2 className="admin-page-title">Leadership 관리</h2>
          
          <div className="admin-content-layout">
            <div className="admin-content-main">
              <div className="admin-content-header">
                <h3>Leadership 관리</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="admin-select"
                    style={{ marginRight: '10px', width: '180px' }}
                  >
                    <option value="management">경영진</option>
                    <option value="part1">투자운용 Part 1</option>
                    <option value="part2">투자운용 Part 2</option>
                    <option value="part3">투자운용 Part 3</option>
                  </select>
                  <button
                    type="button"
                    className="admin-button"
                    onClick={openAddModal}
                  >
                    추가
                  </button>
                </div>
              </div>
              
              <div className="admin-content-list">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredLeadershipData.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredLeadershipData.map((item) => (
                      <SortableItem key={item.id} item={item} />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>
        </div>

        {/* Leadership 추가/수정 모달 */}
        {modalOpen && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleSubmit}>
                <div className="admin-modal-header">
                  <h3>{editingId ? 'Leadership 수정' : 'Leadership 추가'}</h3>
                  <div className="admin-button-group">
                    <button
                      type="button"
                      className="admin-button admin-button-secondary"
                      onClick={closeModal}
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="admin-button"
                    >
                      {editingId ? '수정' : '추가'}
                    </button>
                  </div>
                </div>
                
                <div className="admin-modal-body">
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>이름 (국문)</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={formData.nameKo}
                        onChange={(e) => setFormData({...formData, nameKo: e.target.value})}
                        placeholder="국문 이름을 입력하세요"
                        required
                      />
                    </div>
                    
                    <div className="admin-form-group">
                      <label>이름 (영문)</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={formData.nameEn}
                        onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                        placeholder="영문 이름을 입력하세요"
                        required
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>직책 (국문)</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={formData.positionKo}
                        onChange={(e) => setFormData({...formData, positionKo: e.target.value})}
                        placeholder="국문 직책을 입력하세요"
                        required
                      />
                    </div>
                    
                    <div className="admin-form-group">
                      <label>직책 (영문)</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={formData.positionEn}
                        onChange={(e) => setFormData({...formData, positionEn: e.target.value})}
                        placeholder="영문 직책을 입력하세요"
                        required
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>카테고리</label>
                    <select
                      className="admin-select"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      <option value="management">경영진</option>
                      <option value="part1">투자운용 Part 1</option>
                      <option value="part2">투자운용 Part 2</option>
                      <option value="part3">투자운용 Part 3</option>
                    </select>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group" style={{ width: '100%' }}>
                      <label>주요경력</label>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleLineSetDragEnd(event, 'experience')}
                      >
                        <SortableContext
                          items={experienceInputs.ko.map((line, index) => `experience-${index}`)}
                          strategy={verticalListSortingStrategy}
                        >
                          {experienceInputs.ko.map((line, index) => (
                            <SortableLineSet
                              key={`experience-${index}`}
                              type="experience"
                              index={index}
                              koValue={line}
                              enValue={experienceInputs.en[index] || ''}
                              onKoChange={(e) => handleExperienceInputChange('ko', index, e.target.value)}
                              onEnChange={(e) => handleExperienceInputChange('en', index, e.target.value)}
                              onDelete={() => removeExperienceLine(index)}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>
                  
                  <div className="admin-form-row">
                    <div className="admin-form-group" style={{ margin: '0px 0 20px 0' }}>
                      <button
                        type="button"
                        className="admin-button add-line"
                        onClick={addExperienceLine}
                      >
                        경력 추가
                      </button>
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group" style={{ width: '100%' }}>
                      <label>학력</label>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleLineSetDragEnd(event, 'education')}
                      >
                        <SortableContext
                          items={educationInputs.ko.map((line, index) => `education-${index}`)}
                          strategy={verticalListSortingStrategy}
                        >
                          {educationInputs.ko.map((line, index) => (
                            <SortableLineSet
                              key={`education-${index}`}
                              type="education"
                              index={index}
                              koValue={line}
                              enValue={educationInputs.en[index] || ''}
                              onKoChange={(e) => handleEducationInputChange('ko', index, e.target.value)}
                              onEnChange={(e) => handleEducationInputChange('en', index, e.target.value)}
                              onDelete={() => removeEducationLine(index)}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>
                  
                  <div className="admin-form-row">
                    <div className="admin-form-group" style={{ margin: '0px 0 20px 0' }}>
                      <button
                        type="button"
                        className="admin-button add-line"
                        onClick={addEducationLine}
                      >
                        학력 추가
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default LeadershipManager;
