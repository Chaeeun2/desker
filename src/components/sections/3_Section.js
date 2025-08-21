import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './3_Section.module.css';

const Section3 = () => {
  const sectionRef = useRef(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const currentTextIndexRef = useRef(0);
  
  // opacity 상태들과 스크롤 가능 상태
  const [text1Opacity, setText1Opacity] = useState(1);
  const [text2Opacity, setText2Opacity] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);
  const scrollListenerRef = useRef(null);
  const isScrollableRef = useRef(false); // ref로도 관리
  
  // 섹션3 완전 리셋 함수
  const resetSection3 = () => {
    console.log('🔄 Section3 완전 리셋 실행!');
    
    // 1. 텍스트 상태 리셋
    setText1Opacity(1);
    setText2Opacity(0);
    setCurrentTextIndex(0);
    
    // 2. 스크롤 상태 리셋
    if (scrollListenerRef.current && typeof scrollListenerRef.current.resetScrollState === 'function') {
      scrollListenerRef.current.resetScrollState();
    }
    isScrollableRef.current = false;
    setIsScrollable(false);
    
    // 3. sticky 상태 완전 복원
    if (sectionRef.current) {
      // 모든 인라인 스타일 제거
      sectionRef.current.style.position = '';
      sectionRef.current.style.top = '';
      sectionRef.current.style.zIndex = '';
      sectionRef.current.style.transform = '';
      sectionRef.current.style.willChange = '';
      
      // CSS 클래스 제거
      sectionRef.current.classList.remove(styles.scrollable);
      
      console.log('🔄 Section3 sticky 상태로 완전 복원');
      console.log('🔍 적용된 클래스:', sectionRef.current.className);
      console.log('🔍 적용된 스타일:', {
        position: sectionRef.current.style.position,
        top: sectionRef.current.style.top,
        zIndex: sectionRef.current.style.zIndex,
        transform: sectionRef.current.style.transform,
        willChange: sectionRef.current.style.willChange
      });
    }
    
    console.log('✅ Section3 리셋 완료:', {
      'text1Opacity': 1,
      'text2Opacity': 0,
      'currentTextIndex': 0,
      'isScrollable': false
    });
  };

  const texts = [
    "데스커가<br/>워케이션에 주목하게 된 이유",
    "일에 몰입하기 위해선<br/>꼭 사무실이어야만 할까?"
  ];

  // currentTextIndex 상태와 ref 동기화
  useEffect(() => {
    currentTextIndexRef.current = currentTextIndex;
  }, [currentTextIndex]);

  // isScrollable 상태와 ref 동기화
  useEffect(() => {
    isScrollableRef.current = isScrollable;
  }, [isScrollable]);

  // Intersection Observer 제거 - 텍스트 리셋은 기준점에서만 수행



  // 매우 간단한 스크롤 기반 opacity 조절 시스템
  useEffect(() => {
    console.log('✅ Section3 마운트됨');
    let startScrollY = null;
    let lastLoggedScroll = 0;
    
    const handleScroll = () => {
      // .App 요소의 scrollTop 사용 (실제 스크롤 컨테이너)
      const appElement = document.querySelector('.App');
      const scrollTop = appElement ? appElement.scrollTop : 0;
      
      const viewportHeight = window.innerHeight;
      const triggerPoint = viewportHeight * 2; // 뷰포트 높이만큼
      
      // 100px마다 로그 출력
      if (Math.abs(scrollTop - lastLoggedScroll) >= 200) {
        console.log('🔄 .App scrollTop:', scrollTop, '/ 기준점:', triggerPoint);
        lastLoggedScroll = scrollTop;
      }
      
      // scrollTop이 뷰포트보다 위로 올라가면 완전 리셋 (자유스크롤 모드여도 상관없음)
      if (scrollTop < triggerPoint && startScrollY !== null) {
        console.log('👋 기준점 아래로 이동. 텍스트 리셋 + sticky 복원!', {
          '현재 scrollTop': scrollTop,
          '기준점': triggerPoint,
          '시작점이었던 scrollTop': startScrollY,
          '자유스크롤 상태': isScrollableRef.current
        });
        
        // 완전 리셋 실행
        resetSection3();
        return; // 리셋 후 함수 종료
      }
      
      // 자유스크롤 모드일 때는 opacity 조절만 차단
      if (isScrollableRef.current) {
        console.log('🔒 자유스크롤 모드 - opacity 조절만 차단');
        return; // 자유스크롤 중에는 opacity 조절만 하지 않음
      }
      
      // 뷰포트 높이만큼 스크롤하면 opacity 조절 시작
      if (scrollTop >= triggerPoint && startScrollY === null) {
        startScrollY = scrollTop;
        console.log('🎯 opacity 조절 시작! 시작 scrollTop:', startScrollY);
      }
      
      // opacity 조절 - 200px마다 0.1씩 변경
      if (startScrollY !== null) {
        const scrollDiff = scrollTop - startScrollY;
        const steps = Math.floor(scrollDiff / 200); // 200px마다 1단계
        
        const newText1Opacity = Math.max(0, Math.min(1, 1 - (steps * 0.1)));
        const newText2Opacity = Math.max(0, Math.min(1, steps * 0.1 - 1));
        
        console.log('🎨 상세 디버깅:', { 
          '현재 scrollTop': scrollTop,
          '시작 scrollTop': startScrollY,
          scrollDiff, 
          steps, 
          newText1Opacity: newText1Opacity.toFixed(1), 
          newText2Opacity: newText2Opacity.toFixed(1),
          '리셋 조건 체크': scrollTop < (triggerPoint)
        });
        
        setText1Opacity(newText1Opacity);
        setText2Opacity(newText2Opacity);
        
        // 현재 어떤 텍스트가 보이는지 판단
        let currentVisibleText = '';
        if (newText1Opacity > newText2Opacity) {
          currentVisibleText = newText1Opacity > 0.5 ? '텍스트1 주로 보임' : '텍스트1 약간 보임';
        } else if (newText2Opacity > newText1Opacity) {
          currentVisibleText = newText2Opacity > 0.5 ? '텍스트2 주로 보임' : '텍스트2 약간 보임';
        } else {
          currentVisibleText = '텍스트1,2 같은 정도';
        }
        
        // 텍스트 opacity 변경 디버깅
        console.log('📝 텍스트 상태:', {
          text1Opacity: newText1Opacity.toFixed(1),
          text2Opacity: newText2Opacity.toFixed(1),
          '현재 보이는 텍스트': currentVisibleText,
          '자유스크롤 상태': isScrollableRef.current
        });
        
        // 텍스트2의 opacity가 1에 도달하면 자유 스크롤 활성화
        if (newText2Opacity >= 1.0 && !isScrollable) {
          console.log('🚀 자유스크롤 모드 전환!', {
            '이전 isScrollable': isScrollable,
            '이전 isScrollableRef': isScrollableRef.current,
            '새로운 isScrollable': true
          });
          
          // 즉시 ref도 업데이트하여 스크롤 이벤트 차단
          isScrollableRef.current = true;
          setIsScrollable(true);
          console.log('🚀 텍스트2 완성! 자유 스크롤로 전환... (ref 즉시 업데이트)');
          
          const appElement = document.querySelector('.App');
          if (appElement) {
            // 현재 scrollTop을 뷰포트 높이로 조정하여 순간이동 방지
            const currentScrollTop = appElement.scrollTop;
            const viewportHeight = window.innerHeight;
            
            console.log('📍 자유스크롤 전환:', {
              '현재 scrollTop': currentScrollTop,
              '뷰포트 높이': viewportHeight,
              '강제 이동할 scrollTop': viewportHeight
            });
            
            // 1. scrollTop을 뷰포트 높이만큼 강제 이동
            appElement.scrollTop = viewportHeight * 2;
            
            // Section3 DOM 스타일 직접 조작으로 확실한 sticky 해제
            if (sectionRef.current) {
              sectionRef.current.style.position = 'relative';
              sectionRef.current.style.top = 'unset';
              sectionRef.current.style.zIndex = '1';
              sectionRef.current.style.transform = 'none';
              sectionRef.current.style.willChange = 'auto';
              // 클래스도 추가로 확실히 적용
              sectionRef.current.classList.add(styles.scrollable);
              console.log('📌 Section3 DOM 스타일 직접 수정으로 sticky 완전 해제');
              console.log('🔍 적용된 클래스:', sectionRef.current.className);
            }
            
            // 3. 스크롤 이벤트 리스너는 제거하지 않고 유지 (다시 위로 올라갔을 때 동작하도록)
            console.log('🔓 자유 스크롤 활성화! (이벤트 리스너는 유지하여 다시 위로 올라가면 처음처럼 동작)');
            
            console.log('✅ 스크롤 조정 완료! 이제 자유 스크롤 가능합니다.');
          }
        }
      }
    };
    
    // 스크롤 상태 리셋 함수를 scrollListenerRef에 추가
    const resetScrollState = () => {
      startScrollY = null;
    };
    
    // 즉시 한 번 실행
    setTimeout(handleScroll, 100);
    
    // .App 요소에 스크롤 이벤트 리스너 추가
    const appElement = document.querySelector('.App');
    if (appElement) {
      scrollListenerRef.current = { handleScroll, resetScrollState };
      appElement.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    return () => {
      console.log('🛑 스크롤 리스너 제거');
      if (appElement) {
        appElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []); // 빈 의존성 배열 - ref 사용으로 클로저 문제 해결

  return (
    <section
      ref={sectionRef}
      className={`${styles.section3} ${isScrollable ? styles.scrollable : ''}`}
    >
      {/* 배경 이미지 */}
      <div className={styles.backgroundImage}></div>
      
      {/* 가운데 텍스트 - 두 텍스트 동시 렌더링 */}
      <div className={styles.textContainer}>
        {/* 텍스트 1 */}
        <div
          className={styles.centerText}
          style={{ 
            opacity: text1Opacity,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.1s ease-out'
          }}
          dangerouslySetInnerHTML={{ __html: texts[0] }}
        />
        
        {/* 텍스트 2 */}
        <div
          className={styles.centerText}
          style={{ 
            opacity: text2Opacity,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.1s ease-out'
          }}
          dangerouslySetInnerHTML={{ __html: texts[1] }}
        />
      </div>
        

    </section>
  );
};

export default Section3;
