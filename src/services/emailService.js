// 이메일 서비스 - Firebase Functions 사용 (보안을 위해 서버사이드 처리)
import { db } from '../admin/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// API 엔드포인트 설정
const EMAIL_API_ENDPOINT = 'https://fbba34ab.desker-email-api.pages.dev/api/send-email';

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
    
    // API 호출
    const requestBody = template 
      ? {
          to: recipientEmail,
          template: template,
          testData: templateData
        }
      : {
          type: 'confirmation',
          surveyData: surveyData
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
};

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