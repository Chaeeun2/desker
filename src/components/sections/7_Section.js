import React, { useEffect, useRef, useState } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import styles from './7_Section.module.css';

const Section7 = () => {
  const sectionRef = useRef(null);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // 모바일 감지
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
      p: "바다 위에서 파도를 기다리는 시간은<br/>일에서 벗어나는 것이 아니라,<br/>다시 몰입을 위한 리듬을 찾는 순간이었습니다.<br/><br/>오전에는 업무에 집중하고,<br/>오후에는 바다에서 서핑을 즐기며<br/>몰입과 이완이 자연스럽게 오가는 흐름 속에서<br/>몸과 마음의 환기하는 시간을 경험할 수 있었습니다."
    },
    {
      p: "일과 쉼의 경계를 허물고<br/>자연 속에서 새로운 영감을 찾고자 했습니다.<br/><br/>오전에는 집중력이 높은 시간을 활용해<br/>업무에 몰입하고,<br/>오후에는 자연 속에서 산책하며<br/>새로운 아이디어를 발견할 수 있었습니다."
    },
    {
      p: "야근과 격무속에서도 미래를 만들어가는<br/>스타트업에게 쉼은 보상이자,<br/>다시 나아가기 위한 숨고르기라 생각했습니다.<br/><br/>데스커는 디캠프와 함께 바다 위에서 D.DAY를 열고,<br/>일과 쉼이 공존하는 스타트업의<br/>새로운 문화를 만들어갔습니다."
    },
    {
      p: `일하는 공간에서도<br/>웃음과 감정의 환기가 필요하다고 생각했습니다.<br/><br/>데스커는 다양한 브랜드, 아티스트와의 협업을 통해<br/>잠시 머무는 순간에도 여유와 웃음이 함께하고자 했습니다.<br/><br/><br/><span class="${styles.highlight}">데스커 × 김씨네 과일 POP-UP</span><br/>워케이션 가든에서 진행되었던 특별 POP-UP!<br/>흥이 넘치는 '김씨네 과일'과 협업해<br/>워케이션을 방문하신 분들께<br/>특별하고 즐거운 경험을 선사하고자 했습니다.`
    },
    {
      p: `<span class="${styles.highlight}">데스커 × 순이지</span><br/>순이지 작가의 아트웍으로 완성된 일러스트와 함께<br/>새로워진 워케이션 공간을 선보였습니다.`
    }
  ];

  // 데스크톱용 텍스트 배열 (본문만)
  const getDesktopTexts = () => [
    {
      p: "바다 위에서 파도를 기다리는 시간은​<br/>일에서 벗어나는 것이 아니라,​<br/>다시 몰입을 위한 리듬을 찾는 순간이었습니다.<br/><br/>오전에는 업무에 집중하고,<br/>오후에는 바다에서 서핑을 즐기며​<br/>몰입과 이완이 자연스럽게 오가는 흐름 속에서​<br/>몸과 마음의 환기하는 시간을 경험할 수 있었습니다."
    },
    {
      p: "일과 쉼의 경계를 허물고<br/>자연 속에서 새로운 영감을 찾고자 했습니다.<br/><br/>오전에는 집중력이 높은 시간을 활용해<br/>업무에 몰입하고,<br/>오후에는 자연 속에서 산책하며<br/>새로운 아이디어를 발견할 수 있었습니다."
    },
    {
      p: "야근과 격무속에서도 미래를 만들어가는 스타트업에게<br/>​쉼은 보상이자, 다시 나아가기 위한 숨고르기라 생각했습니다.​​<br/><br/>데스커는 디캠프와 함께 바다 위에서 D.DAY를 열고,<br/>​일과 쉼이 공존하는 스타트업의 새로운 문화를 만들어갔습니다."
    },
    {
      p: `일하는 공간에서도<br/>​웃음과 감정의 환기가 필요하다고 생각했습니다.​<br/><br/>데스커는 다양한 브랜드, 아티스트와의 협업을 통해​<br/>잠시 머무는 순간에도 여유와 웃음이 함께하고자 했습니다.​<br/><br/><br/><span class="${styles.highlight}">데스커 × 김씨네 과일 POP-UP</span><br/>워케이션 가든에서 진행되었던 특별 POP-UP!<br/>흥이 넘치는 '김씨네 과일'과 협업해 워케이션을 방문하신 분들께<br/>특별하고 즐거운 경험을 선사하고자 했습니다.`
    },
    {
      p: `<span class="${styles.highlight}">데스커 × 순이지</span><br/>순이지 작가의 아트웍으로 완성된 일러스트와 함께<br/>새로워진 워케이션 공간을 선보였습니다.`
    }
  ];

  // 현재 사용할 텍스트 배열 선택
  const currentTexts = isMobile ? getMobileTexts() : getDesktopTexts();
  
  // 각 패널의 intersection observer
  const [panel1Ref, panel1Intersecting] = useIntersectionObserver({ threshold: 0.3 });
  const [panel2Ref, panel2Intersecting] = useIntersectionObserver({ threshold: 0.3 });
  const [panel3Ref, panel3Intersecting] = useIntersectionObserver({ threshold: 0.3 });
  const [panel4Ref, panel4Intersecting] = useIntersectionObserver({ threshold: 0.3 });
  
  // 각 요소별 fade in을 위한 ref들
  const [text1Ref, text1Intersecting, text1HasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [video1Ref, video1Intersecting, video1HasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [text2Ref, text2Intersecting, text2HasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [video2Ref, video2Intersecting, video2HasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [text3Ref, text3Intersecting, text3HasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [video3Ref, video3Intersecting, video3HasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [text4Ref, text4Intersecting, text4HasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [imageGrid4Ref, imageGrid4Intersecting, imageGrid4HasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [text4SecondRef, text4SecondIntersecting, text4SecondHasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [imageGrid4SecondRef, imageGrid4SecondIntersecting, imageGrid4SecondHasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  
  // 패널 4의 각 이미지별 fade in을 위한 ref들
  const [image4_1Ref, image4_1Intersecting, image4_1HasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [image4_2Ref, image4_2Intersecting, image4_2HasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [image4_3Ref, image4_3Intersecting, image4_3HasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [image4_4Ref, image4_4Intersecting, image4_4HasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [image4_5Ref, image4_5Intersecting, image4_5HasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [image4_6Ref, image4_6Intersecting, image4_6HasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [image4_7Ref, image4_7Intersecting, image4_7HasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [image4_8Ref, image4_8Intersecting, image4_8HasIntersected] = useIntersectionObserver({ threshold: 0.3 });

  useEffect(() => {
    const handleScroll = () => {
      const appElement = document.querySelector('.App');
      const scrollTop = appElement?.scrollTop || 0;
      const sectionTop = sectionRef.current?.offsetTop || 0;
      const sectionHeight = sectionRef.current?.offsetHeight || 0;
      
      // 각 패널의 시작 위치 계산
      const panelHeight = sectionHeight / 4;
      const panel1Start = sectionTop;
      const panel2Start = sectionTop + panelHeight;
      const panel3Start = sectionTop + (panelHeight * 2);
      const panel4Start = sectionTop + (panelHeight * 3);
      
      // 현재 스크롤 위치에 따른 패널 결정
      let currentPanelIndex = 0;
      if (scrollTop >= panel4Start) {
        currentPanelIndex = 3; // 패널 4
      } else if (scrollTop >= panel3Start) {
        currentPanelIndex = 2; // 패널 3
      } else if (scrollTop >= panel2Start) {
        currentPanelIndex = 1; // 패널 2
      } else if (scrollTop >= panel1Start) {
        currentPanelIndex = 0; // 패널 1
      }
      
      if (currentPanelIndex !== currentPanel) {
        setCurrentPanel(currentPanelIndex);
      }
    };

    const appElement = document.querySelector('.App');
    if (appElement) {
      appElement.addEventListener('scroll', handleScroll);
      handleScroll(); // 초기 상태 확인
      return () => appElement.removeEventListener('scroll', handleScroll);
    }
  }, [currentPanel]);

  return (
    <section ref={sectionRef} className={styles.section7}>
      {/* 패널 1: I AM. SURFER */}
      <div ref={panel1Ref} className={styles.panel}>
        <div className={styles.panelContent}>
          {/* 왼쪽: 배경 이미지와 텍스트 오버레이 */}
          <div className={styles.leftSide}>
            <div 
              className={styles.backgroundImage}
              style={{ backgroundImage: 'url("https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-1.jpg")' }}
            >
              <div className={styles.textOverlay}>
                <h2 className={styles.panelTitle}>I AM. SURFER</h2>
                <p className={styles.panelSubtitle}>서퍼의 여행은 파도를 따른다</p>
              </div>
            </div>
          </div>
          
          {/* 오른쪽: 설명 텍스트와 비디오 썸네일 */}
          <div className={styles.rightSide}>
            <div className={styles.contentWrapper}>
              <div ref={text1Ref} className={`${styles.description} ${text1HasIntersected ? styles.fadeIn : ''}`}>
                <p dangerouslySetInnerHTML={{ __html: currentTexts[0].p }} />
              </div>
              
              <div ref={video1Ref} className={`${styles.videoThumbnail} ${video1HasIntersected ? styles.fadeIn : ''}`}>
                  <iframe
                    src="https://www.youtube.com/embed/-ae3O7u2IZM?start=47&autoplay=0&mute=0&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className={styles.video}
                  />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 패널 2: 환기의 정원 */}
      <div ref={panel2Ref} className={styles.panel}>
        <div className={styles.panelContent}>
          {/* 왼쪽: 배경 이미지와 텍스트 오버레이 */}
          <div className={styles.leftSide}>
            <div 
              className={styles.backgroundImage}
              style={{ backgroundImage: 'url("https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-2.jpg")' }}
            >
              <div className={styles.textOverlay}>
                <h2 className={styles.panelTitle} style={{ lineHeight: '1.2', fontSize: '7rem' }}>
                  <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo.png" style={{width: "350px"}} /><br/>환기의 정원
                </h2>
                <p className={styles.panelSubtitle}>자연으로 가득 채운 워크라운지</p>
              </div>
            </div>
          </div>
          
          {/* 오른쪽: 설명 텍스트와 비디오 썸네일 */}
          <div className={styles.rightSide}>
            <div className={styles.contentWrapper}>
              <div ref={text2Ref} className={`${styles.description} ${text2HasIntersected ? styles.fadeIn : ''}`}>
                <p dangerouslySetInnerHTML={{ __html: currentTexts[1].p }} />
              </div>
              
              <div ref={video2Ref} className={`${styles.videoThumbnail} ${video2HasIntersected ? styles.fadeIn : ''}`}>
                   <iframe
                     src="https://www.youtube.com/embed/aFlpwKq6WfI?si=z5vVdim0lvJAFmq0&autoplay=0&mute=0&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1"
                     frameBorder="0"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                     allowFullScreen
                     className={styles.video}
                   />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 패널 3: WORKATION START-UP DAY */}
      <div ref={panel3Ref} className={styles.panel}>
        <div className={styles.panelContent}>
          {/* 왼쪽: 배경 이미지와 텍스트 오버레이 */}
          <div className={styles.leftSide}>
            <div 
              className={styles.backgroundImage}
              style={{ backgroundImage: 'url("https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-3.jpg")' }}
            >
              <div className={styles.textOverlay}>
                <h2 className={styles.panelTitle}>WORKATION<br/>START-UP DAY</h2>
                <p className={styles.panelSubtitle}>도전하는 이들을 위한 시간,<br/>디캠프 D'DAY & 스타트업 위크</p>
              </div>
            </div>
          </div>
          
          {/* 오른쪽: 설명 텍스트와 비디오 썸네일 */}
          <div className={styles.rightSide}>
            <div className={styles.contentWrapper}>
              <div ref={text3Ref} className={`${styles.description} ${text3HasIntersected ? styles.fadeIn : ''}`}>
                <p dangerouslySetInnerHTML={{ __html: currentTexts[2].p }} />
              </div>
              
              <div ref={video3Ref} className={`${styles.videoThumbnail} ${video3HasIntersected ? styles.fadeIn : ''}`}>
                   <iframe
                     src="https://www.youtube.com/embed/Mhv7ZC1k8eY?si=jI9n1aTHDDDIakQs&autoplay=1&mute=1&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3"
                     frameBorder="0"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                     allowFullScreen
                     className={styles.video}
                   />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 패널 4: 워케이션 공간 속 즐거움을 더하다 */}
      <div ref={panel4Ref} className={styles.panel}>
        <div className={styles.panelContent}>
          {/* 왼쪽: 배경 이미지와 텍스트 오버레이 (Sticky) */}
          <div className={styles.leftSide}>
            <div 
              className={styles.backgroundImage}
              style={{ backgroundImage: 'url("https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4.jpg")' }}
            >
              <div className={styles.textOverlay}>
                <h2 className={styles.panelTitle} style={{ lineHeight: '1.2', fontSize: '7rem' }}>워케이션 공간 속<br/>즐거움을 더하다</h2>
                <p className={styles.panelSubtitle}>특별한 경험을 위한 협업</p>
              </div>
            </div>
          </div>
          
          {/* 오른쪽: 스크롤 가능한 콘텐츠 */}
          <div className={styles.rightSide}>
            <div className={styles.scrollableContent}>
              {/* 첫 번째 텍스트 */}
              <div ref={text4Ref} className={`${styles.description} ${text4HasIntersected ? styles.fadeIn : ''}`}>
                <p dangerouslySetInnerHTML={{ __html: currentTexts[3].p }} />
              </div>
              
              {/* 첫 번째 이미지 4개 */}
              <div className={styles.imageGrid}>
                <div ref={image4_1Ref} className={`${styles.imageItem} ${image4_1HasIntersected ? styles.fadeIn : ''}`}>
                  <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-1.jpg" alt="워케이션 이미지 1" />
                </div>
                <div ref={image4_2Ref} className={`${styles.imageItem} ${image4_2HasIntersected ? styles.fadeIn : ''}`}>
                  <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-2.jpg" alt="워케이션 이미지 2" />
                </div>
                <div ref={image4_3Ref} className={`${styles.imageItem} ${image4_3HasIntersected ? styles.fadeIn : ''}`}>
                  <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-3.jpg" alt="워케이션 이미지 3" />
                </div>
                <div ref={image4_4Ref} className={`${styles.imageItem} ${image4_4HasIntersected ? styles.fadeIn : ''}`}>
                  <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-4.jpg" alt="워케이션 이미지 4" />
                </div>
              </div>
              
              {/* 두 번째 텍스트 */}
              <div ref={text4SecondRef} className={`${styles.description} ${text4SecondHasIntersected ? styles.fadeIn : ''} ${styles.panel4des}`}>
                <p dangerouslySetInnerHTML={{ __html: currentTexts[4].p }} />
              </div>
              
              {/* 두 번째 이미지 4개 */}
              <div className={styles.imageGrid}>
                <div ref={image4_5Ref} className={`${styles.imageItem} ${image4_5HasIntersected ? styles.fadeIn : ''}`}>
                  <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-5.jpg" alt="워케이션 이미지 5" />
                </div>
                <div ref={image4_6Ref} className={`${styles.imageItem} ${image4_6HasIntersected ? styles.fadeIn : ''}`}>
                  <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-6.jpg" alt="워케이션 이미지 6" />
                </div>
                <div ref={image4_7Ref} className={`${styles.imageItem} ${image4_7HasIntersected ? styles.fadeIn : ''}`}>
                  <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-7.jpg" alt="워케이션 이미지 7" />
                </div>
                <div ref={image4_8Ref} className={`${styles.imageItem} ${image4_8HasIntersected ? styles.fadeIn : ''}`}>
                  <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-8.jpg" alt="워케이션 이미지 8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section7;
