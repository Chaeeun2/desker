import React, { useEffect } from 'react';
import './App.css';
import { Intro, Main, Section2, Section3, Section4 } from './components/sections';

function App() {
  // 스크롤 성능 최적화
  useEffect(() => {
    // CSS 스크롤 동작 최적화
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // 모바일에서 스크롤 성능 향상
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="App">
      <Intro />
      <Main />
      <Section2 />
      <Section3 />
      <Section4 />
      {/* 추후 다른 섹션들도 여기에 추가 */}
    </div>
  );
}

export default App;
