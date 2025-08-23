import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import styles from './1_Main.module.css';

const Main = () => {
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '-50px'
  });

  // 롤링 텍스트 상태
  const texts = ['WORK', 'STORY', 'MEMORY'];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [videosLoaded, setVideosLoaded] = useState(false);
  
  // 자동재생 실패 감지 상태
  const [videoFallbacks, setVideoFallbacks] = useState({
    left: false,
    center: false,
    right: false
  });

  // 5초마다 텍스트 변경
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [texts.length]);

  // 섹션 1 배경 영상은 항상 로드되어야 함 (모바일 자동재생 필수)
  useEffect(() => {
    setVideosLoaded(true);
  }, []);

  // 자동재생 실패 감지 로직
  useEffect(() => {
    const checkAutoplaySupport = async () => {
      // 3초 후에 자동재생이 실행되지 않으면 대체 이미지로 전환
      const timeout = setTimeout(() => {
        const iframes = document.querySelectorAll('iframe[src*="youtube"]');
        
        iframes.forEach((iframe, index) => {
          const section = index === 0 ? 'left' : index === 1 ? 'center' : 'right';
          
          // iframe이 로드되었지만 자동재생이 시작되지 않은 경우를 감지
          try {
            // 모바일에서는 자동재생 정책상 대부분 실패하므로 모바일 감지
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
            
            if (isMobile) {
              setVideoFallbacks(prev => ({
                ...prev,
                [section]: true
              }));
            }
          } catch (error) {
            console.log('Autoplay detection error:', error);
            setVideoFallbacks(prev => ({
              ...prev,
              [section]: true
            }));
          }
        });
      }, 3000);

      return () => clearTimeout(timeout);
    };

    if (videosLoaded) {
      checkAutoplaySupport();
    }
  }, [videosLoaded]);

  return (
    <section 
      ref={ref}
      className={styles.mainSection}
    >
      {/* 3개 분할 배경 */}
      <div className={styles.backgroundContainer}>
        {/* 왼쪽 영역 - 쇼츠 */}
        <div className={styles.leftSection}>
          <div className={styles.videoContainer}>
            {!videoFallbacks.left ? (
              <iframe
                src="https://www.youtube.com/embed/oDBWmq6Gf_A?autoplay=1&mute=1&loop=1&playlist=oDBWmq6Gf_A&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&fs=0&disablekb=1"
                title="Left Shorts"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className={styles.video}
              />
            ) : (
              <div className={styles.fallbackImage}>
                <img 
                  src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/section1-left-fallback.jpg" 
                  alt="Left Section Background"
                  className={styles.video}
                />
              </div>
            )}
            <div className={styles.textOverlay}>
              {/* 모바일에서 세로로 표시될 모든 텍스트 */}
              <div className="rolling_wrap" style={{width: '400px', height: '65px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
                <h2 style={{opacity: 0, visibility: 'hidden', height: 0, overflow: 'hidden'}}>WORK</h2>
                <AnimatePresence mode="sync">
                  <motion.h2
                    key={currentTextIndex}
                    className={styles.overlayText}
                    initial={{ 
                      rotateX: -90, 
                      y: 50, 
                      opacity: 0,
                      scale: 0.9
                    }}
                    animate={{ 
                      rotateX: 0, 
                      y: 0, 
                      opacity: 1,
                      scale: 1
                    }}
                    exit={{ 
                      rotateX: 90, 
                      y: -50, 
                      opacity: 0,
                      scale: 0.9
                    }}
                    transition={{ 
                      duration: 0.4, 
                      ease: "easeInOut",
                      type: "tween"
                    }}
                    style={{
                      transformOrigin: "center center",
                      transformStyle: "preserve-3d"
                    }}
                  >
                    {texts[currentTextIndex]}
                  </motion.h2>
                </AnimatePresence>
              </div>
              
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
              <iframe
                src="https://www.youtube.com/embed/wYPBUV3V9j4?autoplay=1&mute=1&loop=1&playlist=wYPBUV3V9j4&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&fs=0&disablekb=1"
                title="Center Shorts - New Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className={styles.video}
              />
            ) : (
              <div className={styles.fallbackImage}>
                <img 
                  src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/section1-center-fallback.jpg" 
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
              <iframe
                src="https://www.youtube.com/embed/n_R2ULPbLmM?autoplay=1&mute=1&loop=1&playlist=n_R2ULPbLmM&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&fs=0&disablekb=1"
                title="Right Shorts - New Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className={styles.video}
              />
            ) : (
              <div className={styles.fallbackImage}>
                <img 
                  src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/section1-right-fallback.jpg" 
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
