#!/bin/bash

echo "🚀 Firebase Email 설정 시작"
echo "================================"

# 1. Firebase CLI 설치 확인
echo "1. Firebase CLI 확인 중..."
if ! command -v firebase &> /dev/null
then
    echo "Firebase CLI를 설치합니다..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI가 이미 설치되어 있습니다."
fi

# 2. Firebase 로그인 확인
echo ""
echo "2. Firebase 로그인 상태 확인..."
firebase login:list
echo "로그인이 필요하면 아래 명령어를 실행하세요:"
echo "firebase login"

# 3. Functions 패키지 설치
echo ""
echo "3. Functions 패키지 설치 중..."
cd functions
npm install
cd ..

# 4. 환경변수 설정
echo ""
echo "4. Firebase Functions 환경변수 설정..."
echo "아래 명령어를 복사해서 실행하세요:"
echo ""
echo "# Resend API 키 설정"
echo "firebase functions:config:set resend.api_key=\"re_7YoLNzPF_GuLbGgM2AvJpHiyK6tkyLpE8\""
echo ""
echo "# 이메일 설정"
echo "firebase functions:config:set email.sender=\"Desker Workation <onboarding@resend.dev>\""
echo "firebase functions:config:set email.admin=\"contact@alolot.kr\""
echo ""
echo "# 설정 확인"
echo "firebase functions:config:get"

echo ""
echo "================================"
echo "📝 다음 단계:"
echo ""
echo "1. 로컬 테스트:"
echo "   firebase emulators:start --only functions"
echo ""
echo "2. Functions 배포:"
echo "   firebase deploy --only functions"
echo ""
echo "3. 전체 배포 (React 앱 + Functions):"
echo "   npm run build"
echo "   firebase deploy"
echo ""
echo "✅ 설정 완료!"