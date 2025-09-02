// Vercel Serverless Function for sending emails
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, surveyData } = req.body;

    if (!surveyData) {
      return res.status(400).json({ error: 'Survey data is required' });
    }

    // 이메일 템플릿 생성
    const hasExperiencedText = surveyData.hasExperienced === 'yes' ? '네' : '아니오';
    
    if (type === 'confirmation') {
      // 사용자 확인 이메일
      const recipientEmail = surveyData.email || surveyData.emailForPrizes;
      if (!recipientEmail) {
        return res.status(200).json({ success: true, message: 'No email to send' });
      }

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

      const { data, error } = await resend.emails.send({
        from: process.env.SENDER_EMAIL || 'Desker Workation <onboarding@resend.dev>',
        to: [recipientEmail],
        bcc: process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL] : undefined,
        subject: '데스커 워케이션 설문조사 참여 감사합니다 🎉',
        html: htmlBody
      });

      if (error) {
        console.error('Resend error:', error);
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, messageId: data?.id });

    } else if (type === 'admin') {
      // 관리자 알림 이메일
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        return res.status(200).json({ success: false, message: 'No admin email configured' });
      }

      const htmlBody = `
        <h2>새로운 설문 응답이 제출되었습니다</h2>
        <p><strong>제출자:</strong> ${surveyData.fullName}</p>
        <p><strong>이메일:</strong> ${surveyData.email || surveyData.emailForPrizes || '-'}</p>
        <p><strong>전화번호:</strong> ${surveyData.phoneNumber}</p>
        <p><strong>제출 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
        <hr>
        <p>관리자 패널에서 상세 내용을 확인하세요.</p>
      `;

      const { data, error } = await resend.emails.send({
        from: process.env.SENDER_EMAIL || 'Desker Workation <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `[데스커] 새 설문 응답 - ${surveyData.fullName}`,
        html: htmlBody
      });

      if (error) {
        console.error('Admin notification error:', error);
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, messageId: data?.id });
    }

    return res.status(400).json({ error: 'Invalid email type' });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
}