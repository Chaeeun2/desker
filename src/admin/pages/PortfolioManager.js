import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import AdminLayout from '../components/AdminLayout';
import PortfolioModal from '../components/PortfolioModal';
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

// SortablePortfolioItem 컴포넌트
const SortablePortfolioItem = ({ item, onEdit, onDelete }) => {
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
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`admin-leadership-item ${isDragging ? 'dragging' : ''}`}
    >
      <div className="admin-leadership-item-content">
        <div 
          {...attributes}
          {...listeners}
          className="admin-leadership-item-drag-handle"
          style={{ cursor: 'grab', padding: '5px', marginRight: '5px' }}
        >
          ⠿
        </div>
        <div className="admin-leadership-item-info">
          <div className="admin-leadership-item-name">
            {item.titleKo || item.titleEn}
          </div>
          <div className="admin-leadership-item-position">
            {item.categoryKo || item.categoryEn}
          </div>
        </div>
        <div className="admin-leadership-item-actions">
          <button
            type="button"
            className="admin-button"
            onClick={() => onEdit(item)}
          >
            수정
          </button>
          <button
            type="button"
            className="admin-button admin-button-secondary"
            onClick={() => onDelete(item.id)}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

// SortableLabelItem 컴포넌트
const SortableLabelItem = ({ labelItem, index, onUpdate, onRemove, disabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: labelItem.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: '20px',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`admin-form-group ${isDragging ? 'dragging' : ''}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div 
          {...attributes}
          {...listeners}
          style={{ 
            cursor: 'grab', 
            marginTop: '20px',
            color: '#999',
            fontSize: '2rem',
          }}
        >
          ⠿
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ marginBottom: '10px' }}>{`라벨 ${index + 1}`}</label>
          <input
            type="text"
            className="admin-input"
            value={labelItem.label}
            onChange={(e) => onUpdate(labelItem.id, e.target.value)}
            placeholder="라벨을 입력하세요 (예: Location, GFA, Floor)"
          />
        </div>
        <button
          type="button"
          className="admin-button admin-button-secondary"
          onClick={() => onRemove(labelItem.id)}
          style={{ 
            marginTop: '20px',
          }}
          disabled={disabled}
        >
          삭제
        </button>
      </div>
    </div>
  );
};

// SortableCategoryItem 컴포넌트
const SortableCategoryItem = ({ item, onEdit, onDelete }) => {
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
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`admin-leadership-item ${isDragging ? 'dragging' : ''}`}
    >
      <div className="admin-leadership-item-content">
        <div 
          {...attributes}
          {...listeners}
          className="admin-leadership-item-drag-handle"
          style={{ cursor: 'grab', padding: '5px', marginRight: '5px' }}
        >
          ⠿
        </div>
        <div className="admin-leadership-item-info">
          <div className="admin-leadership-item-name" style={{marginBottom: '0px'}}>
            {item.label}
          </div>
        </div>
        <div className="admin-leadership-item-actions">
          <button
            type="button"
            className="admin-button admin-button-secondary"
            onClick={() => onEdit(item)}
          >
            수정
          </button>
          <button
            type="button"
            className="admin-button"
            onClick={() => onDelete(item.id)}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

const PortfolioManager = () => {
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('office');
  const [operationalStatus, setOperationalStatus] = useState({
    ko: '',
    en: ''
  });
  const [updateDate, setUpdateDate] = useState({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString().padStart(2, '0')
  });
  const [totalAmount, setTotalAmount] = useState({
    ko: '',
    en: ''
  });
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [portfolioInfoModalOpen, setPortfolioInfoModalOpen] = useState(false);
  const [categories, setCategories] = useState([
    { id: 'office', label: 'Office', order: 0 },
    { id: 'logistics', label: 'Logistics', order: 1 },
    { id: 'residence', label: 'Residence', order: 2 },
    { id: 'hotel', label: 'Hotel', order: 3 },
    { id: 'others', label: 'Others', order: 4 }
  ]);
  const [portfolioLabels, setPortfolioLabels] = useState([
    { id: 'location', label: 'Location' },
    { id: 'gfa', label: 'GFA' },
    { id: 'floor', label: 'Floor' }
  ]);

  // DnD 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadPortfolioData();
    loadOperationalStatus();
    loadTotalAmount();
    loadCategories();
    loadPortfolioLabels();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
  
      const result = await dataService.getPortfolioData();
      
      if (result.success) {
        setPortfolioData(result.data);
      } else {
        setPortfolioData([]);
      }
    } catch (error) {
      // // console.error('Portfolio 데이터 로딩 오류:', error);
      setPortfolioData([]);
    } finally {
      setLoading(false);
    }
  };

  // 운용현황 데이터 로드
  const loadOperationalStatus = async () => {
    try {
      const result = await dataService.getDocument('portfolio', 'operational-status');
      if (result.success) {
        setOperationalStatus({
          ko: result.data.ko || '',
          en: result.data.en || ''
        });
        // 날짜 데이터도 로드
        if (result.data.updateDate) {
          setUpdateDate({
            year: result.data.updateDate.year || new Date().getFullYear().toString(),
            month: result.data.updateDate.month || (new Date().getMonth() + 1).toString().padStart(2, '0')
          });
        }
      }
    } catch (error) {
      // // console.error('운용현황 데이터 로딩 오류:', error);
    }
  };

  // 총 운용금액 데이터 로드
  const loadTotalAmount = async () => {
    try {
      const result = await dataService.getDocument('portfolio', 'total-amount');
      if (result.success) {
        setTotalAmount({
          ko: result.data.ko || '',
          en: result.data.en || ''
        });
      }
    } catch (error) {
      // // console.error('총 운용금액 데이터 로딩 오류:', error);
    }
  };

  // 카테고리 데이터 로드
  const loadCategories = async () => {
    try {
      const result = await dataService.getDocument('portfolio', 'categories');
      if (result.success && result.data.categories) {
        // order 필드로 정렬
        const sortedCategories = result.data.categories.sort((a, b) => {
          const orderA = a.order !== undefined ? a.order : 999;
          const orderB = b.order !== undefined ? b.order : 999;
          return orderA - orderB;
        });
        setCategories(sortedCategories);
      }
    } catch (error) {
      // // console.error('카테고리 데이터 로딩 오류:', error);
      // 기본 카테고리 사용
    }
  };

  // 포트폴리오 라벨 데이터 로드
  const loadPortfolioLabels = async () => {
    try {
      const result = await dataService.getDocument('portfolio', 'labels');
      if (result.success && result.data && result.data.labels) {
        setPortfolioLabels(result.data.labels);
      }
    } catch (error) {
      // // console.error('포트폴리오 라벨 데이터 로딩 오류:', error);
      // 기본 라벨 사용
    }
  };

  const handleAddPortfolio = () => {
    setEditingPortfolio(null);
    setModalOpen(true);
  };

  const handleEditPortfolio = (portfolio) => {
    setEditingPortfolio(portfolio);
    setModalOpen(true);
  };

  const handleDeletePortfolio = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await dataService.deletePortfolioItem(id);
        await loadPortfolioData();
        alert('삭제되었습니다!');
      } catch (error) {
        // // console.error('삭제 오류:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  // 카테고리 관리 함수들
  const handleAddCategory = async () => {
    setEditingCategory(null);
    // 모달을 열기 전에 최신 카테고리 데이터 로드
    await loadCategories();
    setCategoryModalOpen(true);
  };



  const handleDeleteCategory = async (categoryId) => {
    // 해당 카테고리에 포트폴리오가 있는지 확인
    const hasPortfolios = portfolioData.some(item => item.category === categoryId);
    if (hasPortfolios) {
      alert('이 카테고리에 포트폴리오가 있어서 삭제할 수 없습니다.');
      return;
    }

    if (window.confirm('정말로 이 카테고리를 삭제하시겠습니까?')) {
      try {
        const updatedCategories = categories.filter(cat => cat.id !== categoryId);
        setCategories(updatedCategories);
        // Firebase에 카테고리 목록 저장
        await dataService.setDocument('portfolio', 'categories', { categories: updatedCategories });
        alert('카테고리가 삭제되었습니다.');
      } catch (error) {
        // // console.error('카테고리 삭제 오류:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleCategoryModalSave = async (categoryData) => {
    try {
      if (editingCategory) {
        // 수정
        const updatedCategories = categories.map(cat => 
          cat.id === editingCategory.id ? { ...cat, ...categoryData } : cat
        );
        setCategories(updatedCategories);
        await dataService.setDocument('portfolio', 'categories', { categories: updatedCategories });
        alert('카테고리가 수정되었습니다.');
      } else {
        // 추가
        const newCategory = {
          ...categoryData,
          id: Date.now().toString(), // 임시 ID 생성
          order: categories.length // 마지막 순서로 추가
        };
        const updatedCategories = [...categories, newCategory];
        setCategories(updatedCategories);
        await dataService.setDocument('portfolio', 'categories', { categories: updatedCategories });
        alert('카테고리가 추가되었습니다.');
      }
      // 저장 후 카테고리 목록 다시 로드
      await loadCategories();
      setEditingCategory(null);
      // 입력 필드 초기화
      document.getElementById('category-label').value = '';
    } catch (error) {
      // // console.error('카테고리 저장 오류:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleCategoryModalClose = () => {
    setCategoryModalOpen(false);
    setEditingCategory(null);
  };

  // 카테고리 드래그 앤 드롭 핸들러
  const handleCategoryDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = categories.findIndex(item => item.id === active.id);
      const newIndex = categories.findIndex(item => item.id === over.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);

      // 순서 업데이트
      const updatedCategories = newCategories.map((item, index) => ({
        ...item,
        order: index
      }));

      setCategories(updatedCategories);

      // Firebase에 순서 저장
      try {
        await dataService.setDocument('portfolio', 'categories', { categories: updatedCategories });
      } catch (error) {
        // // console.error('카테고리 순서 저장 오류:', error);
        // 에러 발생 시 원래 데이터로 복원
        await loadCategories();
      }
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = portfolioData.findIndex(item => item.id === active.id);
      const newIndex = portfolioData.findIndex(item => item.id === over.id);

      const newPortfolioData = arrayMove(portfolioData, oldIndex, newIndex);

      // 순서 업데이트
      const updatedData = newPortfolioData.map((item, index) => ({
        ...item,
        order: index
      }));

      setPortfolioData(updatedData);

      // Firebase에 순서 저장
      try {
        for (let i = 0; i < updatedData.length; i++) {
          await dataService.updatePortfolioItem(updatedData[i].id, { order: i });
        }
        // 데이터를 다시 로드하여 최신 상태 확인
        await loadPortfolioData();
      } catch (error) {
        // // console.error('순서 저장 오류:', error);
        // 에러 발생 시 원래 데이터로 복원
        await loadPortfolioData();
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingPortfolio(null);
  };

  const handleModalSave = async (portfolioData) => {
    try {
      if (editingPortfolio) {
        await dataService.updatePortfolioItem(editingPortfolio.id, portfolioData);
        alert('포트폴리오가 수정되었습니다.');
      } else {
        await dataService.addPortfolioItem(portfolioData);
        alert('포트폴리오가 추가되었습니다.');
      }
      await loadPortfolioData();
      handleModalClose();
    } catch (error) {
      // // console.error('저장 오류:', error);
      alert('저장에 실패했습니다.');
    }
  };

  // 필터링된 데이터
  const filteredData = portfolioData.filter(item => {
    return item.category === selectedCategory;
  });

  // 운용현황 저장
  const handleOperationalStatusSave = async () => {
    try {
      await dataService.setDocument('portfolio', 'operational-status', {
        ...operationalStatus,
        updateDate: updateDate
      });
      alert('운용현황이 저장되었습니다.');
    } catch (error) {
      // // console.error('운용현황 저장 오류:', error);
      alert('운용현황 저장에 실패했습니다.');
    }
  };

  // 포트폴리오 라벨 저장
  const handlePortfolioLabelsSave = async () => {
    try {
      await dataService.setDocument('portfolio', 'labels', { labels: portfolioLabels });
      alert('라벨이 저장되었습니다.');
      setPortfolioInfoModalOpen(false);
    } catch (error) {
      // // console.error('라벨 저장 오류:', error);
      alert('라벨 저장에 실패했습니다.');
    }
  };

  // 라벨 추가
  const handleAddLabel = () => {
    const newLabel = {
      id: `label_${Date.now()}`,
      label: ''
    };
    setPortfolioLabels([...portfolioLabels, newLabel]);
  };

  // 라벨 삭제
  const handleRemoveLabel = (labelId) => {
    if (portfolioLabels.length <= 1) {
      alert('최소 1개의 라벨은 있어야 합니다.');
      return;
    }
    setPortfolioLabels(portfolioLabels.filter(label => label.id !== labelId));
  };

  // 라벨 수정
  const handleUpdateLabel = (labelId, newValue) => {
    setPortfolioLabels(portfolioLabels.map(label => 
      label.id === labelId ? { ...label, label: newValue } : label
    ));
  };

  // 라벨 드래그 앤 드롭 핸들러
  const handleLabelDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = portfolioLabels.findIndex(item => item.id === active.id);
      const newIndex = portfolioLabels.findIndex(item => item.id === over.id);

      const newLabels = arrayMove(portfolioLabels, oldIndex, newIndex);
      setPortfolioLabels(newLabels);
    }
  };



  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-content-wrapper">
          <div className="admin-content">
            <h2 className="admin-page-title">Portfolio 관리</h2>
            <div className="admin-content-layout">
              <div className="admin-content-main">
                <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
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
          <h2 className="admin-page-title">Portfolio 관리</h2>
          
                  <div className="admin-content-layout">
                                  <div className="admin-content-main">
              {/* 운용현황 관리 섹션 */}
              <div className="admin-content-header">
                <h3>운용현황 관리</h3>
                <button
                  type="button"
                  className="admin-button"
                  onClick={handleOperationalStatusSave}
                >
                  저장
                </button>
              </div>
              
                        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>국문</label>
            <input
              type="text"
              className="admin-input"
              value={operationalStatus.ko}
              onChange={(e) => setOperationalStatus({...operationalStatus, ko: e.target.value})}
              placeholder="국문 운용현황을 입력하세요"
            />
          </div>
          
          <div className="admin-form-group">
            <label>영문</label>
            <input
              type="text"
              className="admin-input"
              value={operationalStatus.en}
              onChange={(e) => setOperationalStatus({...operationalStatus, en: e.target.value})}
              placeholder="영문 운용현황을 입력하세요"
            />
                              </div>
                              
                              <div className="admin-form-group" style={{ marginBottom: '0' }}>
            <label>업데이트 연도</label>
            <input
              type="number"
              className="admin-input"
              value={updateDate.year}
              onChange={(e) => setUpdateDate({...updateDate, year: e.target.value})}
              placeholder="2025"
              min="2000"
              max="2100"
            />
          </div>
          
          <div className="admin-form-group" style={{ marginBottom: '0' }}>
            <label>업데이트 월</label>
            <select
              className="admin-select"
              value={updateDate.month}
              onChange={(e) => setUpdateDate({...updateDate, month: e.target.value})}
            >
              <option value="01">1월</option>
              <option value="02">2월</option>
              <option value="03">3월</option>
              <option value="04">4월</option>
              <option value="05">5월</option>
              <option value="06">6월</option>
              <option value="07">7월</option>
              <option value="08">8월</option>
              <option value="09">9월</option>
              <option value="10">10월</option>
              <option value="11">11월</option>
              <option value="12">12월</option>
            </select>
          </div>
        </div>
        
            </div>
            <div className="admin-content-main">
              {/* Portfolio 관리 섹션 */}
              <div className="admin-content-header">
                <h3>Portfolio 관리</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="admin-select"
                    style={{ marginRight: '10px', width: '180px' }}
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={() => setPortfolioInfoModalOpen(true)}
                  >
                    포트폴리오 정보 관리
                  </button>

                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={handleAddCategory}
                  >
                    카테고리 관리
                  </button>
                  <button
                    type="button"
                    className="admin-button"
                    onClick={handleAddPortfolio}
                  >
                    추가
                  </button>
                </div>
              </div>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredData.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="admin-content-list" style={{ height: 'calc(100vh - 490px)' }}>
                    {filteredData.map((item) => (
                      <SortablePortfolioItem
                        key={item.id}
                        item={item}
                        onEdit={handleEditPortfolio}
                        onDelete={handleDeletePortfolio}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>


          </div>
        </div>
      </div>

      <PortfolioModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        portfolio={editingPortfolio}
        categories={categories}
      />

      {/* 카테고리 관리 모달 */}
      {categoryModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content" style={{ maxWidth: '800px', maxHeight: '80vh' }}>
            <div className="admin-modal-header">
              <h3>카테고리 관리</h3>
              <div className="admin-button-group">
                <button
                  type="button"
                  className="admin-button admin-button-secondary"
                  onClick={handleCategoryModalClose}
                >
                  닫기
                </button>
              </div>
            </div>
            
            <div className="admin-modal-body">
              {/* 새 카테고리 추가 폼 */}
              <div className="admin-form-section">
                <h4>{editingCategory ? '카테고리 수정' : '새 카테고리 추가'}</h4>
                <div className="admin-form-row" style={{alignItems: 'center'}}>
                  <div className="admin-form-group" style={{ marginBottom: '0' }}>
                    <input
                      type="text"
                      id="category-label"
                      className="admin-input"
                      defaultValue={editingCategory?.label || ''}
                      placeholder="카테고리명을 입력하세요"
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: '0', display: 'flex',flexDirection: 'row', gap: '10px', alignItems: 'start'}}>
                    <button
                      type="button"
                      className="admin-button"
                      onClick={() => {
                        const formData = {
                          label: document.getElementById('category-label').value
                        };
                        if (!formData.label) {
                          alert('카테고리 명칭을 입력해주세요.');
                          return;
                        }
                        handleCategoryModalSave(formData);
                      }}
                    >
                      {editingCategory ? '수정' : '추가'}
                    </button>
                    {editingCategory && (
                      <button
                        type="button"
                                              className="admin-button admin-button-secondary"
                                              style={{background: 'rgb(225, 225, 225)'}}
                        onClick={() => {
                          setEditingCategory(null);
                          document.getElementById('category-label').value = '';
                        }}
                      >
                        새로 추가
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 기존 카테고리 목록 */}
              <div className="admin-form-section">
                <h4>기존 카테고리 목록 (드래그하여 순서 변경)</h4>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleCategoryDragEnd}
                >
                  <SortableContext
                    items={categories.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="admin-content-list">
                      {categories.map((category) => (
                        <SortableCategoryItem
                          key={category.id}
                          item={category}
                          onEdit={(category) => {
                            setEditingCategory(category);
                            document.getElementById('category-label').value = category.label;
                          }}
                          onDelete={handleDeleteCategory}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 포트폴리오 정보 관리 모달 */}
      {portfolioInfoModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content" style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h3>포트폴리오 정보 관리</h3>
              <div className="admin-button-group">
                <button
                  type="button"
                  className="admin-button admin-button-secondary"
                  onClick={() => setPortfolioInfoModalOpen(false)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="admin-button"
                  onClick={handlePortfolioLabelsSave}
                >
                  저장
                </button>
              </div>
            </div>
            
            <div className="admin-modal-body">
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
                <button
                  type="button"
                  className="admin-button"
                  onClick={handleAddLabel}
                >
                  + 라벨 추가
                </button>
              </div>

              <div className="admin-form-section">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleLabelDragEnd}
                >
                  <SortableContext
                    items={portfolioLabels.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {portfolioLabels.map((labelItem, index) => (
                      <SortableLabelItem
                        key={labelItem.id}
                        labelItem={labelItem}
                        index={index}
                        onUpdate={handleUpdateLabel}
                        onRemove={handleRemoveLabel}
                        disabled={portfolioLabels.length <= 1}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PortfolioManager;
