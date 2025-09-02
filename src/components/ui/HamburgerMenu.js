import React, { useState, useEffect } from 'react';
import styles from './HamburgerMenu.module.css';
import SurveyModal from './SurveyModal';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 간단한 섹션 기반 가시성 제어
  useEffect(() => {
    const handleScroll = () => {
      const appElement = document.querySelector('.App');
      const scrollY = appElement?.scrollTop || 0;
      console.log('📍 App 스크롤 위치:', scrollY);
      
      // 모든 섹션 위치 확인
      const section1 = document.querySelector('section:nth-child(1)');
      const section2 = document.querySelector('section:nth-child(2)');
      const section3 = document.querySelector('section:nth-child(3)');
      const section4 = document.querySelector('section:nth-child(4)');
      const section5 = document.querySelector('section:nth-child(5)');
      const section6 = document.querySelector('section:nth-child(6)');
      
      console.log('📊 섹션 위치들:', {
        section1: section1?.offsetTop,
        section2: section2?.offsetTop,
        section3: section3?.offsetTop,
        section4: section4?.offsetTop,
        section5: section5?.offsetTop,
        section6: section6?.offsetTop
      });
      
      // 현재 섹션 확인
      let currentSection = 1;
      if (section6 && scrollY >= section6.offsetTop - 100) currentSection = 6;
      else if (section5 && scrollY >= section5.offsetTop - 100) currentSection = 5;
      else if (section4 && scrollY >= section4.offsetTop - 100) currentSection = 4;
      else if (section3 && scrollY >= section3.offsetTop - 100) currentSection = 3;
      else if (section2 && scrollY >= section2.offsetTop - 100) currentSection = 2;
      
      console.log('🎯 현재 섹션:', currentSection);
      
      // 섹션 1,2,3,4에서는 숨김, 섹션 5부터 표시
      if (currentSection <= 4) {
        console.log('❌ 섹션 1-4 - 햄버거 버튼 숨김');
        setIsVisible(false);
      } else {
        console.log('✅ 섹션 5+ - 햄버거 버튼 표시');
        setIsVisible(true);
      }
    };

    // App 요소의 스크롤 이벤트 추가
    const appElement = document.querySelector('.App');
    if (appElement) {
      appElement.addEventListener('scroll', handleScroll);
    }
    
    // 초기 상태 확인
    handleScroll();

    return () => {
      if (appElement) {
        appElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuClick = (tab) => {
    // news 탭 클릭 시 모달 열기
    if (tab === 'news') {
      setIsSurveyModalOpen(true);
      setIsOpen(false); // 메뉴 닫기
      return;
    }
    
    // 해당 섹션으로 스크롤 이동
    const appElement = document.querySelector('.App');
    if (appElement) {
      let targetScrollTop = 0;
      
      switch (tab) {
        case 'story':
          // 섹션 5로 이동 (App.js에서 6번째 섹션)
          const section5 = document.querySelector('section:nth-child(6)');
          if (section5) {
            targetScrollTop = section5.offsetTop;
          }
          break;
        case 'series':
          // 섹션 6으로 이동 (App.js에서 7번째 섹션)
          const section6 = document.querySelector('section:nth-child(7)');
          if (section6) {
            targetScrollTop = section6.offsetTop;
          }
          break;
        default:
          break;
      }
      
      // 부드러운 스크롤로 이동
      if (targetScrollTop > 0) {
        appElement.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
        setIsOpen(false); // 메뉴 닫기
      }
    }
  };

  return (
    <>
      {/* 햄버거 메뉴 버튼 */}
      <button 
        className={`${styles.hamburgerButton} ${isOpen ? styles.open : ''} ${isVisible ? styles.visible : styles.hidden}`}
        onClick={toggleMenu}
      >
        <span className={styles.line}></span>
        <span className={styles.line}></span>
        <span className={styles.line}></span>
      </button>

      {/* 오버레이 */}
      {isOpen && <div className={styles.overlay} onClick={toggleMenu}></div>}

      {/* 메뉴 콘텐츠 */}
      <div className={`${styles.menuContent} ${isOpen ? styles.show : ''}`}>
        <nav className={styles.navigation}>
          <ul className={styles.menuList}>
            <li className={styles.menuItem}>
              <button onClick={() => handleMenuClick('story')}>
                워케이션에 주목하게 된 이유
              </button>
            </li>
            <li className={styles.menuItem}>
              <button onClick={() => handleMenuClick('series')}>
                워케이션 활동
              </button>
            </li>
            <li className={styles.menuItem}>
              <button onClick={() => handleMenuClick('news')}>
                워크라이프 소식 받아보기
                <span className={styles.blueDot}></span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* 설문 모달 */}
      <SurveyModal isOpen={isSurveyModalOpen} onClose={() => setIsSurveyModalOpen(false)} />
    </>
  );
};

export default HamburgerMenu;