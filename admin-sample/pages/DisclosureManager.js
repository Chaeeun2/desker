import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { dataService } from '../services/dataService';
import { imageService } from '../services/imageService';
import AdminLayout from '../components/AdminLayout';

// TinyMCE 리치텍스트 에디터 컴포넌트
function RichEditor({ content, setContent }) {
  const apiKey = process.env.REACT_APP_TINYMCE_API_KEY || 'no-api-key';

  return (
    <Editor
      apiKey={apiKey}
      value={content}
      init={{
        height: 400,
        menubar: false,
        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
        content_style: `
          body { 
            font-family: 'Pretendard', sans-serif; 
            font-size: 16px; 
            line-height: 1.6; 
            margin: 0; 
            padding: 20px; 
          }
          p { 
            margin: 0 0 8px 0; 
            padding: 0; 
            line-height: 1.6; 
          }
          p:last-child { 
            margin-bottom: 0; 
          }
          h1, h2, h3, h4, h5, h6 { 
            margin: 15px 0 10px 0; 
            padding: 0; 
            line-height: 1.3; 
          }
          ul, ol { 
            margin: 10px 0; 
            padding-left: 20px; 
          }
          li { 
            margin: 3px 0; 
            line-height: 1.4; 
          }
        `,
        lineheight_formats: '1 1.2 1.4 1.6 1.8 2',
        default_line_height: '1.4'
      }}
      onEditorChange={(newValue) => setContent(newValue)}
    />
  );
}

// 공시 모달 컴포넌트
function DisclosureModal({ isOpen, onClose, disclosure, onSave, loading }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);

  useEffect(() => {
    if (disclosure) {
      // 수정 모드
      setTitle(disclosure.title || '');
      setContent(disclosure.content || '');
      setImages(disclosure.images || []);
      setFiles(disclosure.files || []);
    } else {
      // 새 공시 모드
      setTitle('');
      setContent('');
      setImages([]);
      setFiles([]);
    }
  }, [disclosure, isOpen]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      // 실제 이미지 업로드
      for (const file of files) {

        const result = await imageService.uploadImage(file, { source: 'disclosure' });
        if (result.success) {
          setImages(prev => [...prev, {
            url: result.imageUrl,
            name: file.name,
            size: file.size,
            imageId: result.imageId
          }]);
        } else {
          // console.error('이미지 업로드 실패:', result.error);
          alert(`이미지 업로드 실패: ${result.error}`);
        }
      }
    } catch (error) {
      // console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setFileUploading(true);
    try {
      // 실제 파일 업로드
      for (const file of files) {

        const result = await imageService.uploadFile(file, { source: 'disclosure' });
        if (result.success) {
          setFiles(prev => [...prev, {
            url: result.fileUrl,
            name: file.name,
            size: file.size,
            fileId: result.fileId
          }]);
        } else {
          // console.error('파일 업로드 실패:', result.error);
          alert(`파일 업로드 실패: ${result.error}`);
        }
      }
    } catch (error) {
      // console.error('파일 업로드 오류:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setFileUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    // undefined 값 필터링 함수
    const filterUndefined = (obj) => {
      const filtered = {};
      Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined && obj[key] !== null) {
          filtered[key] = obj[key];
        }
      });
      return filtered;
    };

    const disclosureData = {
      title: title.trim(),
      content: content.trim(),
      images: images.length > 0 ? images.map(img => filterUndefined({
        url: img.url,
        name: img.name,
        size: img.size,
        imageId: img.imageId
      })) : [],
      files: files.length > 0 ? files.map(file => filterUndefined({
        name: file.name,
        size: file.size,
        url: file.url,
        fileId: file.fileId
      })) : []
    };

    // 최종 데이터에서 undefined 값 제거
    const cleanDisclosureData = filterUndefined(disclosureData);
    
    

    await onSave(cleanDisclosureData);
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content admin-modal-large" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{disclosure ? '공시 수정' : '새 공시 추가'}</h3>
          <div className="admin-button-group">
            <button
              type="button"
              className="admin-button admin-button-secondary"
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="submit"
              className="admin-button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? '저장 중...' : (disclosure ? '수정' : '추가')}
            </button>
          </div>
        </div>
        
        <div className="admin-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label className="admin-label">제목</label>
              <input
                type="text"
                className="admin-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="공시 제목을 입력하세요"
                required
              />
            </div>
            
            <div className="admin-form-group">
              <label className="admin-label">내용</label>
              <RichEditor content={content} setContent={setContent} />
            </div>
            
            {/* 이미지 업로드 */}
            <div className="admin-form-group">
              <label>이미지</label>
              <div className="admin-upload-button-container">
                <input
                  type="file"
                  id="disclosure-images"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleImageUpload}
                  disabled={loading || uploading}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('disclosure-images').click()}
                  className="admin-button admin-button-secondary"
                  disabled={loading || uploading}
                >
                  {uploading ? '업로드 중...' : '이미지 추가'}
                </button>
                <small className="admin-form-help-text" style={{paddingTop: '0px', marginBottom: '10px', lineHeight: '1.6' }}>
                  지원 형식: JPG, PNG, GIF, WebP ㅣ 최대 크기: 2MB ㅣ <a href="https://www.adobe.com/kr/express/feature/image/resize/jpg" target="_blank" rel="noopener noreferrer" style={{color: '#666', textDecoration: 'underline'}}>이미지 용량 줄이기 →</a>
                </small>
              </div>

              {/* 업로드된 이미지 미리보기 */}
              {images.length > 0 && (
                <div className="admin-image-grid">
                  <div className="admin-image-grid-display">
                    {images.map((image, index) => (
                      <div key={index} className="admin-image-item">
                        <img src={image.url} alt={`이미지 ${index + 1}`} />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="admin-image-remove"
                          disabled={loading}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 첨부파일 업로드 */}
            <div className="admin-form-group">
              <label>첨부파일 (최대 5개)</label>
              <div className="admin-upload-button-container">
                <input
                  type="file"
                  id="disclosure-files"
                  accept=".gif,.jpg,.jpeg,.png,.webp,.pdf,.hwp,.docx,.doc,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                  multiple
                  onChange={handleFileUpload}
                  disabled={loading || fileUploading || files.length >= 5}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('disclosure-files').click()}
                  className="admin-button admin-button-secondary"
                  disabled={loading || fileUploading || files.length >= 5}
                >
                  {fileUploading ? '업로드 중...' : '파일 추가'}
                </button>
              </div>

              {/* 업로드된 파일 목록 */}
              {files.length > 0 && (
                <div className="admin-file-list">
                  {files.map((file, index) => (
                    <div key={index} className="admin-file-item">
                      <div className="admin-file-info">
                        <span className="admin-file-name">
                          {imageService.getOriginalFileName(file.name)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="admin-button"
                        disabled={loading}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const DisclosureManager = () => {
  const [disclosureList, setDisclosureList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDisclosure, setEditingDisclosure] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    loadDisclosure();
  }, []);

  const loadDisclosure = async () => {
    try {
      setLoading(true);
      const result = await dataService.getAllDocuments('disclosure', 'createdAt', 'desc');
      if (result.success) {
        setDisclosureList(result.data);
      } else {
        setDisclosureList([]);
      }
    } catch (error) {
      // console.error('공시 로딩 실패:', error);
      setDisclosureList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (disclosureData) => {
    try {
      setSaveLoading(true);
      
      if (editingDisclosure) {
        // 수정
        await dataService.updateDocument('disclosure', editingDisclosure.id, disclosureData);
        alert('공시가 수정되었습니다.');
      } else {
        // 새 공시 추가
        await dataService.addDocument('disclosure', {
          ...disclosureData,
          createdAt: new Date()
        });
        alert('공시가 추가되었습니다.');
      }
      
      setModalOpen(false);
      setEditingDisclosure(null);
      await loadDisclosure();
    } catch (error) {
      // console.error('공시 저장 실패:', error);
      alert('공시 저장에 실패했습니다.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEdit = (disclosure) => {
    setEditingDisclosure(disclosure);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await dataService.deleteDocument('disclosure', id);
      alert('공시가 삭제되었습니다.');
      await loadDisclosure();
    } catch (error) {
      // console.error('공시 삭제 실패:', error);
      alert('공시 삭제에 실패했습니다.');
    }
  };

  const handleNewDisclosure = () => {
    setEditingDisclosure(null);
    setModalOpen(true);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    let date;
    if (timestamp?.toDate) {
      date = timestamp.toDate(); // Firestore Timestamp
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-content-wrapper">
          <div className="admin-content">
            <h2 className="admin-page-title">공시 관리</h2>
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
          <h2 className="admin-page-title">공시 관리</h2>
          
          <div className="admin-content-layout">
            <div className="admin-content-main">
              <div className="admin-content-header">
                <h3>공시 관리</h3>
                <button
                  type="button"
                  className="admin-button"
                  onClick={handleNewDisclosure}
                >
                  새 공시 추가
                </button>
              </div>
              
              <div className="admin-content-list" style={{ height: 'calc(100vh - 300px)' }}>
                {disclosureList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    등록된 공시가 없습니다.
                  </div>
                ) : (
                  disclosureList.map((disclosure) => (
                    <div key={disclosure.id} className="admin-news-item">
                      <div className="admin-news-item-content">
                        <div className="admin-news-item-info">
                          <div className="admin-news-item-title">
                            {disclosure.title}
                          </div>
                          <div className="admin-news-item-date">
                            {formatDate(disclosure.createdAt)}
                          </div>
                        </div>
                        <div className="admin-news-item-actions">
                          <button
                            type="button"
                            className="admin-button"
                            onClick={() => handleEdit(disclosure)}
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            className="admin-button admin-button-secondary"
                            onClick={() => handleDelete(disclosure.id)}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 공시 모달 */}
      <DisclosureModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingDisclosure(null);
        }}
        disclosure={editingDisclosure}
        onSave={handleSave}
        loading={saveLoading}
      />
    </AdminLayout>
  );
};

export default DisclosureManager;
