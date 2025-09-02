// 이메일 발송 테스트 스크립트
const AWS = require('aws-sdk');
require('dotenv').config({ path: '.env.local' });

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-northeast-2'
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

async function testEmail() {
  const params = {
    Source: `데스커 <${process.env.SENDER_EMAIL || 'noreply@desker.co.kr'}>`, // 발신 전용
    Destination: {
      ToAddresses: ['test@example.com'] // 테스트할 이메일 주소 (실제 테스트 이메일로 변경)
    },
    Message: {
      Subject: {
        Data: '[테스트] 데스커 이메일 발송 테스트',
        Charset: 'UTF-8'
      },
      Body: {
        Text: {
          Data: 'SES 이메일 발송 테스트입니다.',
          Charset: 'UTF-8'
        }
      }
    }
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log('✅ 이메일 발송 성공:', result.MessageId);
  } catch (error) {
    console.error('❌ 이메일 발송 실패:', error);
    
    // 일반적인 에러 처리
    if (error.code === 'MessageRejected') {
      console.log('➡️ 이메일 주소가 인증되지 않았습니다.');
    } else if (error.code === 'ConfigurationSetDoesNotExist') {
      console.log('➡️ Configuration Set을 확인하세요.');
    } else if (error.statusCode === 400) {
      console.log('➡️ 샌드박스 모드에서는 인증된 이메일로만 발송 가능합니다.');
    }
  }
}

// 테스트 실행
testEmail();