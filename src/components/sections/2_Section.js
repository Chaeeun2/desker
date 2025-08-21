import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import styles from './2_Section.module.css';

const Section2 = () => {
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '-50px'
  });

  const imagesRef = useRef([]);
  const sliderRef = useRef(null);

  // 원본 이미지 데이터
  const originalImages = [
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-1.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-2.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-3.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-4.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-5.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-6.jpg'
  ];

  // 이미지를 엄청 많이 복제해서 무한 스크롤 효과
  const extendedImages = [
    ...originalImages,
    ...originalImages,
    ...originalImages,
    ...originalImages,
    ...originalImages,
    ...originalImages,
    ...originalImages,
    ...originalImages,
    ...originalImages,
    ...originalImages
  ];

  // 초기 이미지 배열 설정
  useEffect(() => {
    imagesRef.current = extendedImages;
  }, []);

  // CSS transition으로 부드러운 무한 스크롤
  useEffect(() => {
    // imagesRef가 설정될 때까지 기다림
    if (!imagesRef.current || imagesRef.current.length === 0) {
      return;
    }
    
    const slider = sliderRef.current;
    
    if (slider) {
      // CSS transition 추가 - 더 부드럽고 천천히
      slider.style.transition = 'transform 210s linear';
      
      // 왼쪽에서 오른쪽으로 이동
      const moveRight = () => {
        // 슬라이더의 실제 너비에서 뷰포트 너비를 뺀 값만큼 이동
        const sliderWidth = slider.scrollWidth;
        const viewportWidth = window.innerWidth;
        const translateValue = -(sliderWidth - viewportWidth);
        
        slider.style.transform = `translateX(${translateValue}px)`;
      };
      
      // 즉시 시작하고 30초마다 반복
      moveRight(); // 즉시 첫 번째 이동 시작
      
      const interval = setInterval(() => {
        moveRight();
      }, 210000);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [extendedImages]); // extendedImages가 변경될 때마다 실행

  return (
    <section
      ref={ref}
      className={styles.section2}
    >
      <div className={styles.imageSliderContainer}>
        <div ref={sliderRef} className={styles.imageSlider}>
          {imagesRef.current.map((image, index) => (
            <div key={`${index}-${image}`} className={styles.imageWrapper}>
              <img src={image} alt={`Slide ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>
      
      {/* 하단 텍스트 */}
      <div className={styles.textContent}>
        <motion.p
          className={styles.koreanText}
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeInOut" }}
        >
          푸른 바다를 마주하며,
<br/>
          당신의 일과 쉼을 위한 새로운 워크라이프의 시작.
        </motion.p>
        <motion.h2
          className={styles.englishText}
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.5, ease: "easeInOut" }}
        >
          DESKER WORKATION
        </motion.h2>
      </div>
    </section>
  );
};

export default Section2;