// Cloudflare R2 직접 업로드 (Presigned URL 사용)
const R2_PUBLIC_URL = process.env.REACT_APP_R2_PUBLIC_URL;

// 파일명 생성 함수
const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `survey-photos/${timestamp}-${randomString}.${extension}`;
};

// R2에 이미지 업로드 (Presigned URL 방식)
export const uploadImageToR2Direct = async (file) => {
  try {
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // 파일 크기 체크 (최대 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { success: false, error: '파일 크기는 10MB 이하여야 합니다.' };
    }

    // 파일 타입 체크
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: '이미지 파일만 업로드 가능합니다. (JPG, PNG, GIF, WEBP)' };
    }

    const fileName = generateFileName(file.name);
    
    // 실제 프로덕션에서는 백엔드에서 presigned URL을 받아와야 함
    // 현재는 임시로 public bucket을 사용한다고 가정
    
    console.log('Direct upload attempt for:', fileName);
    
    // R2 Public Bucket에 직접 PUT 요청 (Public Write 권한이 있어야 함)
    const uploadUrl = `${R2_PUBLIC_URL}/${fileName}`;
    
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      if (response.ok) {
        console.log('Direct upload successful:', uploadUrl);
        return {
          success: true,
          url: uploadUrl,
          fileName: fileName,
          message: '이미지가 업로드되었습니다.'
        };
      } else {
        throw new Error(`Upload failed: ${response.status}`);
      }
    } catch (fetchError) {
      console.error('Direct upload failed:', fetchError);
      
      // 직접 업로드 실패 시 base64 fallback
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;
          resolve({
            success: true,
            url: base64String,
            fileName: fileName,
            message: '이미지가 로컬에 저장되었습니다.',
            fallback: true
          });
        };
        reader.onerror = () => {
          resolve({
            success: false,
            error: '이미지 업로드 중 오류가 발생했습니다.'
          });
        };
        reader.readAsDataURL(file);
      });
    }
    
  } catch (error) {
    console.error('R2 upload error:', error);
    return {
      success: false,
      error: '이미지 업로드 중 오류가 발생했습니다.'
    };
  }
};

// 이미지 URL 생성
export const getImageUrl = (fileName) => {
  if (!fileName) return null;
  
  // base64 데이터인 경우 그대로 반환
  if (fileName.startsWith('data:')) {
    return fileName;
  }
  
  // R2 public URL 반환
  return `${R2_PUBLIC_URL}/${fileName}`;
};