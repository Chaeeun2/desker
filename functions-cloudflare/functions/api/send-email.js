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
      
      const fromEmail = '데스커 워케이션 <noreply@deskerworkation.com>';

      const emailPayload = {
        from: fromEmail,
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
          error: resendData.message || 'Test email failed',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        messageId: resendData.id,
      }), {
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

      // Firebase 템플릿만 사용
      if (!template) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Email template not found in Firebase. Please create template in admin panel.' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // 템플릿 변수 치환
      const templateData = {
        fullName: surveyData.fullName || '고객',
        hasExperienced: hasExperiencedText,
        goodPoints: surveyData.goodPoints || '',
        workType: surveyData.workType || '',
        email: recipientEmail,
        phoneNumber: surveyData.phoneNumber || ''
      };
      const htmlBody = processTemplate(template.content, templateData);
      const subject = template.subject || '데스커 워케이션 설문조사 참여 감사합니다 🎉';

      const fromEmail = '데스커 워케이션 <noreply@deskerworkation.com>';
      console.log('🔍 FROM EMAIL DEBUG:', {
        envValue: context.env.REACT_APP_FROM_EMAIL,
        finalFromEmail: fromEmail,
        allEnvVars: Object.keys(context.env)
      });

      const emailPayload = {
        from: fromEmail,
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

      return new Response(JSON.stringify({ 
        success: true, 
        messageId: resendData.id,
        debug: {
          envValue: context.env.REACT_APP_FROM_EMAIL,
          finalFromEmail: fromEmail,
          hasEnvVar: !!context.env.REACT_APP_FROM_EMAIL
        }
      }), {
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