import React, { useRef, useEffect, useState } from 'react';
import styles from './4_Section.module.css';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const Section4 = () => {
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '-50px'
  });
  const gifRef = useRef(null);
  const pngRef = useRef(null);
  const leftTextRef = useRef(null);
  const rightTextRef = useRef(null);
  const [gifPlayed, setGifPlayed] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 감지 (768px 이하)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 모바일일 때 애니메이션 타이밍 조정
  const getAnimationDelay = (desktopDelay) => {
    return isMobile ? desktopDelay * 2 : desktopDelay; // 모바일에서는 2배 늦게 시작
  };

  // 순차적 애니메이션 실행
  useEffect(() => {
    if (hasIntersected && !gifPlayed) {
      // 1단계: 왼쪽 텍스트 나타남
      setTimeout(() => {
        if (leftTextRef.current) {
          const h3Element = leftTextRef.current.querySelector('h3');
            if (h3Element) {
              setTimeout(() => {
                h3Element.style.opacity = '1';
              }, getAnimationDelay(300)); // 모바일에서는 600ms
            
            // 텍스트1이 완전히 나타난 후 GIF 시작
            setTimeout(() => {
              if (gifRef.current) {
                gifRef.current.style.visibility = 'visible'; // visibility 표시
                gifRef.current.style.opacity = '1'; // GIF 표시
                gifRef.current.style.animationPlayState = 'running';
                setAnimationStep(2);
                
                // GIF 애니메이션이 완전히 끝난 후 PNG 표시
                setTimeout(() => {
                  if (gifRef.current && pngRef.current) {
                    // GIF를 숨기고 PNG를 표시
                    gifRef.current.style.display = 'none';
                    pngRef.current.style.display = 'block';
                    
                    setAnimationStep(3);
                  }
                }, getAnimationDelay(2600)); // 모바일에서는 5200ms
              }
            }, getAnimationDelay(300)); // 모바일에서는 600ms
          }
        }
        setAnimationStep(1);
      }, getAnimationDelay(300)); // 모바일에서는 600ms

      // 4단계: 오른쪽 텍스트 나타남 (PNG 교체와 동시에)
      setTimeout(() => {
        if (rightTextRef.current) {
          const h3Element = rightTextRef.current.querySelector('h3');
          if (h3Element) {
            h3Element.style.opacity = '1';
          }
        }
        setAnimationStep(4);
      }, getAnimationDelay(2600)); // 모바일에서는 5200ms

      setGifPlayed(true);
    }
  }, [hasIntersected, gifPlayed, isMobile]);

  return (
    <section ref={ref} className={styles.section4}>
      {/* 배경 YouTube 영상 - 처음부터 로드 */}
      <div className={styles.backgroundVideo}>
        <iframe
          src="https://www.youtube.com/embed/j9mcHW97dLU?autoplay=1&mute=1&loop=1&playlist=j9mcHW97dLU&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
          title="Background Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      
      {/* 영상 위의 콘텐츠 */}
      <div className={styles.content}>
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
            {/* PNG 이미지 - GIF 완료 후 표시 */}
            <img 
              ref={pngRef}
              src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/s6.png"
              alt="Center Image" 
              className={styles.pngImage}
              style={{
                display: 'none'
              }}
            />
          </div>
          
          {/* 오른쪽 텍스트2 - 마지막에 나타남 */}
          <div ref={rightTextRef} className={styles.rightText}>
            <h3>일의 몰입을 되찾기 위한​<br/>4년간의 여정을 소개합니다.​</h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section4;
