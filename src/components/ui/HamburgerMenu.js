import React, { useState, useEffect } from 'react';
import styles from './HamburgerMenu.module.css';
import SurveyModal from './SurveyModal';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 위치 기반 간단한 가시성 제어
  useEffect(() => {
    const handleScroll = () => {
      const appElement = document.querySelector('.App');
      const scrollY = appElement?.scrollTop || 0;
      const windowHeight = window.innerHeight;
      
      // 화면 높이의 절반을 넘으면 햄버거 표시
      if (scrollY > windowHeight / 2) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
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
    // GTM 이벤트 전송 (메뉴 항목 클릭)
    if (typeof window !== 'undefined' && window.dataLayer) {
      const menuLabels = {
        'main': 'intro',
        'story': 'workation_reason',
        'series': 'workation_activities',
        'news': 'worklife_news'
      };
      
      window.dataLayer.push({
        event: 'menu_click',
        navigation_target: menuLabels[tab] || tab,
        navigation_source: 'hamburger_menu',
        section_destination: tab
      });
    }

    // news 탭 클릭 시 모달 열기
    if (tab === 'news') {
      setIsSurveyModalOpen(true);
      setIsOpen(false); // 메뉴 닫기
      return;
    }
    
    // 메뉴 닫기
    setIsOpen(false);
    
    
    // 해당 섹션으로 스크롤 이동
    const targetElement = document.getElementById(tab);
    if (targetElement) {
      // 모든 비디오 일시정지
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        video.pause();
      });
      
      // sticky와 애니메이션 비활성화
      window.disableStickyScroll = true;
      window.disableSection3Animation = true;
      window.section3AnimationComplete = true; // 섹션 3을 완료 상태로 설정
      window.isMenuScrolling = true; // 메뉴 스크롤 중 플래그
      document.body.classList.add('disable-sticky-scroll');
      
      // 섹션 3의 handleScroll을 강제로 트리거하여 상태를 즉시 업데이트
      const appElement = document.querySelector('.App');
      if (appElement) {
        // 스크롤 이벤트를 트리거하여 섹션 3이 즉시 반응하도록 함
        appElement.dispatchEvent(new Event('scroll'));
      }
      
      // section3SpacerChange 이벤트 리스너로 spacer 상태 감지
      const handleSpacerChange = (event) => {
        
        // spacer가 false가 되면 (사라지면) 스크롤 시작
        if (!event.detail.showSpacer) {
          window.removeEventListener('section3SpacerChange', handleSpacerChange);
          
          // 레이아웃이 안정되기를 기다림
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // 정확한 위치로 스크롤
              targetElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              });
            });
          });
        }
      };
      
      // 이벤트 리스너 등록
      window.addEventListener('section3SpacerChange', handleSpacerChange);
      
      // 타임아웃으로 fallback (이벤트가 발생하지 않는 경우)
      setTimeout(() => {
        window.removeEventListener('section3SpacerChange', handleSpacerChange);
        
        // 강제로 스크롤
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 500); // fallback 타이머
      
      // 완료 후 복원 (스크롤 시작 후 충분한 시간 후)
      setTimeout(() => {
        window.disableStickyScroll = false;
        window.disableSection3Animation = false;
        window.isMenuScrolling = false; // 메뉴 스크롤 완료
        // window.section3AnimationComplete는 유지 (기존 리셋 로직에 의해서만 리셋)
        document.body.classList.remove('disable-sticky-scroll');
        
        // 비디오 재생 재개
        videos.forEach(video => {
          if (video.dataset.section === tab || video.closest(`#${tab}`)) {
            video.play();
          }
        });
      }, 2000); // 스크롤이 완료될 때까지 충분한 시간
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
              <button onClick={() => handleMenuClick('main')}>
                인트로
              </button>
            </li>
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
          <div className={styles.menuFooter}>
            <a 
              href="https://differ.co.kr/about" 
              target="_blank" 
              rel="noreferrer"
              onClick={() => {
                if (typeof window !== 'undefined' && window.dataLayer) {
                  window.dataLayer.push({
                    event: 'menu_click',
                    navigation_target: 'differ_about',
                    navigation_source: 'hamburger_menu_footer',
                    external_url: 'https://differ.co.kr/about'
                  });
                }
              }}
            >
              <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/differ_menu.png" alt="Differ" />
            </a>
            <br/><br/>
            <a 
              href="https://www.desker.co.kr/" 
              target="_blank" 
              rel="noreferrer"
              onClick={() => {
                if (typeof window !== 'undefined' && window.dataLayer) {
                  window.dataLayer.push({
                    event: 'menu_click',
                    navigation_target: 'desker_main',
                    navigation_source: 'hamburger_menu_footer',
                    external_url: 'https://www.desker.co.kr/'
                  });
                }
              }}
            >
              <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/desker_menu.png" alt="Desker" />
            </a>
          </div>
        </nav>
      </div>

      {/* 설문 모달 */}
      <SurveyModal isOpen={isSurveyModalOpen} onClose={() => setIsSurveyModalOpen(false)} />
    </>
  );
};

export default HamburgerMenu;