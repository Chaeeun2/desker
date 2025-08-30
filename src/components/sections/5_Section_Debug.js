import React, { useEffect } from 'react';

// 섹션5 디버깅 전용 컴포넌트
const Section5Debug = () => {
  useEffect(() => {
    let lastScrollTop = 0;
    let scrollEvents = [];
    let isInSection5 = false;
    
    const handleScroll = (e) => {
      const appElement = document.querySelector('.App');
      const scrollTop = appElement?.scrollTop || 0;
      const scrollDiff = scrollTop - lastScrollTop;
      const currentTime = Date.now();
      
      // 섹션5 영역 확인 (더 정확한 위치 계산)
      const section5Top = window.innerHeight * 4; // 대략적인 섹션5 시작 위치
      const section5Bottom = window.innerHeight * 5; // 대략적인 섹션5 끝 위치
      
      // 섹션5 영역에서만 모니터링 (여유 공간 제거)
      const isInSection5 = scrollTop >= section5Top && scrollTop <= section5Bottom;
      
      const wasInSection5 = isInSection5;
      
      // 섹션5에 진입했을 때만 로그 출력
      if (isInSection5 && !wasInSection5) {
        console.log('🔍 ENTERING SECTION5 - Starting scroll monitoring');
      }
      
      // 섹션5에서 벗어났을 때 로그 출력
      if (!isInSection5 && wasInSection5) {
        console.log('🔍 LEAVING SECTION5 - Stopping scroll monitoring');
        scrollEvents = []; // 이벤트 기록 초기화
      }
      
      // 섹션5 영역에서만 스크롤 이벤트 상세 분석
      if (isInSection5) {
        const eventInfo = {
          time: currentTime,
          scrollTop,
          scrollDiff,
          target: e.target?.className || 'unknown',
          type: e.type,
          isTrusted: e.isTrusted
        };
        
        scrollEvents.push(eventInfo);
        
        // 연속된 이벤트 감지 (최근 3개만 유지)
        if (scrollEvents.length > 3) {
          scrollEvents = scrollEvents.slice(-3);
        }
        
        console.log('🔍 SECTION5 SCROLL EVENT:', eventInfo);
        
        // 빠른 연속 스크롤 감지 (스크롤 요동 의심)
        if (scrollEvents.length >= 2) {
          const timeDiff = scrollEvents[scrollEvents.length - 1].time - scrollEvents[scrollEvents.length - 2].time;
          if (timeDiff < 50 && Math.abs(scrollDiff) > 10) {
            console.log('🚨 POTENTIAL SCROLL SHAKE DETECTED IN SECTION5!', {
              events: scrollEvents,
              timeDiff,
              scrollDiff
            });
          }
        }
        
        // 강제 스크롤 감지 (isTrusted가 false면 프로그래밍적 스크롤)
        if (!e.isTrusted) {
          console.log('🚨 FORCED SCROLL DETECTED IN SECTION5!', {
            scrollTop,
            scrollDiff,
            stackTrace: new Error().stack
          });
        }
        
        // 의심스러운 스크롤 패턴 감지 (고정된 거리, 빠른 연속)
        if (Math.abs(scrollDiff) === 156.5 || Math.abs(scrollDiff) === 103) {
          console.log('🚨 SUSPICIOUS SCROLL PATTERN DETECTED!', {
            scrollDiff,
            isTrusted: e.isTrusted,
            target: e.target?.className,
            stackTrace: new Error().stack,
            // 추가 정보
            currentTime: new Date().toISOString(),
            scrollTop,
            section5Range: [section5Top, section5Bottom]
          });
          
          // 섹션3의 강제 스크롤 여부 확인
          const section3Element = document.querySelector('.section3');
          if (section3Element) {
            const section3Rect = section3Element.getBoundingClientRect();
            const isSection3Visible = section3Rect.top <= window.innerHeight && section3Rect.bottom >= 0;
            console.log('🔍 Section3 visibility check:', {
              isVisible: isSection3Visible,
              rect: {
                top: section3Rect.top,
                bottom: section3Rect.bottom,
                height: section3Rect.height
              }
            });
          }
        }
      }
      
      lastScrollTop = scrollTop;
    };
    
    // 섹션5 디버깅을 위한 스크롤 이벤트 리스너 추가
    // passive: true로 설정하여 성능에 영향을 최소화
    const appElement = document.querySelector('.App');
    if (appElement) {
      appElement.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    console.log('🔍 Section5 Debug Component Mounted - Monitoring scroll events in Section5 only');
    
    return () => {
      if (appElement) {
        appElement.removeEventListener('scroll', handleScroll);
      }
      console.log('🔍 Section5 Debug Component Unmounted');
    };
  }, []);
  
  return null; // 보이지 않는 디버깅 컴포넌트
};

export default Section5Debug;
