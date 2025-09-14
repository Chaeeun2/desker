import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import styles from './1_Main.module.css';

const Main = ({ onVisibilityChange }) => {
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '-50px'
  });

  // 디바이스 및 비디오 상태
  const [isMobile, setIsMobile] = useState(false);
  const [videosLoaded, setVideosLoaded] = useState(false);
  const [videoFallback, setVideoFallback] = useState(false);
  
  // 디바이스 감지
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // 단일 비디오 재생 상태 모니터링
  const [videoPlayState, setVideoPlayState] = useState({
    isPlaying: false,
    hasError: false,
    hasStarted: false,
    retryCount: 0
  });

  // 비디오 재생 상태 체크 및 재시도 로직
  useEffect(() => {
    // 5회 이상 재시도 실패 시 fallback 표시
    if (videoPlayState.retryCount >= 5) {
      setVideoFallback(true);
      return;
    }
    
    // 재생 실패 시 1초 후 재시도
    if (videoPlayState.hasError || (videoPlayState.hasStarted && !videoPlayState.isPlaying)) {
      const retryTimer = setTimeout(() => {
        attemptAutoplay();
        setVideoPlayState(prev => ({ 
          ...prev, 
          retryCount: prev.retryCount + 1,
          hasError: false 
        }));
      }, 1000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [videoPlayState]);



  // 비디오 재생 상태 업데이트 함수
  const updateVideoPlayState = (updates) => {
    setVideoPlayState(prev => ({
      ...prev,
      ...updates
    }));
  };

  // 자동재생 강제 시도 함수
  const attemptAutoplay = async () => {
    // PC와 모바일 비디오 모두 시도
    const pcVideo = document.querySelector('[data-section="main"]');
    const mobileVideo = document.querySelector('[data-section="main-mobile"]');
    
    const videoElement = isMobile ? mobileVideo : pcVideo;
    
    if (videoElement) {
      try {
        // 비디오 준비 상태 확인
        if (videoElement.readyState < 3) {
          await new Promise((resolve) => {
            const handleCanPlay = () => {
              videoElement.removeEventListener('canplay', handleCanPlay);
              resolve();
            };
            videoElement.addEventListener('canplay', handleCanPlay);
            videoElement.load(); // 강제 로드
          });
        }
        
        // 음소거 확인
        videoElement.muted = true;
        videoElement.volume = 0;
        
        // 재생 시도
        await videoElement.play();
        updateVideoPlayState({ 
          isPlaying: true, 
          hasError: false
        });
        
        // 재생 상태 지속적 모니터링
        const playCheckInterval = setInterval(() => {
          if (videoElement.paused || videoElement.ended) {
            videoElement.play().catch(() => {
              clearInterval(playCheckInterval);
            });
          }
        }, 2000);
        
        // 5분 후 모니터링 중단
        setTimeout(() => {
          clearInterval(playCheckInterval);
        }, 300000);
        
      } catch (error) {
        console.warn('Video autoplay failed:', error);
        updateVideoPlayState({ hasError: true });
      }
    }
  };

  // 비디오 로드 완료 후 자동재생 시도 (강화된 버전)
  useEffect(() => {
    const handleVideoLoad = () => {
      // 즉시 재생 시도
      attemptAutoplay();
      
      // 연속 재시도 (총 3번)
      setTimeout(() => attemptAutoplay(), 200);
      setTimeout(() => attemptAutoplay(), 800);
      setTimeout(() => attemptAutoplay(), 2000);
    };

    if (videosLoaded) {
      handleVideoLoad();
    }
  }, [videosLoaded]);
  
  // 페이지 로드 완료 후 추가 자동재생 시도
  useEffect(() => {
    const handlePageLoad = () => {
      setTimeout(() => attemptAutoplay(), 100);
      setTimeout(() => attemptAutoplay(), 1000);
      setTimeout(() => attemptAutoplay(), 3000);
    };
    
    if (document.readyState === 'complete') {
      handlePageLoad();
    } else {
      window.addEventListener('load', handlePageLoad);
      return () => window.removeEventListener('load', handlePageLoad);
    }
  }, []);

  // 사용자 상호작용 후 자동재생 시도 (강화된 버전)
  useEffect(() => {
    const handleUserInteraction = () => {
      attemptAutoplay();
      
      // 추가 재시도 로직
      setTimeout(() => {
        attemptAutoplay();
      }, 1000);
    };

    // 다양한 상호작용 이벤트 감지
    const events = [
      'click', 'touchstart', 'touchend', 'keydown', 'scroll', 
      'mousedown', 'pointerdown', 'gesturestart', 'contextmenu'
    ];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { 
        once: true, 
        passive: event.includes('touch') || event === 'scroll' 
      });
    });
    
    // 페이지 가시성 변경 시에도 재생 시도
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(() => attemptAutoplay(), 500);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleUserInteraction);
    window.addEventListener('pageshow', handleUserInteraction);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleUserInteraction);
      window.removeEventListener('pageshow', handleUserInteraction);
    };
  }, []);

  // 섹션 1 배경 영상은 항상 로드되어야 함
  useEffect(() => {
    setVideosLoaded(true);
  }, []);

  // 가시성 변경을 부모 컴포넌트로 전달
  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(isIntersecting);
    }
  }, [isIntersecting, onVisibilityChange]);

  // 비디오 재생 상태 업데이트 함수

  // PC/모바일 다른 비디오 소스 URL들
  const videoSources = {
    pc: 'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S1_final.mp4',
    mobile: 'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S1_final_mo.mp4'
  };

  // 5초마다 텍스트 변경 제거
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, [texts.length]);



  // 비디오 재생 상태 업데이트 함수

  return (
    <section 
      id="intro"
      ref={ref}
      className={styles.mainSection}
    >

      {/* PC 배경 비디오 */}
      <div className={`${styles.backgroundContainer} ${styles.pcContainer}`}>

{/* 하단 화살표 SVG */}
        <div className={styles.arrowDownContainer} style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '50%',
            width: 'auto',
            height: '80px',
          zIndex: 2,
          display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0px',
          color: 'white'
          }}>
          <p style={{ fontSize: '20px' }}>scroll</p>
        <svg 
          className={styles.arrowDown}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="none" 
          stroke="white" 
          strokeWidth="0.8" 
          strokeLinecap="round" 
            strokeLinejoin="round"
            style={{
              width: '30px',
              height: '30px',
            }}
        >
          <path d="M5 7l5 5 5-5"/>
          </svg>
          </div>

        {!videoFallback ? (
          <video
            data-section="main"
            className={styles.backgroundVideo}
            autoPlay
            muted
            loop
            playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="false"
            preload="auto"
            controls={false}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture={true}
            disableRemotePlayback={true}
            style={{ 
              pointerEvents: 'none', 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              WebkitMediaControls: 'none',
              WebkitMediaControlsPanel: 'none'
            }}
            onError={() => {
              updateVideoPlayState({ hasError: true });
            }}
            onCanPlay={() => {
              updateVideoPlayState({ hasStarted: true });
              // canPlay 이벤트 시에도 재생 시도
              setTimeout(() => attemptAutoplay(), 50);
            }}
            onPlay={() => {
              updateVideoPlayState({ isPlaying: true });
            }}
            onPause={() => {
              updateVideoPlayState({ isPlaying: false });
            }}
          >
            <source src={videoSources.pc} type="video/mp4" />
          </video>
        ) : (
          <div className={styles.fallbackImage}>
            <img 
              src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S1.jpg"
              alt="Main Section Background"
              className={styles.backgroundVideo}
            />
          </div>
        )}
      </div>

      {/* 모바일 배경 비디오 */}
      <div className={`${styles.backgroundContainer} ${styles.mobileContainer}`}>


{/* 하단 화살표 SVG */}
        <div className={styles.arrowDownContainer} style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '50%',
            width: 'auto',
            height: '80px',
          zIndex: 2,
          display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0px',
          color: 'white'
          }}>
          <p style={{ fontSize: '18px' }}>scroll</p>
        <svg 
          className={styles.arrowDown}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="none" 
          stroke="white" 
          strokeWidth="0.8" 
          strokeLinecap="round" 
            strokeLinejoin="round"
            style={{
              width: '30px',
              height: '30px',
            }}
        >
          <path d="M5 7l5 5 5-5"/>
          </svg>
          </div>
        {!videoFallback ? (
          <video
            data-section="main-mobile"
            className={styles.backgroundVideo}
            autoPlay
            muted
            loop
            playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="false"
            preload="auto"
            controls={false}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture={true}
            disableRemotePlayback={true}
            style={{ 
              pointerEvents: 'none', 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              WebkitMediaControls: 'none',
              WebkitMediaControlsPanel: 'none'
            }}
            onError={() => {
              updateVideoPlayState({ hasError: true });
            }}
            onCanPlay={() => {
              updateVideoPlayState({ hasStarted: true });
              // canPlay 이벤트 시에도 재생 시도
              setTimeout(() => attemptAutoplay(), 50);
            }}
            onPlay={() => {
              updateVideoPlayState({ isPlaying: true });
            }}
            onPause={() => {
              updateVideoPlayState({ isPlaying: false });
            }}
          >
            <source src={videoSources.mobile} type="video/mp4" />
          </video>
        ) : (
          <div className={styles.fallbackImage}>
            <img 
              src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S1_mo.jpg"
              alt="Main Section Background"
              className={styles.backgroundVideo}
            />
          </div>
        )}
      </div>
        
        {/* 3분할 텍스트 오버레이 유지 */}
        <div className={styles.textOverlayContainer}>
          <div className={styles.leftTextOverlay}>
            <div className={styles.textOverlay}>
              <h2 className={styles.overlayText}>WORK</h2>
              {/* 모바일에서만 추가 텍스트 표시 */}
              {isMobile && <h2 className={styles.overlayText}>ON THE</h2>}
              {isMobile && <h2 className={styles.overlayText}>BEACH</h2>}
            </div>
          </div>
          
          {/* 데스크톱에서만 중앙, 오른쪽 텍스트 표시 */}
          {!isMobile && (
            <div className={styles.centerTextOverlay}>
              <div className={styles.textOverlay}>
                <h2 className={styles.overlayText}>ON THE</h2>
              </div>
            </div>
          )}
          
          {!isMobile && (
            <div className={styles.rightTextOverlay}>
              <div className={styles.textOverlay}>
                <h2 className={styles.overlayText}>BEACH</h2>
              </div>
            </div>
          )}
        </div>
    </section>
  );
};

export default Main;