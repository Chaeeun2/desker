import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import styles from './4_Section.module.css';

const Section4 = () => {
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '-50px'
  });

  return (
    <section
      ref={ref}
      className={styles.section4}
    >
      {/* 배경 이미지 */}
      <div className={styles.backgroundImage}></div>
      
      {/* 가운데 텍스트 */}
      <motion.div
        className={styles.centerText}
        initial={{ opacity: 0, y: 30 }}
        animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      >
        여기에 텍스트를 입력하세요
      </motion.div>
    </section>
  );
};

export default Section4;
