# Desker Admin 설정 가이드

## 1. 필요한 패키지 설치

```bash
npm install react-router-dom firebase
```

## 2. 어드민 페이지 접속

- 로컬 개발: http://localhost:3000/admin
- 로그인 페이지: http://localhost:3000/admin/login

## 3. 어드민 구조

```
src/admin/
├── Admin.js                 # 메인 라우팅
├── components/
│   ├── AdminLayout.jsx      # 레이아웃 컴포넌트
│   ├── AdminLayout.css      # 레이아웃 스타일
│   └── ProtectedRoute.js    # 인증 보호 라우트
├── contexts/
│   └── AuthContext.js       # 인증 컨텍스트
├── pages/
│   ├── Login.js             # 로그인 페이지
│   └── SurveyManager.js     # 설문 관리 페이지
├── services/
│   └── authService.js       # 인증 서비스
└── styles/
    └── admin.css            # 어드민 전체 스타일
```

## 4. 주요 기능

### 설문 관리 (SurveyManager)
- 설문 응답 목록 조회
- 상세 정보 보기
- CSV 내보내기
- 응답 삭제

### 추가 예정 페이지
- 설문 통계 (SurveyStatsManager)
- 섹션 관리 (SectionsManager)
- 미디어 관리 (MediaManager)
- 이메일 템플릿 (EmailTemplatesManager)
- 이메일 로그 (EmailLogsManager)
- 설정 (SettingsManager)

## 5. Firebase 설정 (선택사항)

src/admin/lib/firebase.js 파일에서 Firebase 설정을 업데이트하세요:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 6. 스타일 커스터마이징

admin.css 파일에서 데스커 브랜드에 맞게 색상과 스타일을 조정할 수 있습니다.

## 7. 주의사항

- react-router-dom 설치 필수
- Firebase 사용 시 환경 변수로 API 키 관리 권장
- 프로덕션 배포 시 어드민 경로 보호 필수