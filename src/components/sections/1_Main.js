import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import styles from './1_Main.module.css';

const Main = ({ onVisibilityChange }) => {
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '-50px'
  });

  // 롤링 텍스트 상태 제거
  const [videosLoaded, setVideosLoaded] = useState(false);
  
  // 비디오 자동재생 감지 상태
  const [videoFallbacks, setVideoFallbacks] = useState({
    left: false,
    center: false,
    right: false
  });

  // 비디오 재생 상태 모니터링
  const [videoPlayStates, setVideoPlayStates] = useState({
    left: { isPlaying: false, hasError: false, hasStarted: false },
    center: { isPlaying: false, hasError: false, hasStarted: false },
    right: { isPlaying: false, hasError: false, hasStarted: false }
  });

  // 비디오 재생 상태 체크 및 fallback 처리
  useEffect(() => {
    const checkVideoPlayback = () => {
      const newFallbacks = { ...videoFallbacks };
      let hasChanges = false;
      
      Object.keys(videoPlayStates).forEach(key => {
        const state = videoPlayStates[key];
        const shouldFallback = state.hasError || (state.hasStarted && !state.isPlaying);
      
        
        if (shouldFallback && !newFallbacks[key]) {
          newFallbacks[key] = true;
          hasChanges = true;
        }
      });
      
      // 변경사항이 있을 때만 상태 업데이트
      if (hasChanges) {
        setVideoFallbacks(newFallbacks);
      }
    };

    checkVideoPlayback();
  }, [videoPlayStates]); // videoFallbacks 의존성 제거



  // 비디오 재생 상태 업데이트 함수
  const updateVideoPlayState = (section, updates) => {
    setVideoPlayStates(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  // 자동재생 강제 시도 함수
  const attemptAutoplay = (section) => {
    const videoElement = document.querySelector(`[data-section="${section}"]`);
    if (videoElement) {
      videoElement.play().then(() => {
        updateVideoPlayState(section, { isPlaying: true });
      }).catch((error) => {
        updateVideoPlayState(section, { hasError: true });
      });
    }
  };

  // 비디오 로드 완료 후 자동재생 시도
  useEffect(() => {
    const handleVideoLoad = () => {
      // 모든 비디오가 로드된 후 자동재생 시도
      setTimeout(() => {
        attemptAutoplay('left');
        attemptAutoplay('center');
        attemptAutoplay('right');
      }, 1000); // 1초 후 시도
    };

    if (videosLoaded) {
      handleVideoLoad();
    }
  }, [videosLoaded]);

  // 사용자 상호작용 후 자동재생 시도
  useEffect(() => {
    const handleUserInteraction = () => {
      setTimeout(() => {
        attemptAutoplay('left');
        attemptAutoplay('center');
        attemptAutoplay('right');
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

  // 비디오 소스 URL들 (mp4 파일로 교체 필요)
  const videoSources = {
    left: 'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/0605_SOOB_DESKER_15s_1_FINAL.mp4', // 실제 mp4 URL로 교체
    center: 'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/0605_SOOB_DESKER_15s_2_FINAL.mp4', // 실제 mp4 URL로 교체
    right: 'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/0605_SOOB_DESKER_15s_3_FINAL.mp4' // 실제 mp4 URL로 교체
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
      {/* 3개 분할 배경 */}
      <div className={styles.backgroundContainer}>
        {/* 왼쪽 영역 - 쇼츠 */}
        <div className={styles.leftSection}>
          <div className={styles.videoContainer}>
            {!videoFallbacks.left ? (
              <video
                data-section="left"
                className={styles.video}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onError={() => {
                  updateVideoPlayState('left', { hasError: true });
                }}
                onCanPlay={() => {
                  updateVideoPlayState('left', { hasStarted: true });
                }}
                onPlay={() => {
                  updateVideoPlayState('left', { isPlaying: true });
                }}
                onPause={() => {
                  updateVideoPlayState('left', { isPlaying: false });
                }}
              >
                <source src={videoSources.left} type="video/mp4" />
                {/* 비디오 로딩 실패 시 대체 이미지로 fallback */}
              </video>
            ) : (
              <div className={styles.fallbackImage}>
                <img 
                  src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S1-1.jpg" 
                  alt="Left Section Background"
                  className={styles.video}
                />
              </div>
            )}
            <div className={styles.textOverlay}>
              {/* 롤링 텍스트를 "WORK"로 고정 */}
              <h2 className={styles.overlayText}>WORK</h2>
              
              {/* 모바일에서 추가로 표시될 텍스트들 */}
              <h2 className={styles.overlayText} style={{display: 'none'}}>ON THE</h2>
              <h2 className={styles.overlayText} style={{display: 'none'}}>BEACH</h2>
            </div>
          </div>
        </div>

        {/* 중앙 영역 - 새로운 쇼츠 */}
        <div className={styles.centerSection}>
          <div className={styles.videoContainer}>
            {!videoFallbacks.center ? (
              <video
                data-section="center"
                className={styles.video}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onError={() => {
                  updateVideoPlayState('center', { hasError: true });
                }}
                onCanPlay={() => {
                  updateVideoPlayState('center', { hasStarted: true });
                }}
                onPlay={() => {
                  updateVideoPlayState('center', { isPlaying: true });
                }}
                onPause={() => {
                  updateVideoPlayState('center', { isPlaying: false });
                }}
              >
                <source src={videoSources.center} type="video/mp4" />
              </video>
            ) : (
              <div className={styles.fallbackImage}>
                <img 
                  src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S1-2.jpg" 
                  alt="Center Section Background"
                  className={styles.video}
                />
              </div>
            )}
            <div className={styles.textOverlay}>
              <h2 className={styles.overlayText}>ON THE</h2>
            </div>
          </div>
        </div>

        {/* 오른쪽 영역 - 새로운 쇼츠 */}
        <div className={styles.rightSection}>
          <div className={styles.videoContainer}>
            {!videoFallbacks.right ? (
              <video
                data-section="right"
                className={styles.video}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onError={() => {
                  updateVideoPlayState('right', { hasError: true });
                }}
                onCanPlay={() => {
                  updateVideoPlayState('right', { hasStarted: true });
                }}
                onPlay={() => {
                  updateVideoPlayState('right', { isPlaying: true });
                }}
                onPause={() => {
                  updateVideoPlayState('right', { isPlaying: false });
                }}
              >
                <source src={videoSources.right} type="video/mp4" />
              </video>
            ) : (
              <div className={styles.fallbackImage}>
                <img 
                  src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S1-3.jpg" 
                  alt="Right Section Background"
                  className={styles.video}
                />
              </div>
            )}
            <div className={styles.textOverlay}>
              <h2 className={styles.overlayText}>BEACH</h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Main;