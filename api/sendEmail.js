const AWS = require('aws-sdk');

// AWS SES 설정
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-northeast-2' // 서울 리전
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

// 이메일 발송 함수
const sendSurveyEmail = async (req, res) => {
  const { 
    email, 
    fullName, 
    hasExperienced,
    companyName,
    collaborationTitle,
    collaborationContent,
    // 기타 설문 데이터
  } = req.body;

  // 이메일 템플릿 (발신 전용)
  const emailParams = {
    Source: '데스커 <noreply@desker.co.kr>', // 발신 전용 이메일
    Destination: {
      ToAddresses: [email], // 수신자 이메일
      BccAddresses: ['admin@desker.co.kr'] // 관리자에게 숨은 참조로 발송
    },
    Message: {
      Subject: {
        Data: '데스커 설문조사 참여 감사합니다',
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Pretendard', sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #007aff; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; background-color: #f9f9f9; }
                .coupon { background-color: white; padding: 20px; margin: 20px 0; border: 2px dashed #007aff; }
                .footer { text-align: center; padding: 20px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>데스커 설문조사 참여 감사합니다</h1>
                </div>
                <div class="content">
                  <p>안녕하세요, ${fullName}님!</p>
                  
                  <p>데스커 설문조사에 참여해 주셔서 진심으로 감사드립니다.</p>
                  
                  <p>약속드린 대로 아래 혜택을 보내드립니다:</p>
                  
                  <div class="coupon">
                    <h3>🎁 공식몰 쿠폰북</h3>
                    <p>쿠폰 코드: <strong>DESKER2024</strong></p>
                    <p>유효기간: 발급일로부터 30일</p>
                  </div>
                  
                  <p>📎 첨부파일: 워케이션 준비하기 툴킷 패키지(PDF)</p>
                  
                  ${hasExperienced === 'yes' ? `
                    <p>🎯 양양 워케이션 경험자 특별 혜택:<br/>
                    데스커 워케이션 키트를 별도로 발송해 드리겠습니다.</p>
                  ` : ''}
                  
                  ${companyName ? `
                    <p>📧 브랜드 협업 제안:<br/>
                    "${collaborationTitle}" 제안을 검토 후 영업일 기준 3-5일 내에 연락드리겠습니다.</p>
                  ` : ''}
                  
                  <p>매월 추첨을 통해 <strong>데스커 라운지 홍대 이용권</strong> 당첨자를 발표합니다.<br/>
                  당첨 시 개별 연락드리겠습니다.</p>
                </div>
                <div class="footer">
                  <p>© 2024 Desker. All rights reserved.</p>
                  <p>문의: support@desker.co.kr | 02-1234-5678</p>
                </div>
              </div>
            </body>
            </html>
          `,
          Charset: 'UTF-8'
        }
      }
    },
    // PDF 첨부파일 추가 (선택사항)
    // Attachments: [
    //   {
    //     Filename: 'workation_toolkit.pdf',
    //     Content: pdfBuffer.toString('base64'),
    //     ContentType: 'application/pdf'
    //   }
    // ]
  };

  try {
    // 이메일 발송
    const result = await ses.sendEmail(emailParams).promise();
    
    // 설문 데이터를 데이터베이스에 저장 (선택사항)
    // await saveSurveyData(req.body);
    
    res.status(200).json({
      success: true,
      message: '이메일이 성공적으로 발송되었습니다.',
      messageId: result.MessageId
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      message: '이메일 발송 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

module.exports = { sendSurveyEmail };