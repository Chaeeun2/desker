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
      let animationId = null;
      
      // 무한 스크롤 함수
      const startInfiniteScroll = () => {
        // 이전 애니메이션 정리
        if (animationId) {
          clearTimeout(animationId);
        }
        
        // 슬라이더의 실제 너비에서 뷰포트 너비를 뺀 값만큼 이동
        const sliderWidth = slider.scrollWidth;
        const viewportWidth = window.innerWidth;
        const translateValue = -(sliderWidth - viewportWidth);
        
        
        // CSS transition 설정
        slider.style.transition = 'transform 180s linear';
        
        // 슬라이더 이동
        slider.style.transform = `translateX(${translateValue}px)`;
        
        // 180초 후에 원점으로 이동하고 재시작
        animationId = setTimeout(() => {
          
          // transition 제거하고 원점으로 즉시 이동
          slider.style.transition = 'none';
          slider.style.transform = 'translateX(0)';
          
          // 약간의 지연 후 다시 시작
          setTimeout(() => {
            startInfiniteScroll(); // 재귀적으로 다시 시작
          }, 200); // 200ms 지연
          
        }, 180000); // 정확히 180초
      };
      
      // 무한 스크롤 시작
      startInfiniteScroll();
      
      return () => {
        // cleanup - 모든 타이머 정리
        if (animationId) {
          clearTimeout(animationId);
        }
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
          animate={hasIntersected ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeInOut" }}
        >
          푸른 바다를 마주하며,
<br/>
          당신의 일과 쉼을 위한 새로운 워크라이프의 시작.
        </motion.p>
        <motion.h2
          className={styles.englishText}
          initial={{ opacity: 0, y: 30 }}
          animate={hasIntersected ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5, delay: 0.8, ease: "easeInOut" }}
        >
          DESKER WORKATION
        </motion.h2>
      </div>
    </section>
  );
};

export default Section2;