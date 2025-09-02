import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// AWS SES 설정
const AWS_ACCESS_KEY = process.env.REACT_APP_AWS_ACCESS_KEY_ID;
const AWS_SECRET_KEY = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.REACT_APP_AWS_REGION || 'ap-northeast-2';

  hasAccessKey: !!AWS_ACCESS_KEY,
  hasSecretKey: !!AWS_SECRET_KEY,
  region: AWS_REGION,
  accessKeyLength: AWS_ACCESS_KEY?.length,
  secretKeyLength: AWS_SECRET_KEY?.length
});

const SES_CONFIG = {
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  }
};

const sesClient = new SESClient(SES_CONFIG);

// 이메일 템플릿 생성 함수
const createEmailTemplate = (surveyData) => {
  const hasExperiencedText = surveyData.hasExperienced === 'yes' ? '네' : '아니오';
  
  // HTML 이메일 템플릿
  const htmlBody = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
        }
        .section {
          margin-bottom: 25px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        .section h2 {
          color: #667eea;
          font-size: 18px;
          margin-top: 0;
          margin-bottom: 15px;
        }
        .info-row {
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          color: #666;
          display: inline-block;
          min-width: 120px;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .photo-link {
          color: #667eea;
          word-break: break-all;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 데스커 워케이션 설문조사 참여 완료</h1>
        </div>
        
        <div class="content">
          <p>안녕하세요, <strong>${surveyData.fullName || '고객'}님</strong>!</p>
          <p>데스커 워케이션 설문조사에 참여해 주셔서 진심으로 감사드립니다. 소중한 의견은 더 나은 워케이션 서비스를 만드는 데 큰 도움이 됩니다.</p>
          
          <div class="section">
            <h2>📋 제출하신 설문 내용</h2>
            
            <div class="info-row">
              <span class="info-label">양양 워케이션 경험:</span> ${hasExperiencedText}
            </div>
            
            ${surveyData.goodPoints ? `
            <div class="info-row">
              <span class="info-label">좋았던 점:</span><br>
              ${surveyData.goodPoints}
            </div>
            ` : ''}
            
            ${surveyData.photoUrl && !surveyData.photoUrl.startsWith('data:') ? `
            <div class="info-row">
              <span class="info-label">제출하신 사진:</span><br>
              <a href="${surveyData.photoUrl}" class="photo-link" target="_blank">사진 보기</a>
            </div>
            ` : ''}
            
            ${surveyData.siteDiscovery && surveyData.siteDiscovery.length > 0 ? `
            <div class="info-row">
              <span class="info-label">사이트 발견 경로:</span> ${Array.isArray(surveyData.siteDiscovery) ? surveyData.siteDiscovery.join(', ') : surveyData.siteDiscovery}
            </div>
            ` : ''}
            
            ${surveyData.visitPurpose && surveyData.visitPurpose.length > 0 ? `
            <div class="info-row">
              <span class="info-label">방문 목적:</span> ${Array.isArray(surveyData.visitPurpose) ? surveyData.visitPurpose.join(', ') : surveyData.visitPurpose}
            </div>
            ` : ''}
            
            ${surveyData.workType ? `
            <div class="info-row">
              <span class="info-label">업무 분야:</span> ${surveyData.workType}
            </div>
            ` : ''}
          </div>
          
          <div class="section">
            <h2>🎁 경품 이벤트 안내</h2>
            <p>설문에 참여해 주신 분들 중 추첨을 통해 다음과 같은 경품을 드립니다:</p>
            <ul>
              <li>데스커 워케이션 키트 (사진 제출자)</li>
              <li>데스커 굿즈 패키지</li>
              <li>워케이션 할인 쿠폰</li>
            </ul>
            <p>당첨자 발표는 별도로 연락드리겠습니다.</p>
          </div>
          
          <div style="text-align: center;">
            <a href="https://deskerworkation.com" class="button">데스커 워케이션 더 알아보기</a>
          </div>
        </div>
        
        <div class="footer">
          <p>이 메일은 발신 전용입니다. 문의사항이 있으시면 contact@deskerworkation.com으로 연락 주세요.</p>
          <p>© 2025 Desker Workation. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // 텍스트 이메일 템플릿 (HTML을 지원하지 않는 클라이언트용)
  const textBody = `
데스커 워케이션 설문조사 참여 완료

안녕하세요, ${surveyData.fullName || '고객'}님!

데스커 워케이션 설문조사에 참여해 주셔서 진심으로 감사드립니다.
소중한 의견은 더 나은 워케이션 서비스를 만드는 데 큰 도움이 됩니다.

[제출하신 설문 내용]
- 양양 워케이션 경험: ${hasExperiencedText}
${surveyData.goodPoints ? `- 좋았던 점: ${surveyData.goodPoints}` : ''}
${surveyData.photoUrl && !surveyData.photoUrl.startsWith('data:') ? `- 제출하신 사진: ${surveyData.photoUrl}` : ''}
${surveyData.workType ? `- 업무 분야: ${surveyData.workType}` : ''}

[경품 이벤트 안내]
설문에 참여해 주신 분들 중 추첨을 통해 다음과 같은 경품을 드립니다:
- 데스커 워케이션 키트 (사진 제출자)
- 데스커 굿즈 패키지
- 워케이션 할인 쿠폰

당첨자 발표는 별도로 연락드리겠습니다.

데스커 워케이션 더 알아보기: https://deskerworkation.com

문의사항: contact@deskerworkation.com
© 2025 Desker Workation. All rights reserved.
  `;
  
  return { htmlBody, textBody };
};

// 이메일 발송 함수
export const sendSurveyConfirmationEmail = async (surveyData) => {
  try {
    // AWS 자격 증명 확인
    if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY) {
      return { 
        success: false, 
        error: 'Email service not configured',
        message: '이메일 서비스가 설정되지 않았습니다.'
      };
    }
    
    // 이메일 주소 확인
    const recipientEmail = surveyData.email || surveyData.emailForPrizes;
    if (!recipientEmail) {
      return { success: true, message: 'No email to send' };
    }
    
    // 이메일 템플릿 생성
    const { htmlBody, textBody } = createEmailTemplate(surveyData);
    
    // SES 이메일 파라미터 설정
    const params = {
      Source: process.env.REACT_APP_SENDER_EMAIL || process.env.SENDER_EMAIL || 'noreply@deskerworkation.com',
      Destination: {
        ToAddresses: [recipientEmail]
        // BCC 임시 제거 - AWS SES 권한 문제 해결 후 다시 추가
      },
      Message: {
        Subject: {
          Data: '데스커 워케이션 설문조사 참여 감사합니다 🎉',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8'
          },
          Text: {
            Data: textBody,
            Charset: 'UTF-8'
          }
        }
      }
    };
    
    // 이메일 발송
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    
    return {
      success: true,
      messageId: response.MessageId,
      message: '이메일이 성공적으로 발송되었습니다.'
    };
    
  } catch (error) {
    
    // 권한 오류 처리
    if (error.name === 'AccessDenied' || error.message?.includes('not authorized')) {
      return {
        success: false,
        error: 'Email service permission error',
        message: '이메일 서비스 권한 오류입니다. 설문은 정상적으로 저장되었습니다.'
      };
    }
    
    // 이메일 발송 실패해도 설문 제출은 성공으로 처리
    return {
      success: false,
      error: error.message,
      message: '이메일 발송에 실패했지만 설문은 저장되었습니다.'
    };
  }
};

// 관리자에게 알림 이메일 발송
export const sendAdminNotificationEmail = async (surveyData) => {
  try {
    // AWS 자격 증명 확인
    if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY) {
      return { success: false, error: 'Email service not configured' };
    }
    
    const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'contact@alolot.kr';
    
    const htmlBody = `
      <h2>새로운 설문 응답이 제출되었습니다</h2>
      <p><strong>제출자:</strong> ${surveyData.fullName}</p>
      <p><strong>이메일:</strong> ${surveyData.email || surveyData.emailForPrizes || '-'}</p>
      <p><strong>전화번호:</strong> ${surveyData.phoneNumber}</p>
      <p><strong>제출 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
      <hr>
      <p>관리자 패널에서 상세 내용을 확인하세요.</p>
    `;
    
    const params = {
      Source: process.env.REACT_APP_SENDER_EMAIL || process.env.SENDER_EMAIL || 'noreply@deskerworkation.com',
      Destination: {
        ToAddresses: [adminEmail]
      },
      Message: {
        Subject: {
          Data: `[데스커] 새 설문 응답 - ${surveyData.fullName}`,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8'
          }
        }
      }
    };
    
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};