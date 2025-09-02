import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { imageService } from '../services/imageService';
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

// Sortable Gallery Item 컴포넌트
const SortableGalleryItem = ({ imageUrl, index, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: imageUrl });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`gallery-item ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="gallery-image-wrapper">
        <img 
          src={imageUrl} 
          alt={`Gallery ${index + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div style={{ display: 'none', padding: '20px', textAlign: 'center', color: '#999' }}>
          이미지를 불러올 수 없습니다
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(index);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="btn btn-sm btn-danger"
        >
          삭제
        </button>
      </div>
    </div>
  );
};

const GalleryManager = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // DnD Kit 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'settings', 'gallery');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setGallery(docSnap.data().images || []);
      } else {
        // 기본 갤러리 이미지들
        const defaultImages = [
          'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-1.jpg',
          'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-2.jpg',
          'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-3.jpg',
          'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-4.jpg',
          'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-5.jpg',
          'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-6.jpg'
        ];
        setGallery(defaultImages);
        await saveGallery(defaultImages);
      }
    } catch (error) {
      alert('갤러리 로드 실패: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveGallery = async (images = gallery) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'gallery'), { images });
    } catch (error) {
      alert('저장 실패: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    try {
      setUploading(true);
      
      // R2에 이미지 업로드
      const result = await imageService.uploadFile(file, { 
        source: 'gallery',
        prefix: 'section2'
      });
      
      if (result.success) {
        const newGallery = [...gallery, result.fileUrl];
        setGallery(newGallery);
        await saveGallery(newGallery);
        alert(`${file.name} 이미지가 업로드되었습니다.`);
      } else {
        throw new Error('이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      alert('이미지 업로드 실패: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (index) => {
    if (window.confirm('이 이미지를 삭제하시겠습니까?')) {
      const newGallery = gallery.filter((_, i) => i !== index);
      setGallery(newGallery);
      await saveGallery(newGallery);
      alert('이미지가 삭제되었습니다.');
    }
  };

  const moveImage = async (fromIndex, toIndex) => {
    const newGallery = [...gallery];
    const [movedImage] = newGallery.splice(fromIndex, 1);
    newGallery.splice(toIndex, 0, movedImage);
    setGallery(newGallery);
    await saveGallery(newGallery);
  };

  // 드래그 앤 드롭 핸들러
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = gallery.findIndex(item => item === active.id);
      const newIndex = gallery.findIndex(item => item === over.id);
      
      const newGallery = arrayMove(gallery, oldIndex, newIndex);
      setGallery(newGallery);
      await saveGallery(newGallery);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-content admin-gallery-manager">
          <div className="admin-header">
            <h1>갤러리 관리</h1>
          </div>
          <div className="admin-table-container">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-content admin-gallery-manager">
        <div className="admin-header">
          <h1>갤러리 관리</h1>
          <div className="admin-actions">
            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
              {uploading ? '업로드 중...' : '이미지 추가'}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        <div className="admin-table-container">
          <p style={{ marginBottom: '20px', color: '#666', fontSize: '1.8rem' }}>
            섹션2의 슬라이드에 표시될 이미지를 관리합니다. 드래그로 순서를 변경할 수 있습니다.
          </p>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={gallery} 
              strategy={verticalListSortingStrategy}
            >
              <div className="gallery-grid">
                {gallery.map((imageUrl, index) => (
                  <SortableGalleryItem
                    key={imageUrl}
                    imageUrl={imageUrl}
                    index={index}
                    onDelete={handleDeleteImage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {gallery.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              갤러리에 이미지가 없습니다. 이미지를 추가해주세요.
            </div>
          )}
        </div>
      </div>
      

    </AdminLayout>
  );
};

export default GalleryManager;