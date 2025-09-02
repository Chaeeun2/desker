import React, { useState, useEffect, useRef } from "react";
import styles from "./MobileFloatingMenu.module.css";
import SurveyModal from "./SurveyModal";

const MobileFloatingMenu = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const lastScrollYRef = useRef(0);
  const hasReachedSection5Ref = useRef(false);
  const section5ReachTimeRef = useRef(0);

  // 섹션 3 스페이서 상태 관리
  const [section3SpacerActive, setSection3SpacerActive] = useState(true);

  // 섹션 3 스페이서 상태 이벤트 수신
  useEffect(() => {
    const handleSection3SpacerChange = (event) => {
      const { showSpacer } = event.detail;
      setSection3SpacerActive(showSpacer);
    };

    window.addEventListener("section3SpacerChange", handleSection3SpacerChange);

    return () => {
      window.removeEventListener(
        "section3SpacerChange",
        handleSection3SpacerChange
      );
    };
  }, []);

  // PC와 동일한 스크롤 로직 적용
  useEffect(() => {
    const handleScroll = () => {
      // 1단계: 섹션 3의 스페이서 상태 체크 (이벤트 기반)
      if (section3SpacerActive) {
        setIsVisible(false);
        setIsExpanded(false); // hide될 때 expanded 클래스도 제거
        return;
      }

      // 2단계: 스페이서가 비활성화된 경우에만 스크롤 위치 확인
      const appScrollTop = document.querySelector(".App")?.scrollTop || 0;
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
                setIsExpanded(false); // hide될 때 expanded 클래스도 제거
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
        setIsExpanded(false); // hide될 때 expanded 클래스도 제거
        // 섹션 5를 벗어나면 상태 초기화
        hasReachedSection5Ref.current = false;
        section5ReachTimeRef.current = 0;
      }
    };

    const appElement = document.querySelector(".App");
    if (appElement) {
      appElement.addEventListener("scroll", handleScroll);
      // 초기 상태 확인 (PC와 동일)
      handleScroll();
      return () => appElement.removeEventListener("scroll", handleScroll);
    }
  }, [section3SpacerActive]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMenuClick = (tab) => {
    
    // 메뉴 접기
    setIsExpanded(false);
    
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

  return (
    <>
      <div 
        className={`${styles.menuContainer} ${!isVisible ? styles.hidden : ""} ${isExpanded ? styles.expanded : ""}`}
      >
        {/* + 아이콘 (항상 표시, 회전 및 위치 변경) */}
        <button 
          className={`${styles.toggleButton} ${isExpanded ? styles.rotated : ""}`}
          onClick={handleToggle}
        >
          <svg 
            className={styles.plusIcon}
            viewBox="0 0 64 64" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M30.034,29.948l0,-21.983l3.741,0l0,21.983l22.203,0l0,3.741l-22.203,0l0,22.203l-3.741,0l0,-22.203l-22.008,0l0,-3.741l22.008,0Z"/>
          </svg>
        </button>
        
        {/* 메뉴 아이템들 (펼쳐진 상태에서만 표시) */}
          <div className={styles.menuItems}>
            <button
              className={styles.menuItem}
              onClick={() => handleMenuClick("story")}
            >
              워케이션에<br/>주목하게 된 이유
            </button>
            <button
              className={styles.menuItem}
              onClick={() => handleMenuClick("series")}
            >
              워케이션 활동
            </button>
            <button
              className={styles.menuItem}
              onClick={() => handleMenuClick("news")}
            >
              워크라이프 소식 받아보기
            </button>
          </div>
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
