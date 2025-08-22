import React, { useState, useEffect, useRef } from 'react';
import styles from './MobileFloatingMenu.module.css';
import SurveyModal from './SurveyModal';

const MobileFloatingMenu = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const lastScrollYRef = useRef(0);
  const hasReachedSection5Ref = useRef(false);
  const section5ReachTimeRef = useRef(0);

  // PC와 동일한 스크롤 로직 적용
  useEffect(() => {
    const handleScroll = () => {
      // 1단계: 섹션 3의 스페이서가 활성화되어 있는지 먼저 확인
      const section3Spacer = document.querySelector('section:nth-child(4) div[style*="height: 1400vh"]');
      const section3SpacerAlt = document.querySelector('div[style*="height: 1400vh"]');
      const section3SpacerMobile = document.querySelector('section:nth-child(4) div[style*="height: 700vh"]');
      const isSection3SpacerActive = !!(section3Spacer || section3SpacerAlt || section3SpacerMobile);

      // 2단계: 스페이서가 활성화되어 있으면 무조건 숨김
      if (isSection3SpacerActive) {
        setIsVisible(false);
        return;
      }

      // 3단계: 스페이서가 비활성화된 경우에만 스크롤 위치 확인
      const appScrollTop = document.querySelector('.App')?.scrollTop || 0;
      const section5Threshold = window.innerHeight * 3.5;

      // 섹션 5에 도달했을 때만 메뉴 표시 여부 결정
      if (appScrollTop >= section5Threshold) {
        const currentScrollY = appScrollTop;
        const lastScrollY = lastScrollYRef.current;
        const currentTime = Date.now();
        
        // 섹션 5에 처음 도달했을 때는 무조건 메뉴 표시하고 시간 기록
        if (!hasReachedSection5Ref.current) {
          setIsVisible(true);
          hasReachedSection5Ref.current = true;
          section5ReachTimeRef.current = currentTime;
        } else {
          // 섹션 5 도달 후 5초가 지났는지 확인
          const timeSinceReach = currentTime - section5ReachTimeRef.current;
          const isAfter5Seconds = timeSinceReach >= 5000;
          
          if (isAfter5Seconds) {
            // 5초 후부터는 스크롤 방향 감지
            if (lastScrollY !== 0) {
              const isScrollingDown = currentScrollY > lastScrollY;
              
              if (isScrollingDown) {
                // 아래로 스크롤할 때는 숨김
                setIsVisible(false);
              } else {
                // 위로 스크롤할 때는 표시
                setIsVisible(true);
              }
            }
          } else {
            // 5초 전까지는 메뉴 계속 표시
            setIsVisible(true);
          }
        }
        
        lastScrollYRef.current = currentScrollY;
        
      } else {
        // 섹션 5 이전에는 메뉴 숨김
        setIsVisible(false);
        // 섹션 5를 벗어나면 상태 초기화
        hasReachedSection5Ref.current = false;
        section5ReachTimeRef.current = 0;
      }
    };

    const appElement = document.querySelector('.App');
    if (appElement) {
      appElement.addEventListener('scroll', handleScroll);
      return () => appElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMenuClick = (menuType) => {
    console.log(`${menuType} 메뉴 클릭됨`);
    // 여기에 각 메뉴별 동작 추가
    if (menuType === 'news') {
      setIsModalOpen(true);
      setIsExpanded(false); // 메뉴 접기
    }
  };

  return (
    <>
      <div className={`${styles.mobileFloatingMenu} ${!isVisible ? styles.hidden : ''}`}>
        {/* 메뉴 버튼들 */}
        <div className={`${styles.menuButtons} ${isExpanded ? styles.expanded : ''}`}>
          {/* 뉴스 버튼 */}
          <button 
            className={`${styles.menuButton} ${styles.newsButton}`}
            onClick={() => handleMenuClick('news')}
          >
            <div className={styles.buttonIcon}>
              <span className={styles.octopusIcon}>🐙</span>
            </div>
            {isExpanded && <span className={styles.menuLabel}>워크라이프 소식</span>}
          </button>

          {/* 설정 버튼 */}
          <button 
            className={`${styles.menuButton} ${styles.settingsButton}`}
            onClick={() => handleMenuClick('settings')}
          >
            <div className={styles.buttonIcon}>
              <span className={styles.settingsIcon}>⚙️</span>
            </div>
            {isExpanded && <span className={styles.menuLabel}>설정</span>}
          </button>

          {/* 도움말 버튼 */}
          <button 
            className={`${styles.menuButton} ${styles.helpButton}`}
            onClick={() => handleMenuClick('help')}
          >
            <div className={styles.buttonIcon}>
              <span className={styles.helpIcon}>❓</span>
            </div>
            {isExpanded && <span className={styles.menuLabel}>도움말</span>}
          </button>
        </div>

        {/* 토글 버튼 (+ 버튼) */}
        <button 
          className={`${styles.toggleButton} ${isExpanded ? styles.expanded : ''}`}
          onClick={handleToggle}
          aria-label={isExpanded ? '메뉴 접기' : '메뉴 펼치기'}
        >
          <span className={styles.plusIcon}>+</span>
        </button>
      </div>

      {/* 설문 모달 */}
      {isModalOpen && (
        <SurveyModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

export default MobileFloatingMenu;
