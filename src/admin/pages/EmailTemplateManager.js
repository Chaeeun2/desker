import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AdminLayout from '../components/AdminLayout';

const EmailTemplateManager = () => {
  const [templates, setTemplates] = useState({
    confirmation: {
      subject: '데스커 워케이션 설문조사 참여 감사합니다 🎉',
      content: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const selectedTemplate = 'confirmation';
  const [previewMode, setPreviewMode] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('홍길동');

  // Firebase에서 템플릿 불러오기
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const docRef = doc(db, 'settings', 'emailTemplates');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setTemplates(docSnap.data());
      } else {
        // 기본 템플릿 설정
        const defaultTemplate = {
          confirmation: {
            subject: '데스커 워케이션 설문조사 참여 감사합니다 🎉',
            content: `
              <div style="font-family: 'Pretendard', -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                  <h1>🎉 데스커 워케이션 설문조사 참여 완료</h1>
                </div>
                <div style="padding: 30px;">
                  <p>안녕하세요, <strong>{{fullName}}님</strong>!</p>
                  <p>데스커 워케이션 설문조사에 참여해 주셔서 감사합니다.</p>
                  
                  <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 8px;">
                    <h2>📋 제출하신 설문 내용</h2>
                    <p>양양 워케이션 경험: {{hasExperienced}}</p>
                    {{#if goodPoints}}
                    <p>좋았던 점: {{goodPoints}}</p>
                    {{/if}}
                    {{#if workType}}
                    <p>업무 분야: {{workType}}</p>
                    {{/if}}
                  </div>
                  
                  <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 8px;">
                    <h2>🎁 경품 이벤트 안내</h2>
                    <p>추첨을 통해 다양한 경품을 드립니다!</p>
                    <ul>
                      <li>1등: 애플 에어팟 프로</li>
                      <li>2등: 스타벅스 기프티콘</li>
                      <li>3등: 편의점 상품권</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                    <p style="color: #6c757d; font-size: 14px;">
                      본 메일은 발신 전용입니다.<br>
                      문의사항은 hello@deskerworkation.com으로 연락주세요.
                    </p>
                  </div>
                </div>
              </div>
            `
          }
        };
        setTemplates(defaultTemplate);
      }
    } catch (error) {
      alert('템플릿 로드 실패: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'emailTemplates'), templates);
      alert('템플릿이 저장되었습니다.');
    } catch (error) {
      alert('저장 실패: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditorChange = (content, editor) => {
    setTemplates(prev => ({
      ...prev,
      [selectedTemplate]: {
        ...prev[selectedTemplate],
        content: content
      }
    }));
  };

  const handleSubjectChange = (e) => {
    setTemplates(prev => ({
      ...prev,
      [selectedTemplate]: {
        ...prev[selectedTemplate],
        subject: e.target.value
      }
    }));
  };

  const sendTestEmail = async () => {
    if (!testEmail || !testName) {
      alert('이름과 이메일 주소를 모두 입력해주세요.');
      return;
    }

    try {
      // 테스트 데이터
      const testData = {
        fullName: testName,
        email: testEmail,
        hasExperienced: 'yes',
        goodPoints: '조용하고 집중하기 좋았습니다.',
        workType: 'IT/개발',
        phoneNumber: '010-1234-5678'
      };

      // API 호출
      const response = await fetch('https://fbba34ab.desker-email-api.pages.dev/api/send-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: testEmail,
            template: templates[selectedTemplate],
            testData: testData
          })
        }
      );

      if (response.ok) {
        alert('수동 메일이 발송되었습니다.');
      } else {
        throw new Error('이메일 발송 실패');
      }
    } catch (error) {
      alert('수동 메일 발송 실패: ' + error.message);
    }
  };

  const renderPreview = () => {
    // 변수를 샘플 데이터로 치환
    let previewContent = templates[selectedTemplate].content;
    const sampleData = {
      fullName: '홍길동',
      hasExperienced: '네',
      goodPoints: '조용하고 집중하기 좋았습니다.',
      workType: 'IT/개발'
    };

    // 간단한 템플릿 변수 치환
    Object.keys(sampleData).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewContent = previewContent.replace(regex, sampleData[key]);
    });

    // 조건문 처리 (간단한 버전)
    const ifRegex = new RegExp('{{#if .*?}}([\\s\\S]*?){{/if}}', 'g');
    previewContent = previewContent.replace(ifRegex, '$1');

    return <div dangerouslySetInnerHTML={{ __html: previewContent }} />;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-content">
          <div className="admin-header">
            <h1>이메일 템플릿 관리</h1>
          </div>
          <div className="survey-list">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <span>템플릿 로딩 중...</span>
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
          <h1>이메일 템플릿 관리</h1>
          <div className="admin-actions">
            <button 
              onClick={() => setPreviewMode(!previewMode)}
              className="btn btn-secondary"
            >
              {previewMode ? '편집 모드' : '미리보기'}
            </button>
            <button 
              onClick={saveTemplate} 
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? '저장 중...' : '템플릿 저장'}
            </button>
          </div>
        </div>

        <div className="survey-list">
          <div className="template-editor">

            <div className="admin-form-group">
              <label>이메일 제목</label>
              <input
                type="text"
                value={templates[selectedTemplate].subject}
                onChange={handleSubjectChange}
                placeholder="이메일 제목을 입력하세요"
                className="admin-input"
                style={{ marginBottom: '20px' }}
              />
            </div>

            {previewMode ? (
              <div className="admin-form-group">
                <label>미리보기</label>
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '20px', 
                  border: '1px solid #dee2e6', 
                  borderRadius: '5px',
                  marginBottom: '20px'
                }}>
                  {renderPreview()}
                </div>
              </div>
            ) : (
              <div className="admin-form-group">
                <label>템플릿 내용</label>
                <Editor
                  apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
                  value={templates[selectedTemplate].content}
                  init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                      'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
                      'fullscreen', 'insertdatetime', 'media', 'table', 'code', 'help'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                      'bold italic forecolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | help | code',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                  }}
                  onEditorChange={handleEditorChange}
                />
                
                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '5px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: '15px' }}>사용 가능한 변수</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <code style={{ 
                      padding: '5px 10px', 
                      backgroundColor: '#fff', 
                      border: '1px solid #dee2e6', 
                      borderRadius: '3px' 
                    }}>{'{{fullName}}'}</code>
                    <code style={{ 
                      padding: '5px 10px', 
                      backgroundColor: '#fff', 
                      border: '1px solid #dee2e6', 
                      borderRadius: '3px' 
                    }}>{'{{email}}'}</code>
                    <code style={{ 
                      padding: '5px 10px', 
                      backgroundColor: '#fff', 
                      border: '1px solid #dee2e6', 
                      borderRadius: '3px' 
                    }}>{'{{phoneNumber}}'}</code>
                  </div>
                </div>
              </div>
            )}

            <div className="admin-form-group">
              <label>수동 메일 발송</label>
              <div style={{ display: 'flex', gap: '10px', maxWidth: '800px', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="이름"
                  className="admin-input"
                  style={{ flex: 1 }}
                />
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="이메일 주소"
                  className="admin-input"
                  style={{ flex: 2 }}
                />
                <button onClick={sendTestEmail} className="btn btn-primary">
                  수동 발송
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EmailTemplateManager;