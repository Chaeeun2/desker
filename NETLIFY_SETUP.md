# Netlify 배포 가이드

## 1. Netlify 사이트 생성

1. [Netlify](https://app.netlify.com/) 로그인
2. "Add new site" → "Import an existing project" 선택
3. GitHub 저장소 연결
4. 빌드 설정은 `netlify.toml`에 정의되어 있어 자동 인식됨

## 2. 환경 변수 설정

Netlify Dashboard → Site settings → Environment variables에서 아래 환경 변수들을 설정해야 합니다:

### Firebase 설정
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### AWS S3 설정 (파일 업로드용)
```
REACT_APP_AWS_REGION=your_aws_region
REACT_APP_AWS_ACCESS_KEY_ID=your_access_key
REACT_APP_AWS_SECRET_ACCESS_KEY=your_secret_key
REACT_APP_AWS_BUCKET_NAME=your_bucket_name
```

### 이메일 서비스 설정
```
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
```

### Resend API (이메일 발송)
```
REACT_APP_RESEND_API_KEY=your_resend_api_key
```

## 3. 빌드 설정 확인

`netlify.toml` 파일에 이미 설정되어 있습니다:
- Build command: `npm run build`
- Publish directory: `build`
- Node version: 18
- SPA 리디렉션 설정 포함

## 4. 배포 방법

### 자동 배포 (권장)
- `master` 브랜치에 push하면 자동으로 배포됩니다
- Pull Request 생성 시 미리보기 배포가 자동 생성됩니다

### 수동 배포
```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로그인
netlify login

# 사이트 연결 (최초 1회)
netlify link

# 배포
netlify deploy --prod
```

## 5. 도메인 설정

1. Netlify Dashboard → Domain settings
2. Custom domain 추가
3. DNS 설정 업데이트

## 6. Firebase와 병행 사용

현재 Firebase 설정 파일들은 그대로 유지되어 있습니다:
- `.firebaserc`
- `firebase.json`
- `.firebase/` 디렉토리

나중에 Firebase Hosting으로 전환하려면:
```bash
firebase deploy
```

## 7. 주의사항

- 환경 변수는 반드시 `REACT_APP_` 접두사를 사용해야 합니다
- `.env` 파일은 로컬 개발용이며, 프로덕션 환경 변수는 Netlify Dashboard에서 설정합니다
- Firebase와 Netlify 모두 같은 `build` 디렉토리를 사용합니다
