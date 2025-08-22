import React, { useRef, useEffect, useState } from 'react';
import styles from './4_Section.module.css';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { useScrollPosition } from '../../hooks/useScrollPosition';

const Section4 = () => {
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '-50px'
  });
  const { scrollPosition } = useScrollPosition();
  const gifRef = useRef(null);
  const leftTextRef = useRef(null);
  const rightTextRef = useRef(null);
  const [gifPlayed, setGifPlayed] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // 화면에 보일 때만 동영상 로드
  useEffect(() => {
    if (isIntersecting && !videoLoaded) {
      setVideoLoaded(true);
    } else if (!isIntersecting && videoLoaded) {
      // 화면에서 벗어나면 동영상 언로드하여 메모리 절약
      setVideoLoaded(false);
    }
  }, [isIntersecting, videoLoaded]);

  // 강제 리셋 함수
  const forceReset = () => {
    
    setGifPlayed(false);
    setAnimationStep(0);
    
    // 텍스트 opacity 리셋
    if (leftTextRef.current) {
      const h3Element = leftTextRef.current.querySelector('h3');
      if (h3Element) {
        h3Element.style.opacity = '0';
      }
    }
    
    if (rightTextRef.current) {
      const h3Element = rightTextRef.current.querySelector('h3');
      if (h3Element) {
        h3Element.style.opacity = '0';
      }
    }
    
    // GIF 완전 리셋 - 초기 상태로 숨김
    if (gifRef.current) {
      gifRef.current.src = "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/s6.gif";
      gifRef.current.alt = 'Center GIF';
      gifRef.current.style.animationPlayState = 'paused';
      gifRef.current.style.opacity = '0'; // GIF 초기에는 숨김
      gifRef.current.style.visibility = 'hidden'; // visibility도 숨김
      gifRef.current.style.transform = 'scale(0.8) rotate(-5deg)'; // 초기 애니메이션 상태
    }
  };

  // 스크롤 높이가 뷰포트*2보다 위로 올라가면 리셋
  useEffect(() => {
    const viewportHeight = window.innerHeight;
    const resetThreshold = viewportHeight * 2;
    
    // 리셋 조건: 스크롤이 임계값보다 위로 올라가거나, 섹션이 화면에서 벗어남
    if (scrollPosition < resetThreshold || !isIntersecting) {
      forceReset();
    }
  }, [scrollPosition, isIntersecting]);

  // 순차적 애니메이션 실행
  useEffect(() => {
    if (isIntersecting && !gifPlayed) {
      // 1단계: 왼쪽 텍스트 나타남
      setTimeout(() => {
        if (leftTextRef.current) {
          const h3Element = leftTextRef.current.querySelector('h3');
          if (h3Element) {
            h3Element.style.opacity = '1';
            
            // 텍스트1이 완전히 나타난 후 GIF 시작
            setTimeout(() => {
              if (gifRef.current) {
                gifRef.current.style.visibility = 'visible'; // visibility 표시
                gifRef.current.style.opacity = '1'; // GIF 표시
                gifRef.current.style.animationPlayState = 'running';
                setAnimationStep(2);
              }
            }, 300); // 텍스트1 완전 표시 후 1초 후 GIF 시작
          }
        }
        setAnimationStep(1);
      }, 300);

      // 3단계: PNG로 교체
      setTimeout(() => {
        if (gifRef.current) {
          gifRef.current.src = "https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/s6.png";
          gifRef.current.alt = 'Center Image';
        }
        setAnimationStep(3);
      }, 3100); // 4.5초 → 5.5초로 증가

      // 4단계: 오른쪽 텍스트 나타남
      setTimeout(() => {
        if (rightTextRef.current) {
          const h3Element = rightTextRef.current.querySelector('h3');
          if (h3Element) {
            h3Element.style.opacity = '1';
          }
        }
        setAnimationStep(4);
      }, 3100); // 5.5초 → 6.5초로 증가

      setGifPlayed(true);
    }
  }, [isIntersecting, gifPlayed]);

  return (
    <section ref={ref} className={styles.section4}>
      <div className={styles.content}>
        <div className={styles.mainContent}>
          {/* 배경 YouTube 영상 - 화면에 보일 때만 로드 */}
          {videoLoaded && (
            <div className={styles.videoBackground}>
              <iframe
                src="https://www.youtube.com/embed/j9mcHW97dLU?autoplay=1&mute=1&loop=1&playlist=j9mcHW97dLU&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
                title="DESKER Section 4 Background Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className={styles.backgroundVideo}
                loading="lazy"
              />
            </div>
          )}
          
          {/* 영상 위의 콘텐츠 */}
          <div className={styles.overlayContent}>
            {/* 왼쪽 텍스트1 - 첫 번째로 나타남 */}
            <div ref={leftTextRef} className={styles.leftText}>
              <h3>30만명이<br/>함께한 '데스커 워케이션'</h3>
            </div>
            
            {/* 가운데 GIF - 두 번째로 실행 후 PNG로 교체 */}
            <div className={styles.centerGif}>
              <img 
                ref={gifRef}
                src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/s6.gif"
                alt="Center GIF" 
                className={styles.gifImage}
                style={{
                  animationPlayState: 'paused',
                  animationDuration: '2.3s'
                }}
              />
            </div>
            
            {/* 오른쪽 텍스트2 - 마지막에 나타남 */}
            <div ref={rightTextRef} className={styles.rightText}>
              <h3>일의 몰입을 되찾기 위한​<br/>4년간의 여정을 소개합니다.​</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section4;
