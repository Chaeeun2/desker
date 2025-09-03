# 개발 필수 명령어

## 프로젝트 실행
```bash
# 개발 서버 시작
npm start
# → http://localhost:3000에서 실행

# 프로덕션 빌드
npm run build

# 테스트 실행
npm test

# 패키지 설치
npm install
```

## Firebase 배포
```bash
# Firebase 프로젝트 확인
firebase projects:list

# 빌드 후 배포
npm run build
firebase deploy

# Firebase 로그 확인
firebase functions:log
```

## Git 명령어 (macOS)
```bash
# 상태 확인
git status

# 변경사항 확인
git diff

# 커밋
git add .
git commit -m "commit message"

# 푸시
git push origin master
```

## 파일 관리 (macOS)
```bash
# 파일 목록
ls -la

# 디렉토리 이동
cd /path/to/directory

# 파일 검색
find . -name "*.js"

# 내용 검색 (macOS는 grep 사용 가능)
grep -r "search_term" src/

# 파일 복사
cp source_file destination_file
```

## 개발 도구
```bash
# 노드 버전 확인
node --version

# npm 버전 확인
npm --version

# 패키지 의존성 확인
npm ls
```

## 디버깅
```bash
# React 개발자 도구 사용 권장
# Chrome DevTools에서 React 탭 활용

# 콘솔 로그 확인
# 브라우저 개발자 도구 Console 탭

# 네트워크 요청 모니터링
# Chrome DevTools Network 탭
```