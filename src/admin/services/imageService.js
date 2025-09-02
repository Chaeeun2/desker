// Cloudflare R2 스토리지 서비스
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// R2 설정
const R2_ACCOUNT_ID = process.env.REACT_APP_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.REACT_APP_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.REACT_APP_R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.REACT_APP_R2_PUBLIC_URL || `https://pub-${R2_ACCOUNT_ID}.r2.dev`;



// S3 클라이언트 설정 (R2 호환)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // R2 호환성을 위해 필요
});

export const imageService = {
  // 고유한 파일 이름 생성 (원본 파일명 유지)
  generateFileName(file, prefix = '') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
    
    // 원본 파일명에 타임스탬프와 랜덤 문자열을 추가하여 고유성 보장 (prefix 제거)
    return `${nameWithoutExt}_${timestamp}_${randomString}.${extension}`;
  },

  // 저장된 파일명에서 원본 파일명 복원
  getOriginalFileName(storedFileName) {
    if (!storedFileName) return '';
    
    try {
      // 파일명에서 확장자 추출
      const extension = storedFileName.split('.').pop();
      // 파일명에서 확장자 제거
      const nameWithoutExt = storedFileName.substring(0, storedFileName.lastIndexOf('.'));
      
      // 기존 prefix가 포함된 파일명 처리 (privacyVideoPolicyPdf, creditInfoPdf 등)
      let originalName = nameWithoutExt;
      
      // prefix 패턴들 확인 및 제거
      const prefixes = ['privacyVideoPolicyPdf', 'creditInfoPdf'];
      for (const prefix of prefixes) {
        if (nameWithoutExt.startsWith(prefix)) {
          originalName = nameWithoutExt.substring(prefix.length);
          break;
        }
      }
      
      // 타임스탬프와 랜덤 문자열이 있는지 확인 (형식: name_timestamp_random)
      const parts = originalName.split('_');
      
      // 타임스탬프 패턴 확인 (예: 2025-01-15T10-30-45-123Z)
      const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/;
      const randomPattern = /^[a-z0-9]{5,8}$/; // 5-8자리 영소문자+숫자
      
      // 마지막 두 부분이 타임스탬프와 랜덤 문자열인지 확인
      if (parts.length >= 3) {
        const lastPart = parts[parts.length - 1];
        const secondLastPart = parts[parts.length - 2];
        
        if (timestampPattern.test(secondLastPart) && randomPattern.test(lastPart)) {
          // 타임스탬프와 랜덤 문자열이면 제거
          const cleanName = parts.slice(0, -2).join('_');
          return `${cleanName}.${extension}`;
        }
      }
      
      // 타임스탬프와 랜덤 문자열이 없으면 원본 파일명 그대로 반환
      return `${originalName}.${extension}`;
    } catch (error) {

      return storedFileName; // 오류 시 원본 반환
    }
  },

  // 이미지 업로드 (단일)
  async uploadImage(file, metadata = {}) {
    try {
      // 환경변수 확인
      if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
        throw new Error('R2 환경변수가 설정되지 않았습니다.');
      }

      // 파일 검증
      this.validateImageFile(file);
      
      // 고유한 파일명 생성
      const fileName = this.generateFileName(file, metadata.prefix || '');
      const key = `images/${fileName}`;



      // 브라우저 환경에서 File을 ArrayBuffer로 변환
      const arrayBuffer = await file.arrayBuffer();

      // 파일명을 안전하게 인코딩 (한국어 처리) - 브라우저 호환
      const safeOriginalName = btoa(encodeURIComponent(file.name));
      
      // R2에 업로드
      const uploadCommand = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: arrayBuffer,
        ContentType: file.type,
        Metadata: {
          originalName: safeOriginalName, // Base64로 인코딩된 파일명
          uploadedAt: new Date().toISOString(),
          source: metadata.source || 'admin-panel',
          // 추가 메타데이터도 안전하게 처리 - 브라우저 호환
          ...(metadata && Object.keys(metadata).reduce((acc, key) => {
            const value = metadata[key];
            // undefined, null, 빈 문자열 제외
            if (value !== undefined && value !== null && value !== '') {
              if (typeof value === 'string') {
                // 문자열 값은 ASCII 문자만 포함하는지 확인
                acc[key] = /^[\x00-\x7F]*$/.test(value) ? value : btoa(encodeURIComponent(value));
              } else {
                // 숫자, 불린 등은 문자열로 변환
                acc[key] = String(value);
              }
            }
            return acc;
          }, {}))
        }
      });

      
      await r2Client.send(uploadCommand);
      

      // 공개 URL 생성
      const publicUrl = `${R2_PUBLIC_URL}/${key}`;
      
      return {
        success: true,
        imageId: fileName.split('.')[0], // 확장자 제외한 파일명을 ID로 사용
        fileName: fileName,
        key: key,
        imageUrl: publicUrl,
        publicUrl: publicUrl,
        thumbnailUrl: publicUrl, // R2에서는 별도 썸네일 생성 안함 (필요시 변환 서비스 추가)
        originalUrl: publicUrl
      };
    } catch (error) {

      throw error;
    }
  },

  // 일반 파일 업로드 (이미지 검증 없음)
  async uploadFile(file, metadata = {}) {
    try {
      // 환경변수 확인
      if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
        throw new Error('R2 환경변수가 설정되지 않았습니다.');
      }

      // 고유한 파일명 생성
      const fileName = this.generateFileName(file, metadata.prefix || '');
      const key = `files/${fileName}`;

      

      // 브라우저 환경에서 File을 ArrayBuffer로 변환
      const arrayBuffer = await file.arrayBuffer();

      // 파일명을 안전하게 인코딩 (한국어 처리) - 브라우저 호환
      const safeOriginalName = btoa(encodeURIComponent(file.name));
      
      // R2에 업로드
      const uploadCommand = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: arrayBuffer,
        ContentType: file.type,
        ContentDisposition: 'attachment', // 브라우저에서 다운로드하도록 강제
        Metadata: {
          originalName: safeOriginalName, // Base64로 인코딩된 파일명
          uploadedAt: new Date().toISOString(),
          source: metadata.source || 'admin-panel',
          // 추가 메타데이터도 안전하게 처리 - 브라우저 호환
          ...(metadata && Object.keys(metadata).reduce((acc, key) => {
            const value = metadata[key];
            // undefined, null, 빈 문자열 제외
            if (value !== undefined && value !== null && value !== '') {
              if (typeof value === 'string') {
                // 문자열 값은 ASCII 문자만 포함하는지 확인
                acc[key] = /^[\x00-\x7F]*$/.test(value) ? value : btoa(encodeURIComponent(value));
              } else {
                // 숫자, 불린 등은 문자열로 변환
                acc[key] = String(value);
              }
            }
            return acc;
          }, {}))
        }
      });

      await r2Client.send(uploadCommand);

      // 공개 URL 생성
      const publicUrl = `${R2_PUBLIC_URL}/${key}`;
      
      return {
        success: true,
        fileId: fileName.split('.')[0], // 확장자 제외한 파일명을 ID로 사용
        fileName: fileName,
        key: key,
        fileUrl: publicUrl,
        publicUrl: publicUrl,
        originalUrl: publicUrl
      };
    } catch (error) {

      throw error;
    }
  },

  // 다중 이미지 업로드
  async uploadMultipleImages(files, metadata = {}) {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, metadata));
      const results = await Promise.all(uploadPromises);
      
      return {
        success: true,
        results: results,
        totalCount: files.length,
        successCount: results.filter(r => r.success).length
      };
    } catch (error) {

      throw error;
    }
  },

  // 이미지 삭제
  async deleteImage(keyOrFileName) {
    try {
      const key = keyOrFileName.startsWith('images/') ? keyOrFileName : `images/${keyOrFileName}`;
      
      const deleteCommand = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key
      });

      await r2Client.send(deleteCommand);
      
      return {
        success: true,
        deletedKey: key
      };
    } catch (error) {

      throw error;
    }
  },

  // 다중 이미지 삭제
  async deleteMultipleImages(keysOrFileNames) {
    try {
      const deletePromises = keysOrFileNames.map(key => this.deleteImage(key));
      const results = await Promise.all(deletePromises);
      
      return {
        success: true,
        results: results,
        totalCount: keysOrFileNames.length,
        successCount: results.filter(r => r.success).length
      };
    } catch (error) {

      throw error;
    }
  },

  // URL에서 키 추출
  extractKeyFromUrl(fileUrl) {
    try {
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const keyIndex = pathParts.findIndex(part => part === 'images' || part === 'files');
      
      if (keyIndex !== -1 && keyIndex + 1 < pathParts.length) {
        return pathParts.slice(keyIndex).join('/');
      }
      
      return null;
    } catch (error) {

      return null;
    }
  },

  // 이미지 목록 조회
  async getImages(prefix = 'images/', maxKeys = 50) {
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        Prefix: prefix,
        MaxKeys: maxKeys
      });

      const response = await r2Client.send(listCommand);
      
      const images = response.Contents?.map(obj => ({
        key: obj.Key,
        fileName: obj.Key.split('/').pop(),
        size: obj.Size,
        lastModified: obj.LastModified,
        imageUrl: `${R2_PUBLIC_URL}/${obj.Key}`,
        publicUrl: `${R2_PUBLIC_URL}/${obj.Key}`
      })) || [];

      return {
        success: true,
        images: images,
        totalCount: images.length,
        isTruncated: response.IsTruncated,
        nextContinuationToken: response.NextContinuationToken
      };
    } catch (error) {

      throw error;
    }
  },

  // 이미지 URL 생성
  generateImageUrl(keyOrFileName) {
    const key = keyOrFileName.startsWith('images/') ? keyOrFileName : `images/${keyOrFileName}`;
    return `${R2_PUBLIC_URL}/${key}`;
  },

  // 서명된 URL 생성 (임시 접근용)
  async generateSignedUrl(keyOrFileName, expiresIn = 3600) {
    try {
      const key = keyOrFileName.startsWith('images/') ? keyOrFileName : `images/${keyOrFileName}`;
      
      const getCommand = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key
      });

      const signedUrl = await getSignedUrl(r2Client, getCommand, { expiresIn });
      
      return {
        success: true,
        signedUrl: signedUrl,
        expiresIn: expiresIn
      };
    } catch (error) {

      throw error;
    }
  },

  // 이미지 변환 URL 생성 (R2 Transform 지원)
  generateTransformUrl(keyOrFileName, options = {}) {
    const key = keyOrFileName.startsWith('images/') ? keyOrFileName : `images/${keyOrFileName}`;
    const baseUrl = `${R2_PUBLIC_URL}/${key}`;
    
    if (!options.width && !options.height && !options.format) {
      return baseUrl;
    }

    const params = new URLSearchParams();
    if (options.width) params.append('width', options.width);
    if (options.height) params.append('height', options.height);
    if (options.format) params.append('format', options.format);
    if (options.quality) params.append('quality', options.quality);
    if (options.fit) params.append('fit', options.fit);

    return `${baseUrl}?${params.toString()}`;
  },

  // 이미지 파일 검증
  validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('지원하지 않는 이미지 형식입니다. JPEG, PNG, GIF, WebP만 지원됩니다.');
    }

    if (file.size > maxSize) {
      throw new Error('파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.');
    }
  },

  // 원본 파일명 디코딩
  decodeOriginalFileName(encodedName) {
    try {
      return decodeURIComponent(atob(encodedName));
    } catch (error) {

      return encodedName;
    }
  },

  // ASCII 안전 문자열 확인
  isAsciiSafe(str) {
    return /^[\x00-\x7F]*$/.test(str);
  },

  // 메타데이터 값 인코딩
  encodeMetadataValue(value) {
    if (typeof value === 'string' && !this.isAsciiSafe(value)) {
      return btoa(encodeURIComponent(value));
    }
    return value;
  },

  // 메타데이터 값 디코딩
  decodeMetadataValue(value) {
    try {
      if (typeof value === 'string' && value.includes('%')) {
        return decodeURIComponent(atob(value));
      }
      return value;
    } catch (error) {
      return value;
    }
  }
};
