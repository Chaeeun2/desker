// 이메일 서비스 - Firebase Functions 사용 (보안을 위해 서버사이드 처리)
import { db } from '../admin/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// API 엔드포인트 설정
const EMAIL_API_ENDPOINT = 'https://desker-email-api.pages.dev/api/send-email';
// 이메일 보안 스타일 추가 함수
const addSecurityStyles = (htmlTemplate) => {
  console.log('🔒 보안 스타일 추가 중, 템플릿 타입:', typeof htmlTemplate);
  
  // 템플릿이 문자열이 아닌 경우 처리
  if (typeof htmlTemplate !== 'string') {
    console.log('⚠️ 템플릿이 문자열이 아님, 변환 시도:', htmlTemplate);
    htmlTemplate = String(htmlTemplate);
  }
  const securityStyles = `
    <style>
      /* 텍스트 선택 방지 */
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      /* 드래그 방지 */
      * {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: auto !important;
      }
      
      /* 컨텍스트 메뉴 방지 */
      * {
        -webkit-context-menu: none !important;
        context-menu: none !important;
      }
      
      /* 이미지 드래그 방지 */
      img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }
      
      /* 링크는 클릭 가능하도록 예외 처리 */
      a {
        pointer-events: auto !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      /* 버튼 클릭 가능하도록 예외 처리 */
      button, .btn, [role="button"] {
        pointer-events: auto !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
    </style>
    
    <script>
      // JavaScript로 추가 보안 기능
      document.addEventListener('DOMContentLoaded', function() {
        // 우클릭 방지
        document.addEventListener('contextmenu', function(e) {
          e.preventDefault();
          return false;
        });
        
        // 드래그 방지
        document.addEventListener('dragstart', function(e) {
          e.preventDefault();
          return false;
        });
        
        // 선택 방지
        document.addEventListener('selectstart', function(e) {
          e.preventDefault();
          return false;
        });
        
        // 키보드 단축키 방지 (Ctrl+A, Ctrl+C, Ctrl+V 등)
        document.addEventListener('keydown', function(e) {
          if (e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 's' || e.key === 'p')) {
            e.preventDefault();
            return false;
          }
          if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
            e.preventDefault();
            return false;
          }
        });
        
        // 개발자 도구 감지 및 방지 시도
        setInterval(function() {
          if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
            console.clear();
          }
        }, 1000);
      });
    </script>
  `;
  
  // HTML 템플릿에 보안 스타일과 스크립트를 추가
  if (htmlTemplate.includes('</head>')) {
    return htmlTemplate.replace('</head>', securityStyles + '</head>');
  } else if (htmlTemplate.includes('<body')) {
    return htmlTemplate.replace('<body', securityStyles + '<body');
  } else {
    return securityStyles + htmlTemplate;
  }
};

// 이메일 발송 함수 (사용자 확인 이메일)
export const sendSurveyConfirmationEmail = async (surveyData) => {
  try {
    console.log('🚀 이메일 발송 시작:', surveyData);
    
    // 이메일 주소 확인
    const recipientEmail = surveyData.email || surveyData.emailForPrizes;
    console.log('📧 수신자 이메일:', recipientEmail);
    
    if (!recipientEmail) {
      console.log('⚠️ 이메일 주소 없음');
      return { success: true, message: 'No email to send' };
    }
    
    // Firebase에서 이메일 템플릿 가져오기
    console.log('📋 이메일 템플릿 가져오는 중...');
    let template = null;
    try {
      const docRef = doc(db, 'settings', 'emailTemplates');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const templateData = docSnap.data().confirmation;
        console.log('✅ 템플릿 가져오기 성공:', templateData ? '템플릿 존재' : '템플릿 없음');
        console.log('📝 템플릿 타입:', typeof templateData);
        console.log('📄 템플릿 내용:', templateData);
        
        // 템플릿 객체 전체를 유지 (어드민과 동일)
        template = templateData;
        console.log('📋 템플릿 객체 유지');
      } else {
        console.log('❌ 템플릿 문서가 존재하지 않음');
      }
    } catch (firebaseError) {
      console.log('🔥 Firebase 오류:', firebaseError);
      // Firebase 접근 실패 시 기본 동작으로 fallback
    }
    
    // 템플릿 데이터 준비
    const templateData = {
      fullName: surveyData.fullName || '고객',
      email: recipientEmail || '',
      phoneNumber: surveyData.phoneNumber || '',
      hasExperienced: surveyData.hasExperienced === 'yes' ? '네' : '아니오',
      goodPoints: surveyData.goodPoints || '',
      workType: surveyData.workType || '',
      // API 서버에서 예상할 수 있는 추가 필드들
      name: surveyData.fullName || '고객',
      userEmail: recipientEmail || '',
      phone: surveyData.phoneNumber || ''
    };
    
    console.log('📋 최종 템플릿 데이터:', templateData);
    
    // Firebase 템플릿이 없으면 오류 반환
    if (!template || !template.content) {
      console.log('❌ 템플릿이 없어서 이메일 발송 중단');
      return {
        success: false,
        error: 'Email template not found. Please create template in admin panel.',
        message: '이메일 템플릿이 설정되지 않았습니다. 관리자에게 문의하세요.'
      };
    }
    
    // 보안 스타일을 content에만 적용
    const secureTemplate = {
      ...template,
      content: addSecurityStyles(template.content)
    };
    
    // API 호출 (어드민 수동발송과 완전히 동일한 구조)
    const requestBody = {
      to: recipientEmail,
      template: secureTemplate,  // 객체 전체 구조 유지
      testData: templateData
    };
    
    console.log('📤 이메일 API 호출 중...', EMAIL_API_ENDPOINT);
    console.log('📋 요청 데이터:', { to: recipientEmail, templateData });
    
    const response = await fetch(EMAIL_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 API 응답 상태:', response.status);
    const result = await response.json();
    console.log('📄 API 응답 데이터:', result);
    
    if (!response.ok) {
      console.log('❌ API 호출 실패:', response.status, result.error);
      return {
        success: false,
        error: result.error || 'Email sending failed',
        message: '이메일 발송에 실패했지만 설문은 저장되었습니다.'
      };
    }
    
    console.log('✅ 이메일 발송 성공:', result.messageId);
    return {
      success: true,
      messageId: result.messageId,
      message: '이메일이 성공적으로 발송되었습니다.'
    };
    
  } catch (error) {
    console.log('💥 이메일 발송 오류:', error);
    
    // 이메일 발송 실패해도 설문 제출은 성공으로 처리
    return {
      success: false,
      error: error.message,
      message: '이메일 발송에 실패했지만 설문은 저장되었습니다.'
    };
  }
};;

// 관리자에게 알림 이메일 발송 (비활성화됨)
export const sendAdminNotificationEmail = async (surveyData) => {
  // 관리자 알림 메일 비활성화
  return { success: true, message: 'Admin notification disabled' };
};


/* 
이메일 서비스 전환 가이드:

1. Resend 사용 (현재):
   - Vercel 환경변수에 RESEND_API_KEY 설정
   - Vercel 환경변수에 ADMIN_EMAIL 설정

2. AWS SES로 전환하려면:
   - emailService_aws_backup.js 참고
   - API 라우트(/api/send-email.js)를 AWS SES로 수정
   - AWS Console에서 SES Sandbox 해제 필요
*/