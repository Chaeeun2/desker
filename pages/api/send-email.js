import AWS from 'aws-sdk';

// AWS SES 설정
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-northeast-2'
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, fullName, ...surveyData } = req.body;

  try {
    // 이메일 발송 (발신 전용 - 답장 불가)
    const emailParams = {
      Source: `데스커 <${process.env.SENDER_EMAIL || 'noreply@desker.co.kr'}>`,
      Destination: {
        ToAddresses: [email],
        BccAddresses: [process.env.ADMIN_EMAIL || 'admin@desker.co.kr']
      },
      Message: {
        Subject: {
          Data: '데스커 설문조사 참여 감사합니다',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: generateEmailTemplate(fullName, surveyData),
            Charset: 'UTF-8'
          }
        }
      }
    };

    const result = await ses.sendEmail(emailParams).promise();
    
    // 성공 응답
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
}

function generateEmailTemplate(name, data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Pretendard', -apple-system, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; }
        .header h1 { color: white; margin: 0; }
        .content { padding: 40px; background: #f8f9fa; }
        .coupon-box { background: white; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; text-align: center; }
        .coupon-code { font-size: 24px; font-weight: bold; color: #667eea; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>감사합니다, ${name}님!</h1>
        </div>
        <div class="content">
          <p>데스커 설문조사에 참여해 주셔서 진심으로 감사드립니다.</p>
          
          <div class="coupon-box">
            <p>🎁 공식몰 쿠폰북</p>
            <p class="coupon-code">DESKER2024SURVEY</p>
            <p style="color: #666; font-size: 14px;">유효기간: 발급일로부터 30일</p>
          </div>
          
          <p>📎 워케이션 준비하기 툴킷은 다음 링크에서 다운로드하실 수 있습니다:<br/>
          <a href="https://desker.co.kr/download/workation-toolkit.pdf">다운로드</a></p>
          
          <p>매월 추첨을 통해 데스커 라운지 이용권 당첨자를 선정합니다.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
          
          <p style="color: #999; font-size: 12px;">
            ※ 본 메일은 발신 전용으로 회신이 불가능합니다.<br>
            문의사항은 홈페이지를 통해 접수해 주시기 바랍니다.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}