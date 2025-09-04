import React, { useRef, useEffect, useState } from 'react';
import styles from './4_Section.module.css';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const Section4 = () => {
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '-50px'
  });
  const gifRef = useRef(null);
  const pngRef = useRef(null);
  const leftTextRef = useRef(null);
  const rightTextRef = useRef(null);
  const [gifPlayed, setGifPlayed] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showFallbackImage, setShowFallbackImage] = useState(false);
  
  // 비디오 재생 상태 모니터링
  const [videoPlayState, setVideoPlayState] = useState({
    isPlaying: false,
    hasError: false,
    hasStarted: false,
    retryCount: 0
  });

  // 비디오 재생 상태 체크 및 재시도 로직
  useEffect(() => {
    // 5회 이상 재시도 실패 시 fallback 표시
    if (videoPlayState.retryCount >= 10) {
      setShowFallbackImage(true);
      return;
    }
    
    // 재생 실패 시 500ms 후 재시도
    if (videoPlayState.hasError || (videoPlayState.hasStarted && !videoPlayState.isPlaying)) {
      const retryTimer = setTimeout(() => {
        console.log(`Section4 video retry attempt ${videoPlayState.retryCount + 1}/10`);
        attemptAutoplay();
        setVideoPlayState(prev => ({ 
          ...prev, 
          retryCount: prev.retryCount + 1,
          hasError: false 
        }));
      }, 500);
      
      return () => clearTimeout(retryTimer);
    }
  }, [videoPlayState]);
  
  // 비디오 소스 URL (mp4 파일로 교체 필요)
  const videoSource = 'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S4_final.mp4';

  // 모바일 감지 (768px 이하)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 모바일일 때 애니메이션 타이밍 조정
  const getAnimationDelay = (desktopDelay) => {
    return isMobile ? desktopDelay : desktopDelay; // 모바일에서는 2배 늦게 시작
  };

  // 자동재생 강제 시도 함수
  const attemptAutoplay = () => {
    const videoElement = document.querySelector('[data-section="section4"]');
    if (videoElement) {
      videoElement.play().then(() => {
        setVideoPlayState(prev => ({ ...prev, isPlaying: true }));
      }).catch((error) => {
        setVideoPlayState(prev => ({ ...prev, hasError: true }));
      });
    }
  };

  // 비디오 로드 완료 후 자동재생 시도
  useEffect(() => {
    const handleVideoLoad = () => {
      // 비디오가 로드된 후 자동재생 시도
      setTimeout(() => {
        attemptAutoplay();
      }, 1000); // 1초 후 시도
    };

    handleVideoLoad();
  }, []);

  // 사용자 상호작용 후 자동재생 시도
  useEffect(() => {
    const handleUserInteraction = () => {
      setTimeout(() => {
        attemptAutoplay();
      }, 100);
    };

    // 클릭, 터치, 키보드 입력 등 사용자 상호작용 감지
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // 순차적 애니메이션 실행
  useEffect(() => {
    if (hasIntersected && !gifPlayed) {
      // 1단계: 왼쪽 텍스트 나타남
      setTimeout(() => {
        if (leftTextRef.current) {
          const h3Element = leftTextRef.current.querySelector('h3');
            if (h3Element) {
              setTimeout(() => {
                h3Element.style.opacity = '1';
              }, getAnimationDelay(300)); // 모바일에서는 600ms
            
            // 텍스트1이 완전히 나타난 후 GIF 시작
            setTimeout(() => {
              if (gifRef.current) {
                // GIF를 동적으로 로드하고 재생
                gifRef.current.src = "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/s6.gif";
                gifRef.current.style.visibility = 'visible';
                gifRef.current.style.opacity = '1';
                gifRef.current.style.animationPlayState = 'running';
                setAnimationStep(2);
                
                // GIF 애니메이션이 완전히 끝난 후 PNG 표시
                setTimeout(() => {
                  if (gifRef.current && pngRef.current) {
                    // GIF를 숨기고 PNG를 표시
                    gifRef.current.style.display = 'none';
                    pngRef.current.style.display = 'block';
                    
                    setAnimationStep(3);
                  }
                }, getAnimationDelay(2600)); // 모바일에서는 5200ms
              }
            }, getAnimationDelay(300)); // 모바일에서는 600ms
          }
        }
        setAnimationStep(1);
      }, getAnimationDelay(300)); // 모바일에서는 600ms

      // 4단계: 오른쪽 텍스트 나타남 (PNG 교체와 동시에)
      setTimeout(() => {
        if (rightTextRef.current) {
          const h3Element = rightTextRef.current.querySelector('h3');
          if (h3Element) {
            h3Element.style.opacity = '1';
          }
        }
        setAnimationStep(4);
      }, getAnimationDelay(3000)); // 모바일에서는 5200ms

      setGifPlayed(true);
    }
  }, [hasIntersected, gifPlayed, isMobile]);

  return (
    <section id="story" ref={ref} className={styles.section4}>
      {/* 배경 비디오 또는 대체 이미지 */}
      <div className={styles.backgroundVideo}>
        {!showFallbackImage ? (
          <video
            data-section="section4"
            className={styles.backgroundVideoElement}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={() => {
              setVideoPlayState(prev => ({ ...prev, hasError: true }));
            }}
            onCanPlay={() => {
              setVideoPlayState(prev => ({ ...prev, hasStarted: true }));
            }}
            onPlay={() => {
              setVideoPlayState(prev => ({ ...prev, isPlaying: true }));
            }}
            onPause={() => {
              setVideoPlayState(prev => ({ ...prev, isPlaying: false }));
            }}
            onStalled={() => {
              setVideoPlayState(prev => ({ ...prev, isPlaying: false }));
            }}
          >
            <source src={videoSource} type="video/mp4" />
          </video>
        ) : (
          <img 
            src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S4.jpg" 
            alt="Section 4 Background"
            className={styles.fallbackImage}
          />
        )}
      </div>
      
      {/* 영상 위의 콘텐츠 */}
      <div className={styles.content}>
        <div className={styles.overlayContent}>
          {/* 왼쪽 텍스트1 - 첫 번째로 나타남 */}
          <div ref={leftTextRef} className={styles.leftText}>
            <h3>30만명이<br/>함께한 '데스커 워케이션'</h3>
          </div>
          
          {/* 가운데 GIF - 두 번째로 실행 후 PNG로 교체 */}
          <div className={styles.centerGif}>
            <img 
              ref={gifRef}
              alt="Center GIF" 
              className={styles.gifImage}
              style={{
                animationPlayState: 'paused',
                animationDuration: '2.3s',
                opacity: 0,
                visibility: 'hidden'
              }}
            />
            {/* PNG 이미지 - GIF 완료 후 표시 */}
            <img 
              ref={pngRef}
              src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/s6.png"
              alt="Center Image" 
              className={styles.pngImage}
              style={{
                display: 'none'
              }}
            />
          </div>
          
          {/* 오른쪽 텍스트2 - 마지막에 나타남 */}
          <div ref={rightTextRef} className={styles.rightText}>
            <h3>일의 몰입을 되찾기 위한​<br/>4년간의 여정을 소개합니다.​</h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section4;
