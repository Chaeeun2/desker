import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import introImage1 from '../../assets/images/0_intro_1.png';
import introImage2 from '../../assets/images/0_intro_2.png';
import styles from './0_Intro.module.css';

const Intro = () => {
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '-50px'
  });
  
  const [animationComplete, setAnimationComplete] = useState(false);

  // Intro 화면에서 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 모든 애니메이션이 끝나면 Intro 섹션을 위로 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      // 애니메이션 완료 후 스크롤 허용
      document.body.style.overflow = 'unset';
    }, 2600); // overlay(1.5초) + image2(1초) + 0.1초 여유

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.section 
      ref={ref}
      className={styles.introSection}
      animate={animationComplete ? { y: '-100%' } : { y: 0 }}
      transition={{ 
        duration: 1, 
        delay: 0.5, // 0.5초 딜레이 후 시작
        ease: "easeInOut" 
      }}
    >
      <div className={styles.imageContainer}>
        {/* 두 번째 이미지 - 아래에서 올라오는 애니메이션 */}
        <motion.div 
          className={styles.image2}
          initial={{ y: '110%' }}
          animate={{ y: '0%' }}
          transition={{ 
            duration: 1, 
            delay: 1.6, // overlay 애니메이션 완료 후 시작
            ease: "easeOut" 
          }}
        >
          <img 
            src={introImage2} 
            style={{ width: '100%', height: 'auto' }}
          />
        </motion.div>

        {/* 첫 번째 이미지 */}
        <div className={styles.image1}>
          <img 
            src={introImage1} 
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        {/* Primary 컬러 오버레이 - 오른쪽으로 이동 애니메이션 */}
        <motion.div 
          className={styles.overlay}
          initial={{ x: 0 }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </div>
    </motion.section>
  );
};

export default Intro;
