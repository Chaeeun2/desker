import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { db } from '../../admin/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from './2_Section.module.css';

const Section2 = ({ onVisibilityChange }) => {
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '-50px'
  });

  // 가시성 상태 변경을 부모 컴포넌트에 전달
  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(isIntersecting);
    }
  }, [isIntersecting, onVisibilityChange]);

  const marqueeRef = useRef(null);
  const cloneRef = useRef(null);
  const containerRef = useRef(null);
  const [galleryImages, setGalleryImages] = useState([]);

  // Firebase에서 갤러리 이미지 로드
  useEffect(() => {
    const loadGalleryImages = async () => {
      try {
        const docRef = doc(db, 'settings', 'gallery');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setGalleryImages(docSnap.data().images || []);
        } else {
          // 기본 이미지들
          const defaultImages = [
            'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-1.jpg',
            'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-2.jpg',
            'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-3.jpg',
            'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-4.jpg',
            'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-5.jpg',
            'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-6.jpg'
          ];
          setGalleryImages(defaultImages);
        }
      } catch (error) {
        // Firebase 접근 실패 시 기본 이미지 사용
        const defaultImages = [
          'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-1.jpg',
          'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-2.jpg',
          'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-3.jpg',
          'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-4.jpg',
          'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-5.jpg',
          'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S2-6.jpg'
        ];
        setGalleryImages(defaultImages);
      }
    };

    loadGalleryImages();
  }, []);

  // RunningMessage 스타일의 부드러운 무한 스크롤 애니메이션
  useEffect(() => {
    let animationId;
    let pos = 0;
    const speed = 1; // 스크롤 속도
    const direction = 1; // 방향 (1: 왼쪽으로, -1: 오른쪽으로)

    const animate = () => {
      let adjustedSpeed = speed * direction;

      pos -= adjustedSpeed;

      if (marqueeRef.current && cloneRef.current) {
        marqueeRef.current.style.left = `${pos}px`;
        cloneRef.current.style.left = `${pos + marqueeRef.current.offsetWidth}px`;

        if (direction === 1 && pos <= -marqueeRef.current.offsetWidth) {
          pos = 0;
        } else if (direction === -1 && pos >= 0) {
          pos = -marqueeRef.current.offsetWidth;
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  const renderImages = () =>
    galleryImages.map((image, index) => (
      <div key={index} className={styles.imageWrapper}>
        <img src={image} alt={`Slide ${index + 1}`} />
      </div>
    ));

  return (
    <section
      id="section2"
      ref={ref}
      className={styles.section2}
    >
      <div 
        className={styles.imageSliderContainer}
        ref={containerRef}
      >
        <div className={styles.sliderWrapper}>
          <div ref={marqueeRef} className={styles.imageSlider}>
            {Array.from({ length: 10 }).map((_, i) => (
              <React.Fragment key={i}>{renderImages()}</React.Fragment>
            ))}
          </div>
          <div ref={cloneRef} className={styles.imageSlider} id="marqueeClone">
            {Array.from({ length: 10 }).map((_, i) => (
              <React.Fragment key={`clone-${i}`}>{renderImages()}</React.Fragment>
            ))}
          </div>
        </div>
      </div>
      
      {/* 하단 텍스트 */}
      <div className={styles.textContent}>
        <motion.p
          className={styles.koreanText}
          initial={{ opacity: 0, y: 30 }}
          animate={hasIntersected ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeInOut" }}
        >
          푸른 바다를 마주하며,
<br/>
          당신의 일과 쉼을 위한 새로운 워크라이프의 시작.
        </motion.p>
        <motion.h2
          className={styles.englishText}
          initial={{ opacity: 0, y: 30 }}
          animate={hasIntersected ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeInOut" }}
        >
          DESKER WORKATION
        </motion.h2>
      </div>
    </section>
  );
};

export default Section2;