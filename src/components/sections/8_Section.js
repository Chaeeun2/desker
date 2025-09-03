import React, { useRef, useEffect, useState } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import styles from './8_Section.module.css';

const Section8 = () => {
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '-50px'
  });
  
  const [isMobile, setIsMobile] = useState(false);
  
  // 슬라이더 ref들
  const firstRowMarqueeRef = useRef(null);
  const firstRowCloneRef = useRef(null);
  const secondRowMarqueeRef = useRef(null);
  const secondRowCloneRef = useRef(null);
  
  // 모바일 감지 (768px 이하)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 모바일용과 데스크톱용 본문 텍스트
  const getMobileTexts = () => ({
    mapDescription: `양양의 서핑스쿨, F&B, 공방 등<br/>다양한 로컬 파트너와의 협업을 통해<br/>이용자에게 한층 더 <span style="font-weight: 800; color: var(--color-primary);">다채로운 즐거움</span>을,<br/>로컬에는 <span style="font-weight: 800; color: var(--color-primary);">지속 가능한 활력</span>을 더해왔습니다.<br/><br/>로컬과 함께 <span style="font-weight: 800; color: var(--color-primary);">더 깊고, 더 활기넘친</span> 워케이션.<br/>그것이 바로 데스커가 지향한 방식이었습니다.`
  });

  const getDesktopTexts = () => ({
    mapDescription: `양양의 서핑스쿨, F&B, 공방 등 다양한 로컬 파트너와의 협업을 통해<br/>이용자에게 한층 더 <span style="font-weight: 800; color: var(--color-primary);">다채로운 즐거움</span>을, 로컬에는 <span  style="font-weight: 800; color: var(--color-primary);">지속 가능한 활력</span>을 더해왔습니다.<br/><br/>로컬과 함께 <span style="font-weight: 800; color: var(--color-primary);">더 깊고, 더 활기넘친</span> 워케이션. 그것이 바로 데스커가 지향한 방식이었습니다.`
  });

  const currentTexts = isMobile ? getMobileTexts() : getDesktopTexts();
  
  // 로고 데이터 분리
  const firstRowLogos = [
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-1.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-2.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-3.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-4.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-5.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-6.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-7.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-8.jpg'
  ];

  const secondRowLogos = [
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-9.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-10.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-11.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-12.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-13.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-14.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-15.jpg',
    'https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo-16.jpg'
  ];

  // 첫 번째 줄 애니메이션 (왼쪽으로 이동)
  useEffect(() => {
    if (!isMobile) return;
    
    let animationId;
    let pos = 0;
    const speed = 1;
    const direction = 1; // 왼쪽으로

    const animate = () => {
      const adjustedSpeed = speed * direction;

      pos -= adjustedSpeed;

      if (firstRowMarqueeRef.current && firstRowCloneRef.current) {
        firstRowMarqueeRef.current.style.left = `${pos}px`;
        firstRowCloneRef.current.style.left = `${pos + firstRowMarqueeRef.current.offsetWidth}px`;

        if (direction === 1 && pos <= -firstRowMarqueeRef.current.offsetWidth) {
          pos = 0;
        } else if (direction === -1 && pos >= 0) {
          pos = -firstRowMarqueeRef.current.offsetWidth;
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [isMobile]);

  // 두 번째 줄 애니메이션 (오른쪽으로 이동)
  useEffect(() => {
    if (!isMobile) return;
    
    let animationId;
    let pos = secondRowMarqueeRef.current ? -secondRowMarqueeRef.current.offsetWidth : 0;
    const speed = 1;
    const direction = -1; // 오른쪽으로

    const animate = () => {
      const adjustedSpeed = speed * direction;

      pos -= adjustedSpeed;

      if (secondRowMarqueeRef.current && secondRowCloneRef.current) {
        secondRowMarqueeRef.current.style.left = `${pos}px`;
        secondRowCloneRef.current.style.left = `${pos + secondRowMarqueeRef.current.offsetWidth}px`;

        if (direction === 1 && pos <= -secondRowMarqueeRef.current.offsetWidth) {
          pos = 0;
        } else if (direction === -1 && pos >= 0) {
          pos = -secondRowMarqueeRef.current.offsetWidth;
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [isMobile]);

  // 각 요소별 fade in을 위한 ref들
  const [mapSectionRef, mapSectionIntersecting, mapSectionHasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [mapDescriptionRef, mapDescriptionIntersecting, mapDescriptionHasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [logoSectionRef, logoSectionIntersecting, logoSectionHasIntersected] = useIntersectionObserver({ threshold: 0.3 });

  // 로고 렌더링 함수들
  const renderFirstRowLogos = () =>
    firstRowLogos.map((logo, index) => (
      <div key={index} className={styles.logoItem}>
        <img src={logo} alt={`Logo ${index + 1}`} />
      </div>
    ));

  const renderSecondRowLogos = () =>
    secondRowLogos.map((logo, index) => (
      <div key={index} className={styles.logoItem}>
        <img src={logo} alt={`Logo ${index + 9}`} />
      </div>
    ));

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
              <p dangerouslySetInnerHTML={{ __html: currentTexts.mapDescription }} />
            </div>
          </div>
          
          {/* 로고 그리드 섹션 */}
          <div ref={logoSectionRef} className={`${styles.logoSection} ${logoSectionHasIntersected ? styles.fadeIn : ''}`}>
            {isMobile ? (
              // 모바일: 두 줄 슬라이더 (768px 이하) - RunningMessage 방식
              <div className={styles.logoSlider}>
                {/* 첫 번째 줄 슬라이더 (왼쪽으로 이동) */}
                <div className={styles.sliderRow}>
                  <div className={styles.sliderWrapper}>
                    <div ref={firstRowMarqueeRef} className={styles.sliderTrack}>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <React.Fragment key={i}>{renderFirstRowLogos()}</React.Fragment>
                      ))}
                    </div>
                    <div ref={firstRowCloneRef} className={styles.sliderTrack} id="firstRowClone">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <React.Fragment key={`clone-${i}`}>{renderFirstRowLogos()}</React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* 두 번째 줄 슬라이더 (오른쪽으로 이동) */}
                <div className={styles.sliderRow}>
                  <div className={styles.sliderWrapper}>
                    <div ref={secondRowMarqueeRef} className={styles.sliderTrack}>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <React.Fragment key={i}>{renderSecondRowLogos()}</React.Fragment>
                      ))}
                    </div>
                    <div ref={secondRowCloneRef} className={styles.sliderTrack} id="secondRowClone">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <React.Fragment key={`clone-${i}`}>{renderSecondRowLogos()}</React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // 데스크톱: 기존 그리드
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section8;
