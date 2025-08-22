import React, { useRef, useEffect, useState } from 'react';
import styles from './9_Section.module.css';

const Section9 = () => {
  const sectionRef = useRef(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // 각 텍스트의 opacity 상태
  const [text1Opacity, setText1Opacity] = useState(1); // 텍스트1은 1에서 시작
  const [text2Opacity, setText2Opacity] = useState(0);
  const [text3Opacity, setText3Opacity] = useState(0);
  
  // 각 텍스트의 translateY 상태
  const [text1TranslateY, setText1TranslateY] = useState(0);
  const [text2TranslateY, setText2TranslateY] = useState(0);
  
  // 스페이서 표시 상태
  const [showSpacer, setShowSpacer] = useState(true);
  
  // triggerPoint 상태 추가
  const [triggerPoint, setTriggerPoint] = useState(null);
  const [hasSetTrigger, setHasSetTrigger] = useState(false);
  const triggerPointRef = useRef(null); // 즉시 참조를 위한 ref
  const hasSetTriggerRef = useRef(false); // hasSetTrigger를 위한 ref
  const [isAnimationComplete, setIsAnimationComplete] = useState(false); // 애니메이션 완료 상태
  const isAnimationCompleteRef = useRef(false); // 즉시 반영을 위한 ref

  // 모바일 감지 (768px 이하)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 모바일용과 데스크톱용 텍스트
  const getMobileTexts = () => ({
    text2: `일하는 방식이<br/>더욱 <span class="highlight">나</span>다울 수 있도록.`,
    text3: `데스커는 앞으로도<br/>새로운 <span class="highlight">WORK-LIFE</span>의<br/>가능성을 상상합니다.`
  });

  const getDesktopTexts = () => ({
    text2: `일하는 방식이<br/>더욱 <span class="highlight">나</span>다울 수 있도록.`,
    text3: `데스커는 앞으로도<br/>새로운 <span class="highlight">WORK-LIFE</span>의 가능성을 상상합니다.`
  });

  const currentTexts = isMobile ? getMobileTexts() : getDesktopTexts();
  
  // 모바일일 때 스크롤 거리 조정 (절반으로 줄임)
  const getScrollDistance = (desktopDistance) => {
    return isMobile ? desktopDistance / 2 : desktopDistance;
  };
  
  useEffect(() => {
    const handleScroll = () => {
      
      const appElement = document.querySelector('.App');
      const scrollTop = appElement ? appElement.scrollTop : 0;
      
      // 섹션 9가 화면에 보일 때 디버깅 로그 및 애니메이션 시작
      if (sectionRef.current) {
        const sectionTop = sectionRef.current.offsetTop;
        const sectionBottom = sectionTop + sectionRef.current.offsetHeight;

        // 섹션 9의 top이 처음 0에 도달했을 때 triggerPoint 설정
        if (!hasSetTriggerRef.current && scrollTop >= sectionTop) {
          // 섹션9가 화면 상단에 정확히 도달했는지 확인
          const sectionTopPosition = sectionTop;
          const currentScrollTop = scrollTop;
          
          // 섹션9가 sticky로 고정되기 시작하는 정확한 지점
          if (currentScrollTop >= sectionTopPosition) {
            setTriggerPoint(sectionTopPosition); // 섹션의 실제 top 위치를 triggerPoint로 사용
            triggerPointRef.current = sectionTopPosition;
            hasSetTriggerRef.current = true;
          }
        }
        
        // 리셋 후 재시작을 위한 triggerPoint 재설정 (섹션 9 근처에 도달했을 때)
        // hasSetTrigger 상태와 상관없이 triggerPoint가 null이면 재설정
        if (triggerPointRef.current === null && scrollTop >= sectionTop - window.innerHeight) {
          
          const sectionTopPosition = sectionTop;
          setTriggerPoint(sectionTopPosition); // 섹션의 실제 top 위치를 triggerPoint로 사용
          triggerPointRef.current = sectionTopPosition;
          hasSetTriggerRef.current = true;
        }
        
        // 디버깅: triggerPoint 설정 상태 확인
        if (scrollTop >= sectionTop && scrollTop < sectionBottom) {
        }
        
        // 애니메이션 리셋 조건: 트리거포인트-뷰포트 높이만큼 올라가면 리셋
        // 또는 이미 리셋된 상태에서 섹션9 위로 올라가면 리셋
        if ((triggerPointRef.current !== null && scrollTop < triggerPointRef.current - window.innerHeight) ||
            (triggerPointRef.current === null && scrollTop < sectionTop - window.innerHeight)) {
          
          // 상태 완전 리셋
          setIsAnimationComplete(false);
          isAnimationCompleteRef.current = false;
          setShowSpacer(true);
          setText1Opacity(1); // 텍스트1은 1로 리셋
          setText2Opacity(0);
          setText3Opacity(0);
          setText1TranslateY(0);
          setText2TranslateY(0);
          
          // triggerPoint 관련 상태도 완전히 리셋
          setTriggerPoint(null);
          triggerPointRef.current = null;
          hasSetTriggerRef.current = false;
          
          // sticky 상태로 복원
          if (sectionRef.current) {
            sectionRef.current.style.position = 'sticky';
            sectionRef.current.style.top = '0';
          }
        }
        
        // 섹션 9가 화면에 보일 때 디버깅 로그
        // triggerPoint가 설정된 후에는 더 유연한 조건으로 애니메이션 시작
        if ((scrollTop >= sectionTop && scrollTop < sectionBottom) || 
            (triggerPointRef.current !== null && scrollTop >= triggerPointRef.current - window.innerHeight)) {
          
          // triggerPoint가 설정된 후에만 애니메이션 시작
          if (triggerPointRef.current !== null && !isAnimationCompleteRef.current) {
            
            const scrollDiff = Math.max(0, scrollTop - triggerPointRef.current); // 음수 방지
            const steps = Math.floor(scrollDiff / getScrollDistance(100)); // 100px마다 1단계 (모바일에서는 50px)
            
            // 텍스트 1: 10~20단계에서만 사라짐 (1 → 0), 이후에는 0 유지
            let newText1Opacity = 1; // 기본값은 1
            if (steps > 10 && steps <= 20) {
              newText1Opacity = Math.max(0, 1 - (steps - 10) * 0.1); // 1 → 0 (100px마다 0.1씩 감소, 모바일에서는 50px마다)
            } else if (steps > 20) {
              newText1Opacity = 0; // 20단계 이후에는 0으로 유지
            }
            
            // 텍스트 2: 20~30단계에서 나타나고 30~40단계에서 사라짐 (0 → 1 → 0)
            let newText2Opacity = 0;
            if (steps >= 20 && steps <= 30) {
              newText2Opacity = (steps - 20) * 0.1; // 0 → 1 (100px마다 0.1씩 증가, 모바일에서는 50px마다)
            } else if (steps > 30 && steps <= 40) {
              newText2Opacity = Math.max(0, 1 - (steps - 30) * 0.1); // 1 → 0 (100px마다 0.1씩 감소, 모바일에서는 50px마다)
            }
            
            // 텍스트 3: 40~50단계에서 나타남 (0 → 1)
            let newText3Opacity = 0;
            if (steps >= 40) {
              newText3Opacity = Math.min(1, (steps - 40) * 0.1); // 0 → 1 (100px마다 0.1씩 증가, 모바일에서는 50px마다)
            }
            
            // 섹션3과 동일한 translateY 로직: 사라질 때만 translateY 계산
            // 텍스트1: 나타날 때는 translateY = 0, 사라질 때만 위로 이동
            if (steps <= 10) {
              // 나타날 때: translateY = 0 (가운데 고정)
              setText1TranslateY(0);
            } else if (steps <= 20) {
              // 사라질 때: translateY 계산 (위로 이동)
              const translateY = (1.0 - newText1Opacity) * 30;
              setText1TranslateY(translateY);
            }
            
            // 텍스트2: 나타날 때는 translateY = 0, 사라질 때만 위로 이동
            if (steps >= 20 && steps <= 30) {
              // 나타날 때: translateY = 0 (가운데 고정)
              setText2TranslateY(0);
            } else if (steps > 30 && steps <= 40) {
              // 사라질 때: translateY 계산 (위로 이동)
              const translateY = (1.0 - newText2Opacity) * 30;
              setText2TranslateY(translateY);
            }
            
            // 애니메이션 완료 체크 (텍스트 3이 완성되면)
            if (newText3Opacity >= 1.0 && !isAnimationCompleteRef.current) {
              setIsAnimationComplete(true);
              isAnimationCompleteRef.current = true; // ref도 동시에 업데이트
              
              // 최종 상태 고정 (섹션 3처럼)
              fixFinalState();
            } else if (!isAnimationCompleteRef.current) {
              // 애니메이션이 완료되지 않은 경우에만 opacity 변경
              setText1Opacity(newText1Opacity);
              setText2Opacity(newText2Opacity);
              setText3Opacity(newText3Opacity);
            } 
          } 
          // 애니메이션 완료 후에는 텍스트 상태를 변경하지 않음 (fixFinalState에서 이미 설정됨)
        } else {
          // 섹션 9 밖에서는 애니메이션이 완료되지 않은 경우에만 초기 상태로 설정
          if (!isAnimationCompleteRef.current) {
            setText2Opacity(0);
            setText3Opacity(0);
          }
        }
      }
    };

    const appElement = document.querySelector('.App');
    if (appElement) {
      appElement.addEventListener('scroll', handleScroll);
      handleScroll(); // 초기 상태 확인
      return () => {
        appElement.removeEventListener('scroll', handleScroll);
      };
    } 
  }, []);

  const fixFinalState = () => {
    // 1. 스페이서 해제
    setShowSpacer(false);
    
    // 2. 텍스트 상태 고정 (텍스트 1은 0.0으로 숨김, 텍스트 3을 1.0으로 유지)
    setText1Opacity(0); // 텍스트1은 0으로 숨김
    setText2Opacity(0);
    setText3Opacity(1); // 텍스트 3을 완성된 상태로 고정
    
    // 3. .App의 scrollTop을 트리거포인트로 강제 이동
    const appElement = document.querySelector('.App');
    if (appElement && triggerPointRef.current !== null) {
      appElement.scrollTop = triggerPointRef.current;
    }
    
    // 4. sticky 해제 (자유스크롤)
    if (sectionRef.current) {
      sectionRef.current.style.position = 'relative';
      sectionRef.current.style.top = 'auto';
    }
  };

  return (
    <>
      <section ref={sectionRef} className={styles.section9}>
        <div className={styles.content}>
          <div className={styles.mainContent}>
            
            {/* 텍스트 1 - 사라질 때만 translateY 변화 */}
            <div 
              className={styles.textContainer}
              style={{ 
                opacity: text1Opacity, // 텍스트1의 opacity를 1에서 시작하도록 수정
                transform: `translate(-50%, calc(-50% - ${text1TranslateY}px))`
              }}
            >
              <h2><img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/desker.png"/></h2>
            </div>
            
            {/* 텍스트 2 - 사라질 때만 translateY 변화 */}
            <div 
              className={styles.textContainer}
              style={{ 
                opacity: text2Opacity,
                transform: `translate(-50%, calc(-50% - ${text2TranslateY}px))`
              }}
            >
              <h2 dangerouslySetInnerHTML={{ __html: currentTexts.text2 }} />
            </div>
            
            {/* 텍스트 3 - 가운데 고정 */}
            <div 
              className={styles.textContainer}
              style={{ 
                opacity: text3Opacity,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <h2 dangerouslySetInnerHTML={{ __html: currentTexts.text3 }} />
            </div>
            
          </div>
        </div>
      </section>
      
      {/* 스크롤 애니메이션을 위한 투명한 스페이서 - 섹션 외부 */}
      {showSpacer && (
        <div 
          style={{
            height: '550vh', // 5000px 애니메이션에 맞춤 (50단계 * 100px)
            width: '100%',
            background: 'transparent',
            pointerEvents: 'none'
          }}
        />
      )}
    </>
  );
};

export default Section9;
