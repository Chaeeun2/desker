import React, { useEffect, useState } from 'react';
import './App.css';
import Section0 from './components/sections/0_Intro';
import Section1 from './components/sections/1_Main';
import Section2 from './components/sections/2_Section';
import Section3 from './components/sections/3_Section';
import Section4 from './components/sections/4_Section';
import Section5 from './components/sections/5_Section';
import Section6 from './components/sections/6_Section';
import Section7 from './components/sections/7_Section';
import Section8 from './components/sections/8_Section';
import Section9 from './components/sections/9_Section';
import Section10 from './components/sections/10_Section';
import Section11 from './components/sections/11_Section';
import FloatingMenu from './components/ui/FloatingMenu';
import RightBottomIcon from './components/ui/RightBottomIcon';
import SurveyModal from './components/ui/SurveyModal';

function App() {
  const [isSection1Visible, setIsSection1Visible] = useState(false);
  const [isSection11Visible, setIsSection11Visible] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [hasShownSurvey, setHasShownSurvey] = useState(false); // 최초 실행 여부를 추적하는 상태

  // 스크롤 성능 최적화
  useEffect(() => {
    // 모바일에서 스크롤 성능 향상
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 섹션11이 보일 때 설문조사 모달 표시 (최초 한 번만)
  useEffect(() => {
    if (isSection11Visible && !isSurveyModalOpen && !hasShownSurvey) {
      setIsSurveyModalOpen(true);
      setHasShownSurvey(true); // 최초 실행 표시
    }
  }, [isSection11Visible, isSurveyModalOpen, hasShownSurvey]);

  return (
    <div className="App">
      <Section0 />
      <Section1 onVisibilityChange={setIsSection1Visible} />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <Section6 />
      <Section7 />
      <Section8 />
      <Section9 />
      <Section10 />
      <Section11 onVisibilityChange={setIsSection11Visible} />
      {/* 추후 다른 섹션들도 여기에 추가 */}
      
      {/* 플로팅 메뉴 */}
      <FloatingMenu />
      
      {/* 우측 하단 플로팅 아이콘 */}
      <RightBottomIcon isSection1Visible={isSection1Visible} />

      {/* 설문조사 모달 */}
      <SurveyModal isOpen={isSurveyModalOpen} onClose={() => setIsSurveyModalOpen(false)} />
    </div>
  );
}

export default App;
