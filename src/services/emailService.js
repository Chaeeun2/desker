// 이메일 서비스 - Firebase Functions 사용 (보안을 위해 서버사이드 처리)
import { db } from '../admin/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// API 엔드포인트 설정
const EMAIL_API_ENDPOINT = 'https://desker-email-api.pages.dev/api/send-email';
// 이메일 보안 스타일 추가 함수
const addSecurityStyles = (htmlTemplate) => {
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
    // 이메일 주소 확인
    const recipientEmail = surveyData.email || surveyData.emailForPrizes;
    if (!recipientEmail) {
      return { success: true, message: 'No email to send' };
    }
    
    // Firebase에서 이메일 템플릿 가져오기
    let template = null;
    try {
      const docRef = doc(db, 'settings', 'emailTemplates');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        template = docSnap.data().confirmation;
      }
    } catch (firebaseError) {
      // Firebase 접근 실패 시 기본 동작으로 fallback
    }
    
    // 템플릿 데이터 준비
    const templateData = {
      fullName: surveyData.fullName || '고객',
      email: recipientEmail,
      phoneNumber: surveyData.phoneNumber || '',
      hasExperienced: surveyData.hasExperienced === 'yes' ? '네' : '아니오',
      goodPoints: surveyData.goodPoints || '',
      workType: surveyData.workType || ''
    };
    
    // Firebase 템플릿이 없으면 오류 반환
    if (!template) {
      return {
        success: false,
        error: 'Email template not found. Please create template in admin panel.',
        message: '이메일 템플릿이 설정되지 않았습니다. 관리자에게 문의하세요.'
      };
    }
    
    // 보안 스타일을 이메일 템플릿에 추가
    const secureEmailTemplate = addSecurityStyles(template);
    
    // API 호출 (보안이 적용된 템플릿 사용)
    const requestBody = {
      to: recipientEmail,
      template: secureEmailTemplate,
      testData: templateData
    };
    
    const response = await fetch(EMAIL_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Email sending failed',
        message: '이메일 발송에 실패했지만 설문은 저장되었습니다.'
      };
    }
    
    return {
      success: true,
      messageId: result.messageId,
      message: '이메일이 성공적으로 발송되었습니다.'
    };
    
  } catch (error) {
    
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