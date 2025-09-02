// 템플릿 변수 치환 함수
function processTemplate(template, data) {
  let processed = template;
  
  // 기본 변수 치환
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, data[key] || '');
  });
  
  // 조건문 처리 (간단한 버전)
  // {{#if variable}}content{{/if}} 형식 처리
  processed = processed.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, variable, content) => {
    return data[variable] ? content : '';
  });
  
  return processed;
}

export async function onRequest(context) {
  const { request } = context;
  
  // CORS 헤더 설정
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // OPTIONS 요청 처리
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // POST 요청만 허용
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const requestBody = await request.json();
    const { type, surveyData, template, to, testData } = requestBody;
    
    // 테스트 이메일 처리
    if (to && template && testData) {
      const processedHtml = processTemplate(template.content, testData);
      
      const emailPayload = {
        from: context.env.REACT_APP_FROM_EMAIL || '데스커 워케이션 <noreply@deskerworkation.com>',
        to: to,
        subject: template.subject,
        html: processedHtml
      };

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      const resendData = await resendResponse.json();
      
      if (!resendResponse.ok) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: resendData.message || 'Test email failed'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true, messageId: resendData.id }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 일반 설문조사 이메일 처리
    if (!surveyData) {
      return new Response(JSON.stringify({ error: 'Survey data is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const hasExperiencedText = surveyData.hasExperienced === 'yes' ? '네' : '아니오';
    
    if (type === 'confirmation') {
      // 사용자 확인 이메일
      const recipientEmail = surveyData.email || surveyData.emailForPrizes;
      
      if (!recipientEmail) {
        return new Response(JSON.stringify({ success: true, message: 'No email to send' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 템플릿이 제공되면 사용, 아니면 기본 템플릿 사용
      let htmlBody;
      let subject = '데스커 워케이션 설문조사 참여 감사합니다 🎉';
      
      if (template) {
        // 템플릿 변수 치환
        const templateData = {
          fullName: surveyData.fullName || '고객',
          hasExperienced: hasExperiencedText,
          goodPoints: surveyData.goodPoints || '',
          workType: surveyData.workType || '',
          email: recipientEmail,
          phoneNumber: surveyData.phoneNumber || ''
        };
        htmlBody = processTemplate(template.content, templateData);
        subject = template.subject || subject;
      } else {
        // 기본 템플릿
        htmlBody = `
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
      }

      const emailPayload = {
        from: context.env.REACT_APP_FROM_EMAIL || '데스커 워케이션 <noreply@deskerworkation.com>',
        to: recipientEmail,
        subject: subject,
        html: htmlBody
      };

      // Resend API 호출
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      const resendData = await resendResponse.json();
      
      if (!resendResponse.ok) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: resendData.message || resendData.name || 'Email sending failed',
          details: resendData 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true, messageId: resendData.id }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (type === 'admin') {
      // 관리자 알림 - 인증된 도메인이 없으므로 스킵
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Admin notification skipped' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid email type' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}