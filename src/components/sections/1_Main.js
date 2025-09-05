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
  const attemptAutoplay = () => {
    // PC와 모바일 비디오 모두 시도
    const pcVideo = document.querySelector('[data-section="main"]');
    const mobileVideo = document.querySelector('[data-section="main-mobile"]');
    
    const videoElement = isMobile ? mobileVideo : pcVideo;
    
    if (videoElement) {
      videoElement.play().then(() => {
        updateVideoPlayState({ isPlaying: true });
      }).catch((error) => {
        updateVideoPlayState({ hasError: true });
      });
    }
  };

  // 비디오 로드 완료 후 자동재생 시도
  useEffect(() => {
    const handleVideoLoad = () => {
      // 비디오가 로드된 후 자동재생 시도
      setTimeout(() => {
        attemptAutoplay();
      }, 500); // 로딩 시간 단축
    };

    if (videosLoaded) {
      handleVideoLoad();
    }
  }, [videosLoaded]);

  // 사용자 상호작용 후 자동재생 시도
  useEffect(() => {
    const handleUserInteraction = () => {
      setTimeout(() => {
        attemptAutoplay();
      }, 100);
    };

    // 클릭, 터치, 키보드 입력 등 사용자 상호작용 감지
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true, passive: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('scroll', handleUserInteraction, { once: true, passive: true });
    // 페이지 포커스 시에도 자동재생 시도
    window.addEventListener('focus', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('focus', handleUserInteraction);
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
      id="main"
      ref={ref}
      className={styles.mainSection}
    >
      {/* PC 배경 비디오 */}
      <div className={`${styles.backgroundContainer} ${styles.pcContainer}`}>
        {!videoFallback ? (
          <video
            data-section="main"
            className={styles.backgroundVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            loading="lazy"
            poster="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S1.jpg"
            style={{ pointerEvents: 'none', width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => {
              updateVideoPlayState({ hasError: true });
            }}
            onCanPlay={() => {
              updateVideoPlayState({ hasStarted: true });
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
        {!videoFallback ? (
          <video
            data-section="main-mobile"
            className={styles.backgroundVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            loading="lazy"
            poster="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S1_mo.jpg"
            style={{ pointerEvents: 'none', width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => {
              updateVideoPlayState({ hasError: true });
            }}
            onCanPlay={() => {
              updateVideoPlayState({ hasStarted: true });
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