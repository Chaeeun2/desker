import React, { useState, useEffect, useRef } from 'react';
import styles from './FloatingMenu.module.css';
import SurveyModal from './SurveyModal';
import MobileFloatingMenu from './MobileFloatingMenu';

const FloatingMenu = () => {
  const [activeTab, setActiveTab] = useState('story');
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const lastScrollYRef = useRef(0);
  const hasReachedSection5Ref = useRef(false);
  const section5ReachTimeRef = useRef(0);

  // 모바일 감지 (768px 이하)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    
    // news 탭 클릭 시 모달 열기
    if (tab === 'news') {
      setIsModalOpen(true);
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
        case 'activities':
          // 섹션 7으로 이동 (App.js에서 8번째 섹션)
          const section7 = document.querySelector('section:nth-child(8)');
          if (section7) {
            targetScrollTop = section7.offsetTop;
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
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // 1단계: 섹션 3의 스페이서가 활성화되어 있는지 먼저 확인
      const section3Spacer = document.querySelector('section:nth-child(4) div[style*="height: 1400vh"]');
      const section3SpacerAlt = document.querySelector('div[style*="height: 1400vh"]');
      const isSection3SpacerActive = !!(section3Spacer || section3SpacerAlt);

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
        
        // 현재 스크롤 위치에 따른 active 탭 설정
        updateActiveTabBasedOnScroll(appScrollTop);
        
      } else {
        setIsVisible(false);
        // 섹션 5를 벗어나면 상태 초기화
        hasReachedSection5Ref.current = false;
        section5ReachTimeRef.current = 0;
      }
    };

    // 현재 스크롤 위치에 따른 active 탭을 업데이트하는 함수
    const updateActiveTabBasedOnScroll = (scrollTop) => {
      const section5 = document.querySelector('section:nth-child(6)');
      const section6 = document.querySelector('section:nth-child(7)');
      const section7 = document.querySelector('section:nth-child(8)');
      
      if (section5 && section6 && section7) {
        const section5Top = section5.offsetTop;
        const section6Top = section6.offsetTop;
        const section7Top = section7.offsetTop;
        const section7Bottom = section7Top + section7.offsetHeight;
        
        // 현재 스크롤 위치가 어느 섹션에 있는지 확인
        if (scrollTop >= section5Top && scrollTop < section6Top) {
          setActiveTab('story');
        } else if (scrollTop >= section6Top && scrollTop < section7Top) {
          setActiveTab('series');
        } else if (scrollTop >= section7Top && scrollTop < section7Bottom) {
          setActiveTab('activities');
        }
      }
    };

    // 스크롤 이벤트 리스너 추가
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

  return (
    <>
      {isMobile ? (
        <MobileFloatingMenu />
      ) : (
        <div className={`${styles.floatingMenu} ${!isVisible ? styles.hidden : ''}`}>
          <div className={styles.menuContainer}>
            {/* 네비게이션 메뉴 */}
            <div className={styles.navItems}>
              <button
                className={`${styles.navItem} ${activeTab === 'story' ? styles.active : ''}`}
                onClick={() => handleTabClick('story')}
              >
                <span className={styles.navText}>워케이션에 주목하게 된 이유</span>
                {activeTab === 'story' && <span className={styles.dottedUnderline}></span>}
              </button>

              <button
                className={`${styles.navItem} ${activeTab === 'series' ? styles.active : ''}`}
                onClick={() => handleTabClick('series')}
              >
                <span className={styles.navText}>워케이션 활동</span>
                {activeTab === 'series' && <span className={styles.dottedUnderline}></span>}
              </button>

              <button
                className={`${styles.navItem} ${activeTab === 'news' ? styles.active : ''}`}
                onClick={() => handleTabClick('news')}
              >
                <span className={styles.navText}>워크라이프 소식 받아보기</span>
                <span className={styles.blueDot}></span>
                {activeTab === 'news' && <span className={styles.dottedUnderline}></span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 설문 모달 */}
      <SurveyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default FloatingMenu;
