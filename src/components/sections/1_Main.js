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

  // 5초마다 텍스트 변경
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [texts.length]);

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
            <iframe
              src="https://www.youtube.com/embed/oDBWmq6Gf_A?autoplay=1&mute=1&loop=1&playlist=oDBWmq6Gf_A&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
              title="Left Shorts"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.video}
            />
                        <div className={styles.textOverlay}>
              <div className="rolling_wrap" style={{width: '400px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
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
            </div>
          </div>
        </div>

        {/* 중앙 영역 - 새로운 쇼츠 */}
        <div className={styles.centerSection}>
          <div className={styles.videoContainer}>
            <iframe
              src="https://www.youtube.com/embed/wYPBUV3V9j4?autoplay=1&mute=1&loop=1&playlist=wYPBUV3V9j4&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
              title="Center Shorts - New Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.video}
            />
            <div className={styles.textOverlay}>
              <h2 className={styles.overlayText}>ON THE</h2>
            </div>
          </div>
        </div>

        {/* 오른쪽 영역 - 새로운 쇼츠 */}
        <div className={styles.rightSection}>
          <div className={styles.videoContainer}>
            <iframe
              src="https://www.youtube.com/embed/n_R2ULPbLmM?autoplay=1&mute=1&loop=1&playlist=n_R2ULPbLmM&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
              title="Right Shorts - New Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.video}
            />
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
