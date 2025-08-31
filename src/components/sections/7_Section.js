import React, { useEffect, useRef, useState } from 'react';
import styles from './7_Section.module.css';
import Glide from '@glidejs/glide';
import '@glidejs/glide/dist/css/glide.core.min.css';
import '@glidejs/glide/dist/css/glide.theme.min.css';

const Section7 = () => {
  const sectionRef = useRef(null);
  const panelsContainerRef = useRef(null);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // 초기값을 실제 화면 크기로 설정
  const [isInSection, setIsInSection] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const glideRef1 = useRef(null);
  const glideRef2 = useRef(null);
  const glideInstance1 = useRef(null);
  const glideInstance2 = useRef(null);
  const scrollLocked = useRef(false);
  const lockPosition = useRef(0);
  const exitingSection = useRef(false); // 섹션 탈출 중 플래그
  const [playingVideos, setPlayingVideos] = useState({}); // 비디오 재생 상태
  
  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // 모바일일 때 스크롤 잠금 해제
      if (mobile) {
        scrollLocked.current = false;
        setIsInSection(false);
        exitingSection.current = false;
        
        // fixed 스타일 제거
        if (sectionRef.current) {
          sectionRef.current.style.position = 'relative';
          sectionRef.current.style.top = 'auto';
          sectionRef.current.style.left = 'auto';
          sectionRef.current.style.right = 'auto';
        }
      }
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
      p1: `일하는 공간에서도<br/>웃음과 감정의 환기가 필요하다고 생각했습니다.<br/><br/>데스커는 다양한 브랜드, 아티스트와의 협업을 통해<br/>잠시 머무는 순간에도 여유와 웃음이 함께하고자 했습니다.<br/><br/><span style="font-weight: 800; color: #336DFF;">데스커 × 김씨네 과일 POP-UP</span><br/>워케이션 가든에서 진행되었던 특별 POP-UP!<br/>흥이 넘치는 '김씨네 과일'과 협업해<br/>워케이션을 방문하신 분들께<br/>특별하고 즐거운 경험을 선사하고자 했습니다.`,
      images1: [
        "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-1.jpg",
        "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-2.jpg",
        "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-3.jpg",
        "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-4.jpg"
      ],
      p2: `<span style="font-weight: 800; color: #336DFF;">데스커 × 순이지</span><br/>순이지 작가의 아트웍으로 완성된 일러스트와 함께<br/>새로워진 워케이션 공간을 선보였습니다.`,
      images2: [
        "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-5.jpg",
        "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-6.jpg",
        "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-7.jpg",
        "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-8.jpg"
      ]
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
      p1: `일하는 공간에서도<br/>웃음과 감정의 환기가 필요하다고 생각했습니다.<br/><br/>데스커는 다양한 브랜드, 아티스트와의 협업을 통해<br/>잠시 머무는 순간에도 여유와 웃음이 함께하고자 했습니다.<br/><br/><span style="font-weight: 800; color: #336DFF;">데스커 × 김씨네 과일 POP-UP</span><br/>워케이션 가든에서 진행되었던 특별 POP-UP!<br/>흥이 넘치는 '김씨네 과일'과 협업해<br/>워케이션을 방문하신 분들께<br/>특별하고 즐거운 경험을 선사하고자 했습니다.​`,
      images1: [
        "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-1.jpg",
        "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-2.jpg",
        "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-3.jpg",
        "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-4.jpg"
      ],
      p2: `<span style="font-weight: 800; color: #336DFF;">데스커 × 순이지</span><br/>순이지 작가의 아트웍으로 완성된 일러스트와 함께<br/>새로워진 워케이션 공간을 선보였습니다.`,
      images2: [
        "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-5.jpg",
        "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-6.jpg",
        "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-7.jpg",
        "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-4-8.jpg"
      ]
    }
  ];

  // 현재 사용할 텍스트 배열 선택
  const currentTexts = isMobile ? getMobileTexts() : getDesktopTexts();

  // 패널 이동 함수 (데스크톱에서만)
  const moveToPanel = (panelIndex) => {
    // 모바일에서는 패널 이동 비활성화
    if (isMobile) return;
    
    if (panelIndex < 0 || panelIndex > 3 || isTransitioning) return;
    
    // 패널 전환 시 모든 비디오 일시정지
    setPlayingVideos({});
    
    setIsTransitioning(true);
    setCurrentPanel(panelIndex);
    
    if (panelsContainerRef.current) {
      const translateX = panelIndex * -25; // 각 패널은 전체의 25%
      panelsContainerRef.current.style.transform = `translateX(${translateX}%)`;
    }
    
    // 전환 완료 후 플래그 해제
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000); // CSS transition 시간과 동일
  };

  // 섹션 감지 처리 (데스크톱에서만)
  useEffect(() => {
    const handleScroll = (e) => {
      // 모바일에서는 스크롤 고정 비활성화
      if (isMobile) return;
      
      const appElement = document.querySelector('.App');
      if (!appElement || !sectionRef.current) return;
      
      const scrollTop = appElement.scrollTop;
      const sectionTop = sectionRef.current.offsetTop;
      const viewportHeight = window.innerHeight;
      
      // 탈출 중일 때는 모든 처리 무시
      if (exitingSection.current) {
        // 섹션을 완전히 벗어났을 때만 플래그 리셋
        if (scrollTop > sectionTop + viewportHeight + 100 || scrollTop < sectionTop - viewportHeight) {
          exitingSection.current = false;
        }
        return; // 탈출 중에는 다른 처리 하지 않음
      }
      
      // 섹션 7이 뷰포트에 90% 이상 들어왔을 때 자동으로 고정
      const sectionVisibleThreshold = sectionTop - viewportHeight * 0.2;
      const isApproachingSection = scrollTop >= sectionVisibleThreshold && scrollTop < sectionTop + 50;
      
      // 섹션 7에 진입할 때 (접근 중이고, 잠기지 않았을 때만)
      if (isApproachingSection && !scrollLocked.current) {
        scrollLocked.current = true;
        setIsInSection(true);
        lockPosition.current = sectionTop;
        
        // 부드럽게 섹션 위치로 이동한 후 고정
        const startPosition = scrollTop;
        const distance = sectionTop - startPosition;
        const duration = 600;
        const startTime = performance.now();
        
        const easeInOutQuad = (t) => {
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        };
        
        const animateScroll = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeInOutQuad(progress);
          
          appElement.scrollTop = startPosition + (distance * easedProgress);
          
          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          } else {
            // 애니메이션 완료 후 fixed로 변경
            if (sectionRef.current && scrollLocked.current) {
              // 현재 위치를 저장
              const rect = sectionRef.current.getBoundingClientRect();
              
              // fixed로 변경
              sectionRef.current.style.position = 'fixed';
              sectionRef.current.style.top = `${rect.top}px`;
              sectionRef.current.style.left = '0';
              sectionRef.current.style.right = '0';
              
              // 부드럽게 top을 0으로 조정
              requestAnimationFrame(() => {
                if (sectionRef.current) {
                  sectionRef.current.style.transition = 'top 0.3s ease-out';
                  sectionRef.current.style.top = '0';
                  
                  setTimeout(() => {
                    if (sectionRef.current) {
                      sectionRef.current.style.transition = '';
                    }
                  }, 300);
                }
              });
            }
          }
        };
        
        requestAnimationFrame(animateScroll);
      }
      
      // 스크롤이 잠겨있을 때 위치 강제 고정 (모바일에서는 비활성화)
      if (!isMobile && scrollLocked.current && Math.abs(scrollTop - lockPosition.current) > 5) {
        e.preventDefault();
        appElement.scrollTop = lockPosition.current;
      }
    };
    
    const appElement = document.querySelector('.App');
    if (appElement) {
      appElement.addEventListener('scroll', handleScroll, { passive: false });
      // 모바일이 아닐 때만 초기 상태 확인
      if (!isMobile) {
        handleScroll({}); // 초기 상태 확인
      }
      
      return () => {
        appElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isMobile]); // isMobile 의존성 추가
  
  // 휠 이벤트 처리 (데스크톱에서만)
  useEffect(() => {
    const handleWheel = (e) => {
      // 모바일에서는 휠 이벤트 비활성화
      if (isMobile) return;
      
      const appElement = document.querySelector('.App');
      
      // 섹션 7에 있을 때만 처리
      if (scrollLocked.current && isInSection) {
        // 패널 4에서 rightSide 영역 클릭 시 휠 이벤트 무시
        if (currentPanel === 3) {
          // 이벤트가 rightSide 영역에서 발생했는지 확인
          const rightSideElement = document.querySelector(`.${styles.rightSidePanel4}`);
          if (rightSideElement && rightSideElement.contains(e.target)) {
            // rightSide 영역에서는 휠 이벤트 무시 (기본 스크롤 허용)
            return;
          }
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        // 트랜지션 중이면 무시
        if (isTransitioning) return;
        
        // 디바운싱 제거 - 즉시 반응
        
        // 휠 방향에 따라 패널 이동
        if (e.deltaY > 0) {
          // 아래로 스크롤 - 다음 패널
          if (currentPanel < 3) {
            moveToPanel(currentPanel + 1);
          } else {
            // 마지막 패널에서 아래로 스크롤 시 섹션 7 탈출
            exitingSection.current = true; // 탈출 중 플래그 설정
            scrollLocked.current = false;
            setIsInSection(false);
            setPlayingVideos({}); // 모든 비디오 일시정지
            
            // 섹션 고정 해제 전에 정확한 위치 계산
            const sectionTop = sectionRef.current.offsetTop || lockPosition.current;
            
            // 섹션 고정 해제
            if (sectionRef.current) {
              sectionRef.current.style.position = 'relative';
              sectionRef.current.style.top = 'auto';
              sectionRef.current.style.left = 'auto';
              sectionRef.current.style.right = 'auto';
              sectionRef.current.style.transition = '';
            }
            
            // 스크롤 위치를 섹션7 끝으로 설정하여 다음 섹션 표시 (PC에서만)
            if (!isMobile) {
              appElement.scrollTop = sectionTop + window.innerHeight;
            }
          }
        } else if (e.deltaY < 0) {
          // 위로 스크롤
          if (currentPanel === 0) {
            // 패널1에서 위로 스크롤 시 무조건 섹션 7 탈출
            exitingSection.current = true; // 탈출 중 플래그 설정
            scrollLocked.current = false;
            setIsInSection(false);
            setPlayingVideos({}); // 모든 비디오 일시정지
            
            // 섹션 고정 해제
            if (sectionRef.current) {
              sectionRef.current.style.position = 'relative';
              sectionRef.current.style.top = 'auto';
              sectionRef.current.style.left = 'auto';
              sectionRef.current.style.right = 'auto';
              sectionRef.current.style.transition = '';
            }
            
            // 강제 스크롤 없이 자연스럽게 이전 섹션으로 이동
            // appElement.scrollTop = previousSectionEnd;
          } else {
            // 패널2,3,4에서는 이전 패널로 이동 (패널4에서도 탈출 안됨)
            moveToPanel(currentPanel - 1);
          }
        }
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [isInSection, currentPanel, isTransitioning, isMobile]);

  // 터치 이벤트 처리 비활성화 - 모바일에서는 일반 스크롤 사용
  /*
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (!isInSection) return;
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      if (scrollLocked.current && isInSection) {
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = (e) => {
      if (!isInSection || isTransitioning) return;
      
      touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - touchEndY;
      
      if (Math.abs(deltaY) > 50) { // 최소 스와이프 거리
        if (deltaY > 0) {
          // 위로 스와이프
          if (currentPanel < 3) {
            // 패널 1,2,3에서는 다음 패널로
            moveToPanel(currentPanel + 1);
          }
          // 패널4에서 위로 스와이프는 무시 (탈출 안됨)
        } else if (deltaY < 0) {
          // 아래로 스와이프
          if (currentPanel > 0 && currentPanel < 3) {
            // 패널 2,3에서는 이전 패널로
            moveToPanel(currentPanel - 1);
          } else if (currentPanel === 3) {
            // 패널4에서 아래로 스와이프 - 다음 섹션으로 탈출
            exitingSection.current = true;
            scrollLocked.current = false;
            setIsInSection(false);
            
            if (sectionRef.current) {
              sectionRef.current.style.position = 'relative';
              sectionRef.current.style.top = 'auto';
            }
            
            const appElement = document.querySelector('.App');
            if (appElement) {
              appElement.scrollTop = lockPosition.current + window.innerHeight + 10;
            }
          } else if (currentPanel === 0) {
            // 패널1에서 아래로 스와이프 - 이전 섹션으로 탈출
            scrollLocked.current = false;
            setIsInSection(false);
            
            if (sectionRef.current) {
              sectionRef.current.style.position = 'relative';
              sectionRef.current.style.top = 'auto';
            }
            
            const appElement = document.querySelector('.App');
            if (appElement) {
              appElement.scrollTop = lockPosition.current - 10;
            }
          }
        }
      }
    };
    
    if (sectionRef.current) {
      sectionRef.current.addEventListener('touchstart', handleTouchStart, { passive: false });
      sectionRef.current.addEventListener('touchmove', handleTouchMove, { passive: false });
      sectionRef.current.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        if (sectionRef.current) {
          sectionRef.current.removeEventListener('touchstart', handleTouchStart);
          sectionRef.current.removeEventListener('touchmove', handleTouchMove);
          sectionRef.current.removeEventListener('touchend', handleTouchEnd);
        }
      };
    }
  }, [isInSection, currentPanel, isTransitioning, isMobile]);
  */

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isInSection || isTransitioning) return;
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentPanel < 3) {
          moveToPanel(currentPanel + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentPanel > 0) {
          moveToPanel(currentPanel - 1);
        }
      }
    };
    
    if (isInSection) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isInSection, currentPanel, isTransitioning]);

  // Glide 슬라이더 초기화 (패널 4용)
  useEffect(() => {
    // 슬라이더 초기화 전 기존 인스턴스 정리
    if (glideInstance1.current) {
      glideInstance1.current.destroy();
      glideInstance1.current = null;
    }
    if (glideInstance2.current) {
      glideInstance2.current.destroy();
      glideInstance2.current = null;
    }
    
    if (currentPanel === 3 && !isMobile) {
      // 약간의 지연 후 초기화
      setTimeout(() => {
        // 첫 번째 슬라이더 초기화
        if (glideRef1.current) {
          glideInstance1.current = new Glide(glideRef1.current, {
            type: 'carousel',
            perView: 1,
            gap: 0,
            focusAt: 'center',
            autoplay: false,
            animationDuration: 600,
            breakpoints: {
              9999: {
                perView: 1
              }
            }
          });
          glideInstance1.current.mount();
        }
        
        // 두 번째 슬라이더 초기화
        if (glideRef2.current) {
          glideInstance2.current = new Glide(glideRef2.current, {
            type: 'carousel',
            perView: 1,
            gap: 0,
            focusAt: 'center',
            autoplay: false,
            animationDuration: 600,
            breakpoints: {
              9999: {
                perView: 1
              }
            }
          });
          glideInstance2.current.mount();
        }
      }, 100);
    }
    
    // Cleanup
    return () => {
      if (glideInstance1.current) {
        glideInstance1.current.destroy();
        glideInstance1.current = null;
      }
      if (glideInstance2.current) {
        glideInstance2.current.destroy();
        glideInstance2.current = null;
      }
    };
  }, [currentPanel, isMobile]);

  return (
    <>
      <section ref={sectionRef} className={styles.section7}>
        <div ref={panelsContainerRef} className={styles.panelsContainer}>
          {/* 패널 1: I AM. SURFER */}
          <div className={styles.panel}>
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
                  <div className={styles.description}>
                    <p dangerouslySetInnerHTML={{ __html: currentTexts[0].p }} />
                  </div>
                  
                  <div 
                    className={styles.videoThumbnail}
                    onClick={() => {
                      const newState = { ...playingVideos };
                      newState['video1'] = !newState['video1'];
                      setPlayingVideos(newState);
                    }}
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/-ae3O7u2IZM?start=47&autoplay=${playingVideos['video1'] ? 1 : 0}&mute=0&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className={styles.video}
                      style={{ pointerEvents: playingVideos['video1'] ? 'auto' : 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 패널 2: 환기의 정원 */}
          <div className={styles.panel}>
            <div className={styles.panelContent}>
              {/* 왼쪽: 배경 이미지와 텍스트 오버레이 */}
              <div className={styles.leftSide}>
                <div 
                  className={styles.backgroundImage}
                  style={{ backgroundImage: 'url("https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S7-2.jpg")' }}
                >
                  <div className={styles.textOverlay}>
                    <h2 className={styles.panelTitle} style={{ lineHeight: '1.2', fontSize: '7rem' }}>
                      <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/logo.png" style={{width: "350px"}} alt="logo" /><br/>환기의 정원
                    </h2>
                    <p className={styles.panelSubtitle}>자연으로 가득 채운 워크라운지</p>
                  </div>
                </div>
              </div>
              
              {/* 오른쪽: 설명 텍스트와 비디오 썸네일 */}
              <div className={styles.rightSide}>
                <div className={styles.contentWrapper}>
                  <div className={styles.description}>
                    <p dangerouslySetInnerHTML={{ __html: currentTexts[1].p }} />
                  </div>
                  
                  <div 
                    className={styles.videoThumbnail}
                    onClick={() => {
                      const newState = { ...playingVideos };
                      newState['video2'] = !newState['video2'];
                      setPlayingVideos(newState);
                    }}
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/aFlpwKq6WfI?si=z5vVdim0lvJAFmq0&autoplay=${playingVideos['video2'] ? 1 : 0}&mute=0&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className={styles.video}
                      style={{ pointerEvents: playingVideos['video2'] ? 'auto' : 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 패널 3: WORKATION START-UP DAY */}
          <div className={styles.panel}>
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
                  <div className={styles.description}>
                    <p dangerouslySetInnerHTML={{ __html: currentTexts[2].p }} />
                  </div>
                  
                  <div 
                    className={styles.videoThumbnail}
                    onClick={() => {
                      const newState = { ...playingVideos };
                      newState['video3'] = !newState['video3'];
                      setPlayingVideos(newState);
                    }}
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/Mhv7ZC1k8eY?si=jI9n1aTHDDDIakQs&autoplay=${playingVideos['video3'] ? 1 : 0}&mute=0&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className={styles.video}
                      style={{ pointerEvents: playingVideos['video3'] ? 'auto' : 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 패널 4: 워케이션 공간 속 즐거움을 더하다 */}
          <div className={styles.panel}>
            <div className={styles.panelContent}>
              {/* 왼쪽: 배경 이미지와 텍스트 오버레이 */}
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
              
              {/* 오른쪽: 설명 텍스트와 이미지들 */}
              <div className={`${styles.rightSide} ${styles.rightSidePanel4}`}>
                <div className={styles.contentWrapper} style={{ gap: '4rem', overflowY: 'auto' }}>
                  {/* 첫 번째 텍스트 */}
                  <div className={styles.description}>
                    <p dangerouslySetInnerHTML={{ __html: currentTexts[3].p1 }} />
                  </div>
                  
                  {/* 첫 번째 이미지 슬라이더 (이미지 1,2,3,4) */}
                  <div className="glide" ref={glideRef1}>
                    <div className="glide__track" data-glide-el="track" style={{ borderRadius: '12px' }}>
                      <ul className="glide__slides">
                        {currentTexts[3].images1.map((img, index) => (
                          <li key={index} className="glide__slide">
                            <div className={styles.sliderImageItem}>
                              <img src={img} alt={`워케이션 이미지 ${index + 1}`} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="glide__arrows" data-glide-el="controls">
                      <button className="glide__arrow glide__arrow--left" data-glide-dir="<"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14.2893 5.70708C13.8988 5.31655 13.2657 5.31655 12.8751 5.70708L7.98768 10.5993C7.20729 11.3805 7.2076 12.6463 7.98837 13.427L12.8787 18.3174C13.2693 18.7079 13.9024 18.7079 14.293 18.3174C14.6835 17.9269 14.6835 17.2937 14.293 16.9032L10.1073 12.7175C9.71678 12.327 9.71678 11.6939 10.1073 11.3033L14.2893 7.12129C14.6799 6.73077 14.6799 6.0976 14.2893 5.70708Z" fill="#ffffff"></path> </g></svg></button>
                      <button className="glide__arrow glide__arrow--right" data-glide-dir=">"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z" fill="#ffffff"></path> </g></svg></button>
                    </div>
                  </div>

                  {/* 두 번째 텍스트 */}
                  <div className={styles.description}>
                    <p dangerouslySetInnerHTML={{ __html: currentTexts[3].p2 }} />
                  </div>
                  
                  {/* 두 번째 이미지 슬라이더 (이미지 5,6,7,8) */}
                  <div className="glide" ref={glideRef2}>
                    <div className="glide__track" data-glide-el="track" style={{ borderRadius: '12px' }}>
                      <ul className="glide__slides">
                        {currentTexts[3].images2.map((img, index) => (
                          <li key={index} className="glide__slide">
                            <div className={styles.sliderImageItem}>
                              <img src={img} alt={`워케이션 이미지 ${index + 5}`} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="glide__arrows" data-glide-el="controls">
                      <button className="glide__arrow glide__arrow--left" data-glide-dir="<"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14.2893 5.70708C13.8988 5.31655 13.2657 5.31655 12.8751 5.70708L7.98768 10.5993C7.20729 11.3805 7.2076 12.6463 7.98837 13.427L12.8787 18.3174C13.2693 18.7079 13.9024 18.7079 14.293 18.3174C14.6835 17.9269 14.6835 17.2937 14.293 16.9032L10.1073 12.7175C9.71678 12.327 9.71678 11.6939 10.1073 11.3033L14.2893 7.12129C14.6799 6.73077 14.6799 6.0976 14.2893 5.70708Z" fill="#ffffff"></path> </g></svg></button>
                      <button className="glide__arrow glide__arrow--right" data-glide-dir=">"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z" fill="#ffffff"></path> </g></svg></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* 섹션 7이 고정될 때 공간 확보용 스페이서 */}
      {scrollLocked.current && (
        <div style={{ height: '100vh', width: '100%' }} />
      )}
    </>
  );
};

export default Section7;