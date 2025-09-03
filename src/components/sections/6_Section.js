import React, { useEffect, useRef, useState } from 'react';
import styles from './6_Section.module.css';

const Section6 = () => {
  const sectionRef = useRef(null);
  const videoSectionRef = useRef(null);
  const campaignTitleRef = useRef(null);
  const campaignDescriptionRef = useRef(null);
  const brandMessageRef = useRef(null);
  const beachWorkInfoRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1080;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // 초기화 완료 후 observer 설정
    if (!isInitialized) return;
    
    const observerOptions = {
      threshold: 0.3, // 더 높은 임계값으로 설정하여 더 빨리 감지
      rootMargin: '-50px' // 더 큰 마진으로 설정하여 더 빨리 감지
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.fadeIn);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // 각 요소를 개별적으로 observer에 추가
    if (videoSectionRef.current) observer.observe(videoSectionRef.current);
    if (campaignTitleRef.current) observer.observe(campaignTitleRef.current);
    if (campaignDescriptionRef.current) observer.observe(campaignDescriptionRef.current);
    if (brandMessageRef.current) observer.observe(brandMessageRef.current);
    if (beachWorkInfoRef.current) observer.observe(beachWorkInfoRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isInitialized]); // isInitialized만 의존성으로 설정

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  return (
    <section id="series" ref={sectionRef} className={styles.section6}>
      <div className={styles.content}>
        <div className={styles.mainContent}>
          {/* 모바일에서는 텍스트를 먼저, 데스크톱에서는 비디오를 먼저 */}
          {isMobile ? (
            <>
              {/* 모바일 순서: 캠페인 타이틀 먼저 */}
              <div className={styles.campaignContent}>
                <div ref={campaignTitleRef} className={styles.campaignTitle}>
                  <h2>데스커가 제안한<br/>새로운 워크 라이프,</h2>
                  <p className={styles.englishTitle}>DESKER<br/>WORKATION</p>
                </div>
              </div>

              {/* 모바일 순서: 영상 두 번째 */}
              <div ref={videoSectionRef} className={styles.videoSection}>
                {/* 비디오 로드 로직 제거 */}
                <div className={styles.videoContainer}>
                  <iframe
                    src="https://www.youtube.com/embed/-fdnYORFIzo?controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=-fdnYORFIzo"
                    title="DESKER WORKATION - WORK ON THE BEACH"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className={styles.video}
                    loading="lazy"
                  />
                </div>
              </div>

              {/* 모바일 순서: 캠페인 설명 마지막 */}
              <div className={styles.campaignContent}>
                <div ref={campaignDescriptionRef} className={styles.campaignDescription}>
                  <p>
                    2022년 본격적으로 시작된<br/>새로운 워크라이프 '데스커 워케이션',<br/>그 시작을 함께한 "WORK ON THE BEACH"<br/>캠페인을 지금 확인해 보세요!
                                      <br/><button className={styles.campaignButton}>
                    <a href="https://youtube.com/playlist?list=PLB7PYmHaa-5plHT1jBKvVLdmIqryLUvcB&si=HO5erAp1VVufIwnq" target="_blank">캠페인 영상 더보기 →</a>
                  </button>
                  </p>
                </div>
              </div>
            </>
          ) : (
              <>
                
                              {/* 데스크톱 순서: 텍스트 나중에 */}
              <div className={styles.campaignContent}>
                <div ref={campaignTitleRef} className={styles.campaignTitle}>
                  <h2>데스커가 제안한<br/>새로운 워크 라이프,</h2>
                  <span className={styles.englishTitle}>DESKER WORKATION</span>
                </div>

                <div ref={campaignDescriptionRef} className={styles.campaignDescription}>
                  <p>
                    2022년 본격적으로 시작된 새로운 워크라이프 '데스커 워케이션',<br/>그 시작을 함께한 "WORK ON THE BEACH" 캠페인을 지금 확인해 보세요!
                  </p>
                  <button className={styles.campaignButton}>
                    <a href="https://youtube.com/playlist?list=PLB7PYmHaa-5plHT1jBKvVLdmIqryLUvcB&si=HO5erAp1VVufIwnq" target="_blank">캠페인 영상 더보기 →</a>
                  </button>
                </div>
              </div>
              {/* 데스크톱 순서: 비디오 먼저 */}
              <div ref={videoSectionRef} className={styles.videoSection}>
                {/* 비디오 로드 로직 제거 */}
                <div className={styles.videoContainer}>
                  <iframe
                    src="https://www.youtube.com/embed/-fdnYORFIzo?controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=-fdnYORFIzo"
                    title="DESKER WORKATION - WORK ON THE BEACH"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className={styles.video}
                    loading="lazy"
                  />
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Section6;
