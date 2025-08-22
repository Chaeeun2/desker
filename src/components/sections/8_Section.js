import React, { useRef, useEffect, useState } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import styles from './8_Section.module.css';

const Section8 = () => {
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '-50px'
  });
  
  // 각 요소별 fade in을 위한 ref들
  const [mapSectionRef, mapSectionIntersecting, mapSectionHasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [mapDescriptionRef, mapDescriptionIntersecting, mapDescriptionHasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [logoSectionRef, logoSectionIntersecting, logoSectionHasIntersected] = useIntersectionObserver({ threshold: 0.3 });

  return (
    <section ref={ref} className={styles.section8}>
      <div className={styles.content}>
        <div className={styles.mainContent}>
          
          {/* 지도 섹션 */}
          <div ref={mapSectionRef} className={`${styles.mapSection} ${mapSectionHasIntersected ? styles.fadeIn : ''}`}>
            <div className={styles.mapContainer}>
              {/* 지도 이미지가 들어갈 자리 */}
              <div className={styles.mapImage}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S8.jpg" alt="양양 워케이션 지도" />
              </div>
            </div>
            
            {/* 지도 아래 설명 텍스트 */}
            <div ref={mapDescriptionRef} className={`${styles.mapDescription} ${mapDescriptionHasIntersected ? styles.fadeIn : ''}`}>
              <p>
                양양의 서핑스쿨, F&B, 공방 등 다양한 로컬 파트너와의 협업을 통해
<br/>이용자에게 한층 더 <span className={styles.highlight}>다채로운 즐거움</span>을, 로컬에는 <span className={styles.highlight}>지속 가능한 활력</span>을 더해왔습니다.
<br/>
<br/>로컬과 함께 <span className={styles.highlight}>더 깊고, 더 활기넘친</span> 워케이션. 그것이 바로 데스커가 지향한 방식이었습니다.
              </p>
            </div>
          </div>
          
          {/* 로고 그리드 섹션 */}
          <div ref={logoSectionRef} className={`${styles.logoSection} ${logoSectionHasIntersected ? styles.fadeIn : ''}`}>
            <div className={styles.logoGrid}>
              {/* 1행 */}
              <div className={styles.logoItem}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-1.jpg" alt="WSEFARM" />
              </div>
              <div className={styles.logoItem}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-2.jpg" alt="d-camp" />
              </div>
              <div className={styles.logoItem}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-3.jpg" alt="MACHO'S SACHUNKI" />
              </div>
              <div className={styles.logoItem}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-4.jpg" alt="dear" />
              </div>
              
              {/* 2행 */}
              <div className={styles.logoItem}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-5.jpg" alt="klairs" />
              </div>
              <div className={styles.logoItem}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-6.jpg" alt="Lenovo" />
              </div>
              <div className={styles.logoItem}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-7.jpg" alt="JULY" />
              </div>
              <div className={styles.logoItem}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-8.jpg" alt="TEAZEN" />
              </div>
              
              {/* 3행 */}
              <div className={styles.logoItem}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-9.jpg" alt="MONDAY COFFEE" />
              </div>
              <div className={styles.logoItem}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-10.jpg" alt="HUMBOLT" />
              </div>
              <div className={styles.logoItem}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-11.jpg" alt="iloom" />
              </div>
              <div className={styles.logoItem}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-12.jpg" alt="CORALLO" />
              </div>
              
              {/* 4행 */}
              <div className={styles.logoItem}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-13.jpg" alt="Huxley" />
              </div>
              <div className={styles.logoItem}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-14.jpg" alt="SOON. EASY" />
              </div>
              <div className={styles.logoItem}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-15.jpg" alt="UNCLE STONE" />
              </div>
              <div className={styles.logoItem}>
                <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-16.jpg" alt="김씨네과일" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section8;
