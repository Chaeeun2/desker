export async function onRequestPOST(context) {
  const { request, env } = context;
  
  // CORS 헤더 설정
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // multipart/form-data 파싱
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'work-life';
    
    if (!file) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No file provided' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // 파일명 생성 (timestamp + 원본 파일명)
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const key = `${folder}/${filename}`;

    // Cloudflare R2에 업로드
    await env.MY_BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // 업로드된 파일의 공개 URL 생성
    const publicUrl = `https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/${key}`;

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      filename: filename
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Upload failed: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// OPTIONS 요청 처리 (CORS preflight)
export async function onRequestOPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}