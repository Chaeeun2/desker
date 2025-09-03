# 코드 스타일 및 컨벤션

## 파일 및 디렉토리 구조
- **컴포넌트**: PascalCase (Section10.js, AdminLayout.js)
- **파일명**: 컴포넌트는 PascalCase, 유틸리티는 camelCase
- **CSS**: CSS Modules 사용 (.module.css)
- **디렉토리**: camelCase 또는 kebab-case

## React 컴포넌트 패턴
```javascript
// 함수형 컴포넌트 기본 구조
import React, { useRef, useEffect, useState } from "react";
import styles from "./ComponentName.module.css";

const ComponentName = () => {
  // 1. Hooks 선언부
  const [state, setState] = useState();
  const ref = useRef(null);
  
  // 2. useEffect 훅들
  useEffect(() => {
    // 사이드 이펙트
  }, [dependency]);
  
  // 3. 이벤트 핸들러 함수들
  const handleEvent = () => {
    // 핸들러 로직
  };
  
  // 4. 렌더링
  return (
    <div className={styles.container}>
      {/* JSX 내용 */}
    </div>
  );
};

export default ComponentName;
```

## CSS Modules 패턴
```css
/* ComponentName.module.css */
.container {
  /* 스타일 */
}

.section10 {
  /* 섹션별 고유 스타일 */
}
```

## State Management 패턴
- **Local State**: useState 사용
- **Complex State**: useReducer 고려
- **Global State**: Context API (AuthContext 참고)
- **Server State**: Firebase 실시간 구독

## Firebase 연동 패턴
```javascript
// 데이터 로드
const loadData = async () => {
  try {
    const docRef = doc(db, 'collection', 'document');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      setData(docSnap.data());
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// 데이터 저장
const saveData = async (data) => {
  try {
    await setDoc(doc(db, 'collection', 'document'), data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 에러 처리 패턴
- try-catch 블록 사용
- 사용자 친화적인 에러 메시지 (alert 활용)
- 로딩 상태 관리 (loading, saving 상태)

## 이벤트 핸들링
- 함수명: handle + EventType 패턴
- 이벤트 버블링 제어 (stopPropagation 사용)
- 조건부 이벤트 처리