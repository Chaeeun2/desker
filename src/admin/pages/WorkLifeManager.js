import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { imageService } from '../services/imageService';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import AdminLayout from '../components/AdminLayout';
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

const SortableWorkLifeCard = ({ itemKey, itemData, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: itemKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getItemDisplayName = (itemKey) => {
    switch(itemKey) {
      case 'item1': return '데스커 라운지 홍대';
      case 'item2': return '데스커 라운지 대구';
      case 'item3': return '데스커 베이스캠프';
      case 'item4': return 'differ';
      default: return itemKey;
    }
  };

  return (
    <div 
      ref={setNodeRef}
      style={{
        ...style,
        padding: '20px', 
        borderRadius: '10px',
        backgroundColor: 'white',
        cursor: 'grab'
      }}
      {...attributes}
      {...listeners}
    >
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '20px', 
          fontWeight: '700'
        }}>
          {getItemDisplayName(itemKey)}
        </h4>
      </div>

      {itemData.image && (
        <div style={{ marginBottom: '15px' }}>
          <img 
            src={itemData.image} 
            alt={itemData.title}
            style={{ 
              width: '100%', 
              height: '100%',
              aspectRatio: '1 / 1',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }} 
          />
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="btn btn-primary"
          style={{ flex: 1, pointerEvents: 'auto' }}
        >
          수정
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="btn btn-danger"
          style={{ 
            flex: 0, 
            minWidth: '60px',
            backgroundColor: '#dc3545',
            borderColor: '#dc3545',
            pointerEvents: 'auto'
          }}
        >
          삭제
        </button>
      </div>
    </div>
  );
};

const WorkLifeManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editData, setEditData] = useState({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [itemOrder, setItemOrder] = useState(['item1', 'item2', 'item3', 'item4']);
  const fileInputRefs = useRef({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [workLifeData, setWorkLifeData] = useState({
    item1: {
      title: '데스커 라운지 홍대',
      subtitle: '가치있게 일하는 사람들의 연결고리',
      description: '일을 통해 성장하는 사람들이 함께 연결되어,\n다양한 가능성을 찾아갈 수 있는 공간을 꿈꿉니다.',
      image: 'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S10-1.jpg',
      link: 'https://www.instagram.com/desker_lounge_hd/',
      buttonText: '데스커 라운지 홍대 보러가기 →',
      overlayColor: { r: 227, g: 216, b: 200 }
    },
    item2: {
      title: '데스커 라운지 대구',
      subtitle: '삶을 위한 배움의 시작과 성장을 경험하는 공간',
      description: '새로운 시작과 성장으로 이어갈 수 있는 기회를 제공합니다.',
      image: 'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S10-2.jpg',
      link: 'https://www.instagram.com/desker_lounge_dg/',
      buttonText: '데스커 라운지 대구 보러가기 →',
      overlayColor: { r: 210, g: 211, b: 218 }
    },
    item3: {
      title: '데스커 베이스캠프 with nonce',
      subtitle: '미래의 창업가를 위한 성장 베이스 캠프',
      description: '매년 150명의 창업 희망 학생을 선발해 전문가 멘토링, 기술 워크샵, 네트워크 등 다양한 프로그램을 통해 노하우를 전달하고 있습니다.',
      image: 'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S10-3.jpg',
      link: 'https://www.instagram.com/desker_basecamp_with_nonce/',
      buttonText: '데스커 베이스캠프 보러가기 →',
      overlayColor: { r: 210, g: 211, b: 218 }
    },
    item4: {
      title: 'differ',
      subtitle: '책상 앞 우리들의 성장 커뮤니티',
      description: '책상에서 시작된 가능성의 이야기를 조명하고, 그 앞에서 마주한 고민과 영감을 주고 받는 성장 커뮤니티입니다.',
      image: 'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S10-4.jpg',
      link: 'https://differ.co.kr/',
      buttonText: 'differ 보러가기 →',
      overlayColor: { r: 210, g: 211, b: 218 }
    }
  });

  useEffect(() => {
    loadWorkLifeData();
  }, []);

  const loadWorkLifeData = async () => {
    console.log('🔄 WorkLife 데이터 로드 시작');
    try {
      const docRef = doc(db, 'settings', 'workLifeSection');
      const docSnap = await getDoc(docRef);
      console.log('📊 Firebase 응답:', docSnap.exists() ? '데이터 있음' : '데이터 없음');
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('📦 로드된 WorkLife 데이터:', data);
        setWorkLifeData(data);
        
        if (data.itemOrder) {
          setItemOrder(data.itemOrder);
        }
      }
    } catch (error) {
      alert('데이터 로드 실패: ' + error.message);
    } finally {
      setLoading(false);
    }
  };



  const handleEditImageUpload = async (file) => {
    if (!file) return;

    const uploadKey = editingItem || 'new-item';
    setUploading(prev => ({ ...prev, [uploadKey]: true }));
    
    try {
      console.log('📤 이미지 업로드 시작:', file.name, '크기:', file.size);
      
      // imageService를 사용하여 업로드 (GalleryManager와 동일한 방식)
      const result = await imageService.uploadFile(file, { 
        source: 'work-life',
        prefix: 'work-life'
      });
      
      console.log('📥 업로드 결과:', result);
      
      if (!result.success) {
        console.error('❌ 업로드 실패:', result.error);
        throw new Error(result.error || 'Upload failed');
      }
      
      console.log('✅ 업로드 성공! URL:', result.fileUrl);
      
      setEditData(prev => ({
        ...prev,
        image: result.fileUrl  // result.url이 아니라 result.fileUrl 사용
      }));
      
      alert(`이미지 업로드 성공: ${file.name}`);
    } catch (error) {
      alert('이미지 업로드 실패: ' + error.message);
    } finally {
      setUploading(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  };

  const openEditModal = (itemKey) => {
    setEditingItem(itemKey);
    setEditData({ ...workLifeData[itemKey] });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setEditData({});
    setIsAddingNew(false);
  };

  const handleEditInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditColorChange = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    setEditData(prev => ({
      ...prev,
      overlayColor: { r, g, b }
    }));
  };



  const openAddModal = () => {
    setIsAddingNew(true);
    setEditingItem(null);
    setEditData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      link: '',
      buttonText: '자세히 보기',
      overlayColor: { r: 0, g: 0, b: 0 }  // 기본값을 검은색으로 설정
    });
    setModalOpen(true);
  };

  const saveEditedItem = async () => {
    setSaving(true);
    console.log('💾 저장 시작, 현재 editData:', editData);
    console.log('📸 이미지 URL:', editData.image);
    try {
      let updatedData;
      
      if (isAddingNew) {
        const existingKeys = Object.keys(workLifeData);
        const nextItemNumber = existingKeys.length + 1;
        const newItemKey = `item${nextItemNumber}`;
        
        updatedData = {
          ...workLifeData,
          [newItemKey]: editData,
          itemOrder: [...itemOrder, newItemKey]
        };
        setItemOrder(prev => [...prev, newItemKey]);
      } else {
        updatedData = {
          ...workLifeData,
          [editingItem]: editData,
          itemOrder: itemOrder
        };
      }
      
      console.log('📝 Firebase에 저장할 데이터:', updatedData);
      await setDoc(doc(db, 'settings', 'workLifeSection'), updatedData);
      console.log('✅ Firebase 저장 완료');
      
      setWorkLifeData(updatedData);
      closeModal();
      alert(isAddingNew ? '새 아이템이 추가되었습니다.' : '아이템이 성공적으로 수정되었습니다.');
    } catch (error) {
      alert('저장 실패: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (itemKey) => {
    if (!window.confirm('정말로 이 아이템을 삭제하시겠습니까?')) return;

    setSaving(true);
    try {
      const updatedData = { ...workLifeData };
      delete updatedData[itemKey];
      
      const newOrder = itemOrder.filter(key => key !== itemKey);
      updatedData.itemOrder = newOrder;
      
      await setDoc(doc(db, 'settings', 'workLifeSection'), updatedData);
      setWorkLifeData(updatedData);
      setItemOrder(newOrder);
      alert('아이템이 삭제되었습니다.');
    } catch (error) {
      alert('삭제 실패: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = async (event) => {
    const {active, over} = event;

    if (active.id !== over.id) {
      const oldIndex = itemOrder.indexOf(active.id);
      const newIndex = itemOrder.indexOf(over.id);
      const newOrder = arrayMove(itemOrder, oldIndex, newIndex);
      
      setItemOrder(newOrder);
      
      try {
        const updatedData = {
          ...workLifeData,
          itemOrder: newOrder
        };
        await setDoc(doc(db, 'settings', 'workLifeSection'), updatedData);
        setWorkLifeData(updatedData);
      } catch (error) {
        alert('순서 저장 실패: ' + error.message);
        setItemOrder(itemOrder);
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-content">
          <div className="admin-header">
            <h1>워크라이프 관리</h1>
          </div>
          <div className="survey-list">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <span>데이터 로딩 중...</span>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-content">
        <div className="admin-header">
          <h1>워크라이프 관리</h1>
          <div className="admin-actions">
            <button 
              onClick={openAddModal}
              className="btn btn-success"
            >
              추가
            </button>
          </div>
        </div>

        <div className="survey-list">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={itemOrder}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '20px',
                marginBottom: '20px'
              }}>
                {itemOrder.map((itemKey) => {
                  const itemData = workLifeData[itemKey];
                  if (!itemData) return null;
                  
                  return (
                    <SortableWorkLifeCard 
                      key={itemKey} 
                      itemKey={itemKey}
                      itemData={itemData}
                      onEdit={() => openEditModal(itemKey)}
                      onDelete={() => deleteItem(itemKey)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {modalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="worklife-modal" style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div className="admin-modal-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: 0 }}>
                  {isAddingNew ? '새 아이템 추가' : (
                    <>
                      {editingItem === 'item1' && '데스커 라운지 홍대 수정'}
                      {editingItem === 'item2' && '데스커 라운지 대구 수정'}
                      {editingItem === 'item3' && '데스커 베이스캠프 수정'}
                      {editingItem === 'item4' && 'differ 수정'}
                      {editingItem && !['item1', 'item2', 'item3', 'item4'].includes(editingItem) && `${editingItem} 수정`}
                    </>
                  )}
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={closeModal}
                    className="btn btn-secondary"
                  >
                    취소
                  </button>
                  <button 
                    onClick={saveEditedItem}
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>

              <div className="admin-form-group">
                <label>제목</label>
                <textarea
                  value={editData.title || ''}
                  onChange={(e) => handleEditInputChange('title', e.target.value)}
                  className="admin-input"
                  rows="2"
                  placeholder="아이템 제목"
                />
              </div>

              <div className="admin-form-group">
                <label>부제목</label>
                <textarea
                  value={editData.subtitle || ''}
                  onChange={(e) => handleEditInputChange('subtitle', e.target.value)}
                  className="admin-input"
                  rows="2"
                  placeholder="부제목"
                />
              </div>

              <div className="admin-form-group">
                <label>상세 설명</label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => handleEditInputChange('description', e.target.value)}
                  className="admin-input"
                  rows="4"
                  placeholder="상세 설명"
                />
              </div>

              <div className="admin-form-group">
                <label>이미지 업로드</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexDirection: 'column' }}>
                  <input
                    type="file"
                    ref={(el) => fileInputRefs.current[editingItem || 'new-item'] = el}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        console.log('🖼️ 파일 선택됨:', file.name, '타입:', file.type, '크기:', file.size);
                        handleEditImageUpload(file);
                      }
                    }}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[editingItem || 'new-item']?.click()}
                    disabled={uploading[editingItem || 'new-item']}
                    className="btn btn-secondary"
                  >
                    {uploading[editingItem || 'new-item'] ? '업로드 중...' : '이미지 선택'}
                  </button>
                  {editData.image && (
                    <div>
                      <img 
                        src={editData.image} 
                        alt="미리보기" 
                        style={{ 
                          width: '300px', 
                          height: '300px', 
                          objectFit: 'cover',
                          borderRadius: '10px',
                          border: '1px solid #dee2e6'
                        }} 
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-form-group">
                <label>링크 URL</label>
                <input
                  type="url"
                  value={editData.link || ''}
                  onChange={(e) => handleEditInputChange('link', e.target.value)}
                  className="admin-input"
                  placeholder="https://..."
                />
              </div>

              <div className="admin-form-group">
                <label>버튼 텍스트</label>
                <input
                  type="text"
                  value={editData.buttonText || ''}
                  onChange={(e) => handleEditInputChange('buttonText', e.target.value)}
                  className="admin-input"
                  placeholder="버튼에 표시될 텍스트"
                />
              </div>

              <div className="admin-form-group">
                <label>오버레이 그라디언트 색상</label>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <label style={{ fontSize: '15px', marginBottom: '8px' }}>색상 선택</label>
                    <input
                      type="color"
                      value={editData.overlayColor ? rgbToHex(editData.overlayColor.r, editData.overlayColor.g, editData.overlayColor.b) : '#000000'}
                      onChange={(e) => handleEditColorChange(e.target.value)}
                      style={{ 
                        width: '60px', 
                        height: '60px',
                        aspectRatio: '1 / 1',
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <label style={{ fontSize: '15px', marginBottom: '8px' }}>미리보기</label>
                    <div 
                      style={{ 
                        width: '100px', 
                        height: '60px', 
                        background: editData.overlayColor ? `linear-gradient(0deg, rgba(${editData.overlayColor.r}, ${editData.overlayColor.g}, ${editData.overlayColor.b}, 0) 0%, rgba(${editData.overlayColor.r}, ${editData.overlayColor.g}, ${editData.overlayColor.b}, 1) 100%)` : '#f8f9fa',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default WorkLifeManager;