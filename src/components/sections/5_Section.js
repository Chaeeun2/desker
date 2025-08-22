import React, { useEffect, useRef, useState } from 'react';
import styles from './5_Section.module.css';

const Section5 = () => {
  const panelRefs = useRef([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 모바일용 텍스트 배열 (본문만)
  const getMobileTexts = () => [
    {
      p: "탁 트인 바다와 자연 속에서<br/>모니터 너머로 여유를 느끼고,<br/>'서핑'과 다양한 로컬 문화가 살아 숨쉬는 활기찬 공간<br/><br/>마음이 환기되고, 감각이 깨어나는<br/>'양양'에서 데스커 워케이션의 여정을 시작하게 됩니다."
    },
    {
      p: "잠깐 머물다 가는 단절된 휴식이 아닌,<br/>온전히 나만의 리듬을 회복하길 바랬습니다.<br/><br/>그래서 데스커는 일주일의 시간을 보낼 수 있도록<br/>스테이부터 고민했습니다."
    },
    {
      p: "그래서 데스커는 '일하기 좋은 환경'을<br/>최우선으로 고려하여 설계했습니다.<br/><br/>누구든, 각자의 방식으로 일할 수 있도록<br/>개인 업무 공간부터 회의실, 폰부스까지<br/>쉼과 일이 공존하면서도, 일에 몰입할 수 있는<br/>환경을 완성했습니다."
    },
    {
      p: "일하는 장소를 바꾸는 것만으로<br/>진짜 '환기'가 될 수 있을까요?<br/><br/>요가, 서핑, 조향, 커피 등의 프로그램으로<br/>몸과 마음의 긴장을 풀고,<br/>새로운 사람들과 연결되어 자극을 받고,<br/>자전거를 타며 나에게 집중할 수 있도록<br/><br/>순간들이 쌓여 '환기'의 가치를 생생히 경험하는 시간<br/>데스커가 꿈꾼 워케이션은 그런 시간이었습니다."
    }
  ];

  // 데스크톱용 텍스트 배열 (본문만)
  const getDesktopTexts = () => [
    {
      p: "탁 트인 바다와 자연 속에서 모니터 너머로 여유를 느끼고,​<br/>'서핑'과 다양한 로컬 문화가 살아 숨쉬는 활기찬 공간​​<br/><br/>마음이 환기되고, 감각이 깨어나는​<br/>'양양'에서 데스커 워케이션의 여정을 시작하게 됩니다."
    },
    {
      p: "잠깐 머물다 가는 단절된 휴식이 아닌,​<br/>온전히 나만의 리듬을 회복하길 바랬습니다.​​<br/><br/>그래서 데스커는 일주일의 시간을 보낼 수 있도록​<br/>스테이부터 고민했습니다.​"
    },
    {
      p: "그래서 데스커는 '일하기 좋은 환경'을 최우선으로 고려하여 설계했습니다.<br/><br/>누구든, 각자의 방식으로 일할 수 있도록<br/>개인 업무 공간부터 회의실, 폰부스까지<br/>쉼과 일이 공존하면서도, 일에 몰입할 수 있는 환경을 완성했습니다."
    },
    {
      p: "일하는 장소를 바꾸는 것만으로 진짜 '환기'가 될 수 있을까요?<br /><br />요가, 서핑, 조향, 커피 등의 프로그램으로 몸과 마음의 긴장을 풀고,<br />새로운 사람들과 연결되어 자극을 받고, 자전거를 타며 나에게 집중할 수 있도록<br /><br />순간들이 쌓여 '환기'의 가치를 생생히 경험하는 시간<br/>데스커가 꿈꾼 워케이션은 그런 시간이었습니다."
    }
  ];

  // 현재 사용할 텍스트 배열 선택
  const currentTexts = isMobile ? getMobileTexts() : getDesktopTexts();

  useEffect(() => {
    const observerOptions = {
      threshold: 0.5, // 요소의 50%가 보일 때 트리거
      rootMargin: '0px 0px -20% 0px' // 화면 중앙 근처에서 트리거
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const panel = entry.target;
          const panelImage = panel.querySelector('[data-panel-image]');
          const panelContent = panel.querySelector('[data-panel-content]');
          
          // 이미지 먼저 fade in
          if (panelImage) {
            panelImage.classList.add(styles.fadeIn);
          }
          
          // h3는 0.3초 후 fade in
          setTimeout(() => {
            if (panelContent) {
              panelContent.classList.add(styles.fadeIn);
            }
          }, 300);
          
          // p는 0.6초 후 fade in
          setTimeout(() => {
            if (panelContent) {
              const h3 = panelContent.querySelector('h3');
              const p = panelContent.querySelector('p');
              if (h3) h3.classList.add(styles.fadeIn);
              if (p) p.classList.add(styles.fadeIn);
            }
          }, 600);
          
          // 한 번만 실행되도록 observer 해제
          observer.unobserve(panel);
        }
      });
    }, observerOptions);

    // 각 패널을 observer에 추가
    panelRefs.current.forEach((panelRef) => {
      if (panelRef) {
        observer.observe(panelRef);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const addPanelRef = (el) => {
    if (el && !panelRefs.current.includes(el)) {
      panelRefs.current.push(el);
    }
  };

  return (
    <section className={styles.section5}>
      <div className={styles.content}>
        <div className={styles.mainContent}>
          {/* 4개 패널 그리드 */}
          <div className={styles.panelGrid}>
            {/* 패널 1: 바다가 보이는 오피스 (유튜브 영상) */}
            <div className={styles.panel} ref={addPanelRef}>
              <div className={styles.panelImage} data-panel-image>
                <div className={styles.videoContainer}>
                  <iframe
                    src="https://www.youtube.com/embed/-ae3O7u2IZM?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=-ae3O7u2IZM"
                    title="바다가 보이는 오피스"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className={styles.video}
                  />
                </div>
              </div>
              <div className={styles.panelContent} data-panel-content>
                <h3><span className={styles.highlight}>어디에서 일하면</span><br/>진짜 숨통이 트일까?</h3>
                <p dangerouslySetInnerHTML={{ __html: currentTexts[0].p }} />
              </div>
            </div>

            {/* 패널 2: 발코니 뷰 (이미지) */}
            <div className={styles.panel} ref={addPanelRef}>
              <div className={styles.panelContent} data-panel-content>
                <h3>일이 아닌,<br/><span className={styles.highlight}>나를 위한 시간</span>이 되려면?</h3>
                <p dangerouslySetInnerHTML={{ __html: currentTexts[1].p }} />
              </div>
              <div className={styles.panelImage} data-panel-image>
                <div className={styles.imageContainer}>
                  <img 
                    src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/5-2.jpg" 
                    className={styles.image}
                  />
                </div>
              </div>
            </div>

            {/* 패널 3: 깔끔한 데스크 (이미지) */}
            <div className={styles.panel} ref={addPanelRef}>
              <div className={styles.panelImage} data-panel-image>
                <div className={styles.imageContainer}>
                  <img 
                    src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/5-3.jpg" 
                    className={styles.image}
                  />
                </div>
              </div>
              <div className={styles.panelContent} data-panel-content>
                <h3><span className={styles.highlight}>휴양지</span>에서도,<br/>정말 일할 수 있을까?</h3>
                <p dangerouslySetInnerHTML={{ __html: currentTexts[2].p }} />
              </div>
            </div>

            {/* 패널 4: 요가/운동 (이미지) */}
            <div className={styles.panel} ref={addPanelRef}>
              <div className={styles.panelContent} data-panel-content>
                <h3><span className={styles.highlight}>일만 하다 돌아가는</span><br/>워케이션이 되지 않으려면</h3>
                <p dangerouslySetInnerHTML={{ __html: currentTexts[3].p }} />
              </div>
              <div className={styles.panelImage} data-panel-image>
                <div className={styles.imageContainer}>
                  <img 
                    src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/5-4.jpg" 
                    className={styles.image}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section5;
