import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import styles from './1_Main.module.css';

const Section1 = () => {
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '-50px'
  });
  
  const [videosLoaded, setVideosLoaded] = useState(false);
  
  // 화면에 보일 때만 동영상 로드
  useEffect(() => {
    if (isIntersecting && !videosLoaded) {
      setVideosLoaded(true);
    } else if (!isIntersecting && videosLoaded) {
      // 화면에서 벗어나면 동영상 언로드하여 메모리 절약
      setVideosLoaded(false);
    }
  }, [isIntersecting, videosLoaded]);

  return (
    <section ref={ref} className={styles.section1}>
      <div className={styles.content}>
        <div className={styles.mainContent}>
          {/* 배경 동영상 - 화면에 보일 때만 로드 */}
          {videosLoaded && (
            <>
              <div className={styles.videoContainer}>
                <iframe
                  src="https://www.youtube.com/embed/oDBWmq6Gf_A?autoplay=1&mute=1&loop=1&playlist=oDBWmq6Gf_A&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
                  title="DESKER Main Background Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className={styles.backgroundVideo}
                  loading="lazy"
                />
              </div>
              
              <div className={styles.videoContainer}>
                <iframe
                  src="https://www.youtube.com/embed/wYPBUV3V9j4?autoplay=1&mute=1&loop=1&playlist=wYPBUV3V9j4&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
                  title="DESKER Secondary Background Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className={styles.backgroundVideo}
                  loading="lazy"
                />
              </div>
              
              <div className={styles.videoContainer}>
                <iframe
                  src="https://www.youtube.com/embed/n_R2ULPbLmM?autoplay=1&mute=1&loop=1&playlist=n_R2ULPbLmM&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
                  title="DESKER Third Background Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className={styles.backgroundVideo}
                  loading="lazy"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Section1;
