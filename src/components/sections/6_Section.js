import React, { useEffect, useRef } from 'react';
import styles from './6_Section.module.css';

const Section6 = () => {
  const sectionRef = useRef(null);
  const videoSectionRef = useRef(null);
  const campaignTitleRef = useRef(null);
  const campaignDescriptionRef = useRef(null);
  const brandMessageRef = useRef(null);
  const beachWorkInfoRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-50px'
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
  }, []);

  return (
    <section ref={sectionRef} className={styles.section6}>
      <div className={styles.content}>
        <div className={styles.mainContent}>
          {/* 메인 비디오 섹션 */}
          <div ref={videoSectionRef} className={styles.videoSection}>
            <div className={styles.videoContainer}>
              <iframe
                src="https://www.youtube.com/embed/-fdnYORFIzo?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=-fdnYORFIzo"
                title="DESKER WORKATION - WORK ON THE BEACH"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className={styles.video}
              />
            </div>
          </div>

                  <div className={styles.campaignContent}>
          {/* 캠페인 제목 */}
          <div ref={campaignTitleRef} className={styles.campaignTitle}>
            <h2>데스커가 제안한<br/>새로운 워크 라이프,</h2>
            <span className={styles.englishTitle}>DESKER WORKATION</span>
          </div>

          {/* 캠페인 설명 */}
          <div ref={campaignDescriptionRef} className={styles.campaignDescription}>
            <p>
              2022년 본격적으로 시작된 새로운 워크라이프 ‘데스커 워케이션’,
<br/>그 시작을 함께한 “WORK OH THE BEACH” 캠페인을 지금 확인해 보세요!
            </p>
            <button className={styles.campaignButton}>
              <a href="https://youtube.com/playlist?list=PLB7PYmHaa-5plHT1jBKvVLdmIqryLUvcB&si=HO5erAp1VVufIwnq" target="_blank">캠페인 영상 더보기 →</a>
            </button>
                      </div>
                      </div>
        </div>
      </div>
    </section>
  );
};

export default Section6;
