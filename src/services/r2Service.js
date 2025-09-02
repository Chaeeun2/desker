import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Cloudflare R2 업로드 서비스
const R2_PUBLIC_URL = process.env.REACT_APP_R2_PUBLIC_URL;
const R2_ENDPOINT = process.env.REACT_APP_R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.REACT_APP_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.REACT_APP_R2_BUCKET_NAME;

// R2 Account ID 추출 (엔드포인트에서)
const R2_ACCOUNT_ID = R2_ENDPOINT ? R2_ENDPOINT.split('.')[0].replace('https://', '') : '';

// R2 클라이언트 설정 (admin-sample과 동일한 방식)
const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // R2에 필요한 설정
});

// 파일명 생성 함수
const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `survey-photos/${timestamp}-${randomString}.${extension}`;
};

// R2에 이미지 업로드
export const uploadImageToR2 = async (file) => {
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
    
    try {
      // 브라우저 환경에서 File을 ArrayBuffer로 변환 (admin-sample과 동일)
      const arrayBuffer = await file.arrayBuffer();
      
      // R2에 업로드
      const uploadParams = {
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: arrayBuffer,
        ContentType: file.type,
      };
      
      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);
      
      // Public URL 생성
      const publicUrl = `${R2_PUBLIC_URL}/${fileName}`;
      
      return {
        success: true,
        url: publicUrl,
        fileName: fileName,
        message: '이미지가 업로드되었습니다.'
      };
      
    } catch (uploadError) {
      
      // R2 업로드 실패 시 base64 fallback
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;
          resolve({
            success: true,
            url: base64String,
            fileName: fileName,
            message: '이미지가 로컬에 저장되었습니다.'
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

// 이미지 삭제
export const deleteImageFromR2 = async (fileName) => {
  try {
    // base64 데이터인 경우 삭제할 필요 없음
    if (fileName.startsWith('data:')) {
      return { success: true };
    }
    
    // URL에서 파일명 추출
    const key = fileName.includes(R2_PUBLIC_URL) 
      ? fileName.replace(R2_PUBLIC_URL + '/', '')
      : fileName;
    
    const deleteParams = {
      Bucket: R2_BUCKET_NAME,
      Key: key,
    };
    
    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};