import React, { useState } from 'react';
import styles from './HamburgerMenu.module.css';
import SurveyModal from './SurveyModal';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

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
        className={`${styles.hamburgerButton} ${isOpen ? styles.open : ''}`}
        onClick={toggleMenu}
        aria-label="메뉴"
      >
        <span className={styles.line}></span>
        <span className={styles.line}></span>
        <span className={styles.line}></span>
      </button>

      {/* 메뉴 오버레이 */}
      {isOpen && (
        <div className={styles.overlay} onClick={toggleMenu}></div>
      )}

      {/* 메뉴 컨텐츠 */}
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