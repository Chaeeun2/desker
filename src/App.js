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
import RightBottomIcon from './components/ui/RightBottomIcon';
import SurveyModal from './components/ui/SurveyModal';
import HamburgerMenu from './components/ui/HamburgerMenu';

function App() {
  const [isSection1Visible, setIsSection1Visible] = useState(false);
  const [isSection2Visible, setIsSection2Visible] = useState(false);
  const [isSection6Visible, setIsSection6Visible] = useState(false);
  const [isSection10Visible, setIsSection10Visible] = useState(false);
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

  // 첫 진입 시 섹션 비활성화
  useEffect(() => {
    // 섹션들 비활성화
    window.disableStickyScroll = true;
    window.disableSection3Animation = true;
    window.section3AnimationComplete = true;
    window.isMenuScrolling = true;
    document.body.classList.add('disable-sticky-scroll');
    
    // 섹션7 리셋
    if (window.resetSection7) {
      window.resetSection7();
    }
    
    // 0.3초 후 재활성화
    setTimeout(() => {
      window.disableStickyScroll = false;
      window.disableSection3Animation = false;
      window.isMenuScrolling = false;
      document.body.classList.remove('disable-sticky-scroll');
    }, 300);
  }, []);

  // URL hash 기반 섹션 이동 처리
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const targetElement = document.getElementById(hash);
        if (targetElement) {
          // 즉시 이동 (애니메이션 없이)
          const appElement = document.querySelector('.App');
          if (appElement) {
            // 딜레이를 두고 스크롤 (컴포넌트가 완전히 로드된 후)
            setTimeout(() => {
              appElement.scrollTop = targetElement.offsetTop;
            }, 100);
          }
        }
      }
    };

    // 페이지 로드 시 초기 hash 처리
    if (window.location.hash) {
      handleHashChange();
    }

    // hash 변경 이벤트 리스너 등록
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
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
      <Section2 onVisibilityChange={setIsSection2Visible} />
      <Section3 />
      <Section4 />
      <Section5 />
      <Section6 onVisibilityChange={(visible) => {
        setIsSection6Visible(visible);
      }} />
      <Section7 />
      <Section8 />
      <Section9 />
      <Section10 onVisibilityChange={(visible) => {
        setIsSection10Visible(visible);
      }} />
      <Section11 onVisibilityChange={setIsSection11Visible} />
      {/* 추후 다른 섹션들도 여기에 추가 */}
      
      {/* 플로팅 메뉴 - 임시 비활성화 */}
      {/* <FloatingMenu /> */}
      
      {/* 우측 하단 플로팅 아이콘 */}
      <RightBottomIcon 
        isSection1Visible={isSection1Visible} 
        isSection2Visible={isSection2Visible}
        isSection6Visible={isSection6Visible}
        isSection10Visible={isSection10Visible}
      />

      {/* 설문조사 모달 */}
      <SurveyModal isOpen={isSurveyModalOpen} onClose={() => setIsSurveyModalOpen(false)} />
      
      {/* PC용 햄버거 메뉴 */}
      <HamburgerMenu />
    </div>
  );
}

export default App;
