// 로컬 개발용 이메일 서버
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Resend 초기화
const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// 이메일 발송 엔드포인트
app.post('/api/send-email', async (req, res) => {
  try {
    const { type, surveyData } = req.body;

    if (!surveyData) {
      return res.status(400).json({ error: 'Survey data is required' });
    }

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
          <style>
            body { font-family: 'Pretendard', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .section { background-color: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 데스커 워케이션 설문조사 참여 완료</h1>
          </div>
          <div class="content">
            <p>안녕하세요, <strong>${surveyData.fullName || '고객'}님</strong>!</p>
            <p>데스커 워케이션 설문조사에 참여해 주셔서 감사합니다.</p>
            
            <div class="section">
              <h2>📋 제출하신 설문 내용</h2>
              <p>양양 워케이션 경험: ${hasExperiencedText}</p>
              ${surveyData.goodPoints ? `<p>좋았던 점: ${surveyData.goodPoints}</p>` : ''}
              ${surveyData.workType ? `<p>업무 분야: ${surveyData.workType}</p>` : ''}
            </div>
            
            <div class="section">
              <h2>🎁 경품 이벤트 안내</h2>
              <p>추첨을 통해 다양한 경품을 드립니다!</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const { data, error } = await resend.emails.send({
        from: process.env.REACT_APP_SENDER_EMAIL || 'Desker Workation <onboarding@resend.dev>',
        to: [recipientEmail],
        subject: '데스커 워케이션 설문조사 참여 감사합니다 🎉',
        html: htmlBody
      });

      if (error) {
        console.error('Resend error:', error);
        return res.status(400).json({ success: false, error: error.message });
      }

      console.log('Email sent:', data?.id);
      return res.status(200).json({ success: true, messageId: data?.id });

    } else if (type === 'admin') {
      // 관리자 알림
      const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;
      if (!adminEmail) {
        return res.status(200).json({ success: false, message: 'No admin email' });
      }

      const htmlBody = `
        <h2>새로운 설문 응답</h2>
        <p>제출자: ${surveyData.fullName}</p>
        <p>이메일: ${surveyData.email || surveyData.emailForPrizes || '-'}</p>
        <p>전화번호: ${surveyData.phoneNumber}</p>
      `;

      const { data, error } = await resend.emails.send({
        from: process.env.REACT_APP_SENDER_EMAIL || 'Desker Workation <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `[데스커] 새 설문 응답 - ${surveyData.fullName}`,
        html: htmlBody
      });

      if (error) {
        console.error('Admin email error:', error);
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, messageId: data?.id });
    }

    return res.status(400).json({ error: 'Invalid email type' });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Email server running on http://localhost:${PORT}`);
  console.log('Ready to send emails via Resend API');
});