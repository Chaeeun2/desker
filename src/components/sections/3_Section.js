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
  const [text3Opacity, setText3Opacity] = useState(0); // 텍스트3 opacity
  const [text4Opacity, setText4Opacity] = useState(0); // 텍스트4 opacity
  const [text1TranslateY, setText1TranslateY] = useState(0); // 텍스트1 translateY
  const [text2TranslateY, setText2TranslateY] = useState(0); // 텍스트2 translateY
  const [text3TranslateY, setText3TranslateY] = useState(0); // 텍스트3 translateY
  const [text4TranslateY, setText4TranslateY] = useState(0); // 텍스트4 translateY
  const [text1Color, setText1Color] = useState('black'); // 텍스트1 색상
  const [text2Color, setText2Color] = useState('black'); // 텍스트2 색상
  const [text3Color, setText3Color] = useState('black'); // 텍스트3 색상
  const [text4Color, setText4Color] = useState('black'); // 텍스트4 색상 (black → white)
  const [text5Color, setText5Color] = useState('black'); // 텍스트5 색상
  const [text6Color, setText6Color] = useState('white'); // 텍스트6 색상
  const [overlayOpacity, setOverlayOpacity] = useState(0); // 흰색 오버레이 opacity
  const [showSpacer, setShowSpacer] = useState(true); // 스페이서 표시 상태
  const [isAnimationComplete, setIsAnimationComplete] = useState(false); // 애니메이션 완료 상태
  const isAnimationCompleteRef = useRef(false); // 즉시 반영을 위한 ref
  const triggerPointRef = useRef(null);
  
  // 애니메이션 완료 상태를 한번 true로 설정하면 다시 false로 되돌리지 않음
  const setAnimationComplete = (value) => {
    if (value === true || !isAnimationCompleteRef.current) {
      setIsAnimationComplete(value);
      isAnimationCompleteRef.current = value; // ref도 동시에 업데이트
      
      // 애니메이션 완료 시 최종 상태 고정
      if (value === true) {
        fixFinalState();
      }
    }
  };

  // 최종 상태 고정 함수 - 애니메이션 완료 시 호출
  const fixFinalState = () => {
    // 1. 모든 텍스트와 SVG를 최종 상태로 고정
    setText1Opacity(0);
    setText2Opacity(0);
    setText3Opacity(0);
    setText4Opacity(0); // 텍스트4는 완성된 상태로 유지
    setText5Opacity(0);
    setText6Opacity(1); // 텍스트6은 완성된 상태로 유지
    
    // 2. SVG와 라인을 최종 상태로 고정
    setSvg1TranslateX(0);
    setSvg1TranslateY(0);
    setSvg1StrokeColor('white');
    setSvg2TranslateX(0);
    setSvg2TranslateY(500);
    setSvg2Width(0);
    setSvg2StrokeColor('white');
    setLineTranslateY(500);
    setLineWidth(0);
    setLineStrokeColor('white');
    setLinePadding(0);
    
    // 3. 새로운 SVG들을 최종 상태로 고정
    setNewSvgScale(1);
    setNewSvg2Scale(1);
    setNewSvg3Scale(1);
    
    
    setShowSpacer(false);
    // 4. Overlay를 최종 상태로 고정
    setOverlayColor('#336DFF');
    setOverlayOpacity(1);
    
    // 5. .App의 scrollTop을 뷰포트*2 위치로 자동스크롤
    const appElement = document.querySelector('.App');
    if (appElement && triggerPointRef.current !== null) {
      const viewportHeight = window.innerHeight;
      const targetScrollTop = viewportHeight * 2;
      appElement.scrollTop = targetScrollTop;
    }
    
    // 6. sticky 해제 (자유스크롤)
    if (sectionRef.current) {
      sectionRef.current.style.position = 'relative';
      sectionRef.current.style.top = 'auto';
      sectionRef.current.style.zIndex = 'auto';
      sectionRef.current.style.transform = 'none';
      sectionRef.current.style.willChange = 'auto';
      sectionRef.current.classList.add(styles.scrollable);
    }
  };
  const [svg1TranslateX, setSvg1TranslateX] = useState(-0); // 왼쪽 화면밖 (vw 단위)
  const [svg2TranslateX, setSvg2TranslateX] = useState(0); // 오른쪽 화면밖 (vw 단위)
  const [svg1TranslateY, setSvg1TranslateY] = useState(0); // svg1 Y 위치 (0 → 가운데)
  const [svg2TranslateY, setSvg2TranslateY] = useState(0); // svg2 Y 위치 (0 → 아래로)
  const [svg2Width, setSvg2Width] = useState(199); // svg2 width (199 → 0)
  const [lineTranslateY, setLineTranslateY] = useState(0); // line Y 위치 (0 → 아래로)
  const [svg1StrokeColor, setSvg1StrokeColor] = useState('black'); // svg1 stroke 색상 (black → white)
  const [svg2StrokeColor, setSvg2StrokeColor] = useState('black'); // svg2 stroke 색상 (black → white)
  const [lineStrokeColor, setLineStrokeColor] = useState('black'); // line stroke 색상 (black → white)
  const [newSvgScale, setNewSvgScale] = useState(0); // 새로운 SVG scale (0 → 1)
  const [newSvg2Scale, setNewSvg2Scale] = useState(0); // 두 번째 새로운 SVG scale (0 → 1)
  const [newSvg3Scale, setNewSvg3Scale] = useState(0); // 세 번째 새로운 SVG scale (0 → 1, 오른쪽)
  const [linePadding, setLinePadding] = useState(30); // line padding (50px → 0px)
  const [lineWidth, setLineWidth] = useState(0); // 초기 width 0
  const [lineOpacity, setLineOpacity] = useState(0); // 라인 opacity (0에서 1로 증가)
  const [svgOpacity, setSvgOpacity] = useState(0); // SVG opacity (0에서 1로 증가)
  const [text5Opacity, setText5Opacity] = useState(0); // 텍스트5 opacity
  const [text5TranslateY, setText5TranslateY] = useState(0); // 텍스트5 translateY
  const [text6Opacity, setText6Opacity] = useState(0); // 텍스트6 opacity
  const [overlayColor, setOverlayColor] = useState('white'); // overlay 배경색 (white → primary)
  

  // texts 배열을 동적으로 생성하여 색상 변경 가능하게 함
  const getTexts = (text4Color) => [
    "데스커가<br/>워케이션에 주목하게 된 이유",
    "일에 몰입하기 위해선<br/>꼭 사무실이어야만 할까?",
    "사무실에 출근하는<br/>반복적인 일상.",
    `같은 공간, 책상에서<br/><span style='color:${text4Color === 'white' ? 'white' : '#336DFF'}'>일</span>과 <span style='color:${text4Color === 'white' ? 'white' : '#336DFF'}'>쉼</span>의 공존은 어렵게만 느껴졌습니다.`,
    "그 고민 앞에서,",
    "일과 삶의 환기를 위한<br/>데스커 워케이션이 시작되었습니다."
  ];

  // 모바일용 texts 배열 (줄바꿈 다르게)
  const getMobileTexts = (text4Color) => [
    "데스커가<br/>워케이션에<br/>주목하게 된 이유",
    "일에 몰입하기<br/>위해선 꼭<br/>사무실이어야만 할까?",
    "사무실에 출근하는<br/>반복적인 일상.",
    `같은 공간, 책상에서<br/><span style='color:${text4Color === 'white' ? 'white' : '#336DFF'}'>일</span>과 <span style='color:${text4Color === 'white' ? 'white' : '#336DFF'}'>쉼</span>의 공존은<br/>어렵게만 느껴졌습니다.`,
    "그 고민 앞에서,",
    "일과 삶의 환기를 위한<br/>데스커 워케이션이<br/>시작되었습니다."
  ];

  // 화면 크기에 따라 텍스트 선택
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

  // showSpacer 상태 변화 시 전역 이벤트 발생
  useEffect(() => {
    // 커스텀 이벤트로 showSpacer 상태 알림
    const event = new CustomEvent('section3SpacerChange', { 
      detail: { showSpacer } 
    });
    window.dispatchEvent(event);
  }, [showSpacer]);

  // 모바일일 때 스크롤 거리 조정 (절반으로 줄임)
  const getScrollDistance = (desktopDistance) => {
    return isMobile ? desktopDistance / 2 : desktopDistance;
  };

  // 현재 사용할 텍스트 배열 선택
  const currentTexts = isMobile ? getMobileTexts(text4Color) : getTexts(text4Color);

  // currentTextIndex 상태와 ref 동기화
  useEffect(() => {
    currentTextIndexRef.current = currentTextIndex;
  }, [currentTextIndex]);



  // 단순한 스크롤 기반 애니메이션 시스템 - 리셋 기능 완전 제거
  useEffect(() => {

    let lastLoggedScroll = 0;
    
    const handleScroll = () => {
      const appElement = document.querySelector('.App');
      const scrollTop = appElement ? appElement.scrollTop : 0;
      
      // 섹션 3이 화면에 보일 때 triggerPoint 설정
      if (sectionRef.current) {
        const sectionTop = sectionRef.current.offsetTop;
        const sectionBottom = sectionTop + sectionRef.current.offsetHeight;

        // 섹션 3의 top이 처음 0에 도달했을 때 triggerPoint 설정
        if (!triggerPointRef.current && scrollTop >= sectionTop) {
          const sectionTopPosition = sectionTop;
          triggerPointRef.current = sectionTopPosition;
        }
        
        // 리셋 후 재시작을 위한 triggerPoint 재설정 (섹션 3 근처에 도달했을 때)
        if (triggerPointRef.current === null && scrollTop >= sectionTop - window.innerHeight) {
          const sectionTopPosition = sectionTop;
          triggerPointRef.current = sectionTopPosition;
        }
        
        // 애니메이션 리셋 조건: 트리거포인트-뷰포트 높이만큼 올라가면 리셋
        if (triggerPointRef.current !== null && scrollTop < triggerPointRef.current - window.innerHeight) {
          // 상태 완전 리셋
          setIsAnimationComplete(false);
          isAnimationCompleteRef.current = false;
          triggerPointRef.current = null;
          
          // 모든 상태 초기화
          setText1Opacity(0);
          setText2Opacity(0);
          setText3Opacity(0);
          setText4Opacity(0);
          setText5Opacity(0);
          setText6Opacity(0);
          setText1TranslateY(0);
          setText2TranslateY(0);
          setText3TranslateY(0);
          setText4TranslateY(0);
          setText5TranslateY(0);
          setText1Color('black');
          setText2Color('black');
          setText3Color('black');
          setText4Color('black');
          setText5Color('black');
          setText6Color('white');
          setOverlayColor('white');
          setOverlayOpacity(0);
          setSvg1TranslateX(-100);
          setSvg2TranslateX(100);
          setSvg1TranslateY(0);
          setSvg2TranslateY(0);
          setSvg2Width(199);
          setLineTranslateY(0);
          setSvg1StrokeColor('black');
          setSvg2StrokeColor('black');
          setLineStrokeColor('black');
          setLinePadding(30);
          setLineWidth(0);
          setLineOpacity(0);
          setSvgOpacity(0);
          setNewSvgScale(0);
          setNewSvg2Scale(0);
          setNewSvg3Scale(0);
          setShowSpacer(true);
        }
        
        // 스크롤 위치 계산
        const scrollDiff = scrollTop - (triggerPointRef.current || sectionTop);
        
        const viewportHeight = window.innerHeight;
        const triggerPoint = viewportHeight * 2; // 섹션 3 애니메이션 시작점
        
        // 리셋 관련 디버깅만 남김
        if (Math.abs(scrollTop - lastLoggedScroll) >= 200) {
          lastLoggedScroll = scrollTop;
        }
        
        // 스크롤이 뷰포트 높이보다 작아지면 리셋 (애니메이션 완료 여부와 상관없이)
        const resetThreshold = viewportHeight;
        
        if (scrollTop < resetThreshold) {
          
          // 1단계: 상태 완전 리셋
          setIsAnimationComplete(false);
          isAnimationCompleteRef.current = false; // ref도 동시에 리셋
          setShowSpacer(true);
          setOverlayColor('white');
          setOverlayOpacity(0);
          setText1Opacity(1);
          setText2Opacity(0);
          setText3Opacity(0);
          setText4Opacity(0);
          setText5Opacity(0);
          setText6Opacity(0);
          setText4Color('black');
          setSvg1TranslateX(-100);
          setSvg1TranslateY(0);
          setSvg1StrokeColor('black');
          setSvg2TranslateY(0);
          setSvg2Width(199);
          setSvg2StrokeColor('black');
          setLineTranslateY(0);
          setLineWidth(0);
          setLineOpacity(0);
          setLineStrokeColor('black');
          setLinePadding(30);
          setSvgOpacity(0);
          setNewSvgScale(0);
          setNewSvg2Scale(0);
          setNewSvg3Scale(0);
          
          // 2단계: sticky 상태로 복원
          if (sectionRef.current) {
            sectionRef.current.classList.remove(styles.animationComplete);
            sectionRef.current.classList.add(styles.sticky);
          }
          return; // 리셋 후 함수 종료
        }
        
        // 애니메이션이 완료된 상태라면 애니메이션 로직만 무시
        if (isAnimationCompleteRef.current) {
          return;
        }
        
        // triggerPoint에 도달하면 애니메이션 시작
        if (scrollTop >= triggerPoint) {
          const scrollDiff = scrollTop - triggerPoint; // triggerPoint 기준으로 계산
          const steps = Math.floor(scrollDiff / 100); // 100px마다 1단계 (200px → 100px로 절반)
          
          const newText1Opacity = Math.max(0, Math.min(1, 1 - (steps * 0.1)));
          const newText2Opacity = Math.max(0, Math.min(1, steps * 0.1 - 1));
          

          
          // 먼저 텍스트2가 완료된 후 오버레이 애니메이션 계산 (150px마다 0.1씩)
          const overlayStartPoint = getScrollDistance(1000); // 1000px → 모바일에서는 500px
          let newOverlayOpacity = 0;
          
          if (scrollDiff >= overlayStartPoint) {
            const overlayScrollDiff = scrollDiff - overlayStartPoint; // 텍스트2 완료 후 추가 스크롤 거리
            if (overlayScrollDiff >= 0) { // 음수 방지
              const overlaySteps = Math.floor(overlayScrollDiff / getScrollDistance(150)); // 150px마다 1단계 (모바일에서는 75px)
              newOverlayOpacity = Math.max(0, Math.min(1, overlaySteps * 0.1)); // 75px마다 0.1씩 증가 (모바일)
            }
          }
          
          // 오버레이가 한번 완료되면 계속 1.0으로 유지
          const finalOverlayOpacity = Math.max(newOverlayOpacity, overlayOpacity);
          
          // 오버레이가 완료되면 텍스트1,2를 완전히 숨김
          if (finalOverlayOpacity >= 1.0) {
            setText1Opacity(0);
            setText2Opacity(0);
          } else {
            setText1Opacity(newText1Opacity);
            setText2Opacity(newText2Opacity);
          }
          
          // 오버레이가 완료된 후 텍스트3 애니메이션 시작 (100px마다 0.1씩)
          const text3StartPoint = getScrollDistance(2000); // 2000px → 모바일에서는 1000px
          let newText3Opacity = 0;
          
          if (scrollDiff >= text3StartPoint) {
            const text3ScrollDiff = scrollDiff - text3StartPoint; // 오버레이 완료 후 추가 스크롤 거리
            if (text3ScrollDiff >= 0) { // 음수 방지
              const text3Steps = Math.floor(text3ScrollDiff / getScrollDistance(100)); // 100px마다 1단계 (모바일에서는 50px)
              newText3Opacity = Math.max(0, Math.min(1, text3Steps * 0.1)); // 50px마다 0.1씩 증가 (모바일)
            }
          }
          
          setOverlayOpacity(finalOverlayOpacity);
          setText3Opacity(newText3Opacity);
          
          // 텍스트4 애니메이션 (텍스트3 완성 후)
          const text4StartPoint = getScrollDistance(4000); // 4000px → 모바일에서는 2000px
          let newText4Opacity = 0;
          
          if (scrollDiff >= text4StartPoint) {
            const text4ScrollDiff = scrollDiff - text4StartPoint; // 텍스트4 시작 후 스크롤 거리
            if (text4ScrollDiff >= 0) { // 음수 방지
              const text4Steps = Math.floor(text4ScrollDiff / (isMobile ? 12 : 25)); // 모바일에서는 더 빠르게
              newText4Opacity = Math.max(0, Math.min(1, text4Steps * 0.05)); // 12px마다 0.05씩 증가 (모바일)
            }
          }
          
          // 텍스트3과 텍스트4를 텍스트1-2와 같은 방식으로 처리
          // 텍스트3이 사라질 때만 translateY 애니메이션
          let finalText3Opacity = newText3Opacity;
          let finalText4Opacity = newText4Opacity; // newText4Opacity 값을 직접 사용
          
          // 텍스트3: opacity 0 → 1 → 0 (사라질 때 translateY 30px 위로)
          // 텍스트4: opacity 0 → 1 → 0
          
          if (newText3Opacity >= 1.0) {
            // 텍스트3 완성 후 사라지는 애니메이션
            const text3FadeOutStart = getScrollDistance(3000); // 3000px → 모바일에서는 1500px
            const text3FadeOut = Math.max(0, 1 - (scrollDiff - text3FadeOutStart) / getScrollDistance(1000)); // 1000px에 걸쳐 사라짐 (모바일에서는 500px)
            finalText3Opacity = text3FadeOut;
            setText3Opacity(finalText3Opacity);
            
            // 텍스트3이 사라질 때 translateY 30px 위로
            if (finalText3Opacity < 1.0) {
              const translateY = (1.0 - finalText3Opacity) * 30;
              setText3TranslateY(translateY);
            } else {
              setText3TranslateY(0);
            }
            
            // 텍스트3이 완전히 사라진 후 텍스트4 시작
            if (finalText3Opacity <= 0) {
              const text4StartPoint = getScrollDistance(4000); // 4000px → 모바일에서는 2000px
              const text4Start = Math.min(1, (scrollDiff - text4StartPoint) / getScrollDistance(1000)); // 1000px에 걸쳐 나타남 (모바일에서는 500px)
              setText4Opacity(text4Start);
              
              // SVG 애니메이션: 텍스트4와 함께 시작 (더 빠르게)
              if (text4Start > 0) {
                // svg1, svg2가 원래 자리로 이동 (텍스트4와 동시에)
                const svgStartPoint = getScrollDistance(4000); // 4000px → 모바일에서는 2000px
                const svgAnimation = Math.min(1, (scrollDiff - svgStartPoint) / getScrollDistance(1000)); // 1000px에 걸쳐 나타남 (모바일에서는 500px)
                setSvg1TranslateX(-100 + (svgAnimation * 100)); // -100vw → 0vw
                setSvg2TranslateX(100 - (svgAnimation * 100)); // 100vw → 0vw
                setSvgOpacity(svgAnimation); // SVG opacity도 0에서 1로 증가
                
                // line width 애니메이션: svg 애니메이션 완료 후 시작
                if (svgAnimation >= 1.0) {
                  const lineStartPoint = getScrollDistance(5000); // 5000px → 모바일에서는 2500px
                  const lineAnimation = Math.min(1, (scrollDiff - lineStartPoint) / getScrollDistance(1000)); // 1000px에 걸쳐 나타남 (모바일에서는 500px)
                  const newLineWidth = lineAnimation * 40; // 0 → 40vw로 확장
                  setLineWidth(newLineWidth);
                  setLineOpacity(lineAnimation); // 라인 opacity도 0에서 1로 증가
                  

                  
                  // lineHeight와 strokeWidth는 항상 3px로 고정
                  
                  // 라인 애니메이션이 완료되면 새로운 애니메이션 시작
                  if (lineAnimation >= 1.0) {
                    // 텍스트4 페이드아웃 (새로운 요소들이 나타나면서)
                    const text4FadeOut = Math.max(0, 1 - (scrollDiff - getScrollDistance(6000)) / getScrollDistance(1000)); // 6000px → 모바일에서는 3000px, 1000px → 모바일에서는 500px
                    setText4Opacity(text4FadeOut);
                    
                    // 텍스트4가 사라질 때 translateY 30px 위로 (텍스트3과 동일한 방식)
                    if (text4FadeOut < 1.0) {
                      const translateY = (1.0 - text4FadeOut) * 30;
                      setText4TranslateY(translateY);
                    } else {
                      setText4TranslateY(0);
                    }
                    

                    
                                        // 텍스트4가 완전히 사라진 후 텍스트5 시작 (7000px부터 1500px에 걸쳐)
                    if (text4FadeOut <= 0) {
                      // 최종 애니메이션 (새로운 SVG들)
                      const finalAnimation = Math.min(1, (scrollDiff - getScrollDistance(7000)) / getScrollDistance(1500)); // 7000px → 모바일에서는 3500px, 1500px → 모바일에서는 750px
                      
                      // overlay 배경색을 primary로 변경
                      if (finalAnimation > 0) {
                        setOverlayColor('#336DFF'); // primary 색상
                        setText4Color('white'); // 텍스트4 색상을 흰색으로 변경
                      }
                      
                      // 텍스트5 애니메이션
                      setText5Opacity(finalAnimation);
                      
                      // SVG와 라인 애니메이션 변수들 선언
                      let svg2TranslateYValue = 0;
                      let svg2WidthValue = 199;
                      let lineTranslateYValue = 0;
                      let lineWidthValue = 40;
                      
                      // SVG와 라인 애니메이션: 스크롤에 따라 점진적으로 변화
                      if (finalAnimation > 0) {
                        // svg1: 가운데로 이동하면서 stroke 색상을 흰색으로 변경
                        setSvg1TranslateX(0); // 가운데로
                        setSvg1TranslateY(0); // 가운데 유지
                        setSvg1StrokeColor('white'); // 흰색으로 변경
                        
                        // svg2: 스크롤에 따라 아래로 이동하고 width 줄이기 (더 빠르게)
                        svg2TranslateYValue = finalAnimation * 500; // 0 → 500px (더 멀리)
                        // svg2 width 애니메이션을 2배 빠르게 (절반 수준으로 빠르게)
                        const fastSvg2Animation = Math.min(1, finalAnimation * 2); // 2배 빠르게
                        svg2WidthValue = 199 - (fastSvg2Animation * 199); // 199 → 0px (더 빨리)
                        setSvg2TranslateY(svg2TranslateYValue);
                        setSvg2Width(svg2WidthValue);
                        setSvg2StrokeColor('white'); // 흰색으로 변경
                        
                        // line: 스크롤에 따라 아래로 이동하고 width 줄이기 (더 빠르게)
                        lineTranslateYValue = finalAnimation * 500; // 0 → 500px (더 멀리)
                        // line width 애니메이션을 2배 빠르게 (절반 수준으로 빠르게)
                        const fastLineAnimation = Math.min(1, finalAnimation * 2); // 2배 빠르게
                        lineWidthValue = 40 - (fastLineAnimation * 40); // 40vw → 0vw (더 빨리)
                        const linePaddingValue = 30 - (finalAnimation * 30); // 50px → 0px
                        setLineTranslateY(lineTranslateYValue);
                        setLineWidth(lineWidthValue);
                        setLinePadding(linePaddingValue);
                        setLineStrokeColor('white'); // 흰색으로 변경
                      }
                      

                      
                      // 텍스트5가 완료되면 텍스트6 시작 (9500px부터 1000px에 걸쳐)
                      if (finalAnimation >= 1.0) {
                        // 텍스트5 페이드아웃 (9500px부터 1000px에 걸쳐)
                        const text5FadeOut = Math.max(0, 1 - (scrollDiff - getScrollDistance(9500)) / getScrollDistance(1000)); // 9500px → 모바일에서는 4750px, 1000px → 모바일에서는 500px
                        setText5Opacity(text5FadeOut);
                        
                        // 텍스트5가 사라지면서 translateY 변화
                        if (text5FadeOut < 1.0) {
                          const translateY = (1.0 - text5FadeOut) * 30;
                          setText5TranslateY(translateY);
                        }
                        
                        // 텍스트5가 완전히 사라진 후 텍스트6 시작
                        if (text5FadeOut <= 0) {
                          const text6Animation = Math.min(1, (scrollDiff - getScrollDistance(10500)) / getScrollDistance(1000)); // 10500px → 모바일에서는 5250px, 1000px → 모바일에서는 500px
                          setText6Opacity(text6Animation);
                          
                          // 새로운 SVG들도 함께 나타남
                          setNewSvgScale(text6Animation);
                          setNewSvg2Scale(text6Animation);
                          setNewSvg3Scale(text6Animation);
                          
                          // 애니메이션 완료 체크 (텍스트 6이 완성되면)
                          if (text6Animation >= 1.0 && !isAnimationCompleteRef.current) {
                            setIsAnimationComplete(true);
                            isAnimationCompleteRef.current = true; // ref도 동시에 업데이트
                            
                            // 최종 상태 고정 (섹션 9처럼)
                            fixFinalState();
                          }
                        }
                      }
                    }
                  }
                }
              }
              

            }
          } else {
                          // 애니메이션이 완료된 후에는 리셋하지 않음
              if (!isAnimationComplete) {
                setText4Opacity(0);
                // SVG 초기 상태 유지
                setSvg1TranslateX(-100);
                setSvg2TranslateX(100);
                setSvg1TranslateY(0);
                setSvg2TranslateY(0);
                setSvg2Width(199);
                setLineTranslateY(0);
                setSvg1StrokeColor('black');
                setSvg2StrokeColor('black');
                setLineStrokeColor('black');
                setLinePadding(30);
                setLineWidth(0);
                setLineOpacity(0); // 라인 opacity도 0으로 리셋
                setSvgOpacity(0); // SVG opacity도 0으로 리셋
                setText4TranslateY(0); // 텍스트4 translateY도 0으로 리셋
                setText4Color('black'); // 텍스트4 색상도 black으로 리셋
                setText5Opacity(0); // 텍스트5 opacity도 0으로 리셋
                setText5TranslateY(0); // 텍스트5 translateY도 0으로 리셋
                setText6Opacity(0); // 텍스트6 opacity도 0으로 리셋
                setNewSvgScale(0); // 새로운 SVG scale도 0으로 리셋
                setNewSvg2Scale(0); // 두 번째 새로운 SVG scale도 0으로 리셋
                setNewSvg3Scale(0); // 세 번째 새로운 SVG scale도 0으로 리셋
                setOverlayColor('white'); // overlay 배경색도 white로 리셋
              } else {
  
              }
          }
        } else {
          // 텍스트3이 나타나는 중
          setText3Opacity(0);
          setText3TranslateY(0);
          setText4Opacity(0);
        }
        

        

        

        

        
        // 애니메이션 완료 여부에 따라 sticky 설정/해제
        if (sectionRef.current) {
          if (isAnimationCompleteRef.current) {
            // 애니메이션 완료 시 sticky 해제
            sectionRef.current.style.position = 'relative';
            sectionRef.current.style.top = 'auto';
            sectionRef.current.style.zIndex = 'auto';
            sectionRef.current.style.transform = 'none';
            sectionRef.current.style.willChange = 'auto';
            sectionRef.current.classList.add(styles.scrollable);

          } else {
            // 애니메이션 진행 중일 때는 sticky 유지
            sectionRef.current.style.position = 'sticky';
            sectionRef.current.style.top = '0';
            sectionRef.current.style.zIndex = '10';
            sectionRef.current.style.transform = 'none';
            sectionRef.current.style.willChange = 'transform';
            sectionRef.current.classList.remove(styles.scrollable);
          }
        }
      }
    };
    
    // 즉시 한 번 실행
    setTimeout(handleScroll, 100);
    
    // .App 요소에 스크롤 이벤트 리스너 추가
    const appElement = document.querySelector('.App');
    if (appElement) {
      appElement.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    return () => {
      if (appElement) {
        appElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []); // 빈 의존성 배열 - ref 사용으로 클로저 문제 해결

  return (
    <>
      <section
        ref={sectionRef}
        className={styles.section3}
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
              transform: `translate(-50%, calc(-50% - ${(1 - text1Opacity) * 30}px))`,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
              fontSize: '8rem'
            }}
            dangerouslySetInnerHTML={{ __html: currentTexts[0] }}
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
              transition: 'opacity 0.1s ease-out',
              fontSize: '8rem'
            }}
            dangerouslySetInnerHTML={{ __html: currentTexts[1] }}
          />
        </div>
        
        {/* 동적 배경색 오버레이 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
            pointerEvents: 'none',
            transition: 'opacity 0.1s ease-out, background-color 0.3s ease-out',
            zIndex: 3
          }}
        />
        
        {/* 텍스트 3 - 오버레이 위에 표시되도록 나중에 렌더링 */}
        <div
          className={styles.centerTextBlack}
          style={{ 
            opacity: text3Opacity,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, calc(-50% - ${text3TranslateY}px))`,
            transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
            zIndex: 10, // 오버레이보다 훨씬 위에 표시
            fontSize: '6rem'
          }}
          dangerouslySetInnerHTML={{ __html: currentTexts[2] }}
        />
        
        {/* 텍스트 4 - 검은색으로 표시 */}
        <div
          className={styles.centerTextBlack}
          style={{ 
            opacity: text4Opacity,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, calc(-50% - ${text4TranslateY}px))`,
            transition: 'opacity 0.1s ease-out, transform 0.1s ease-out, color 0.3s ease-out',
            zIndex: 11, // 텍스트3보다 위에 표시
            color: text4Color, // 동적 색상 적용
            fontSize: '6rem'
          }}
          dangerouslySetInnerHTML={{ __html: currentTexts[3] }}
        />

        
                  {/* 텍스트 5 - 흰색으로 표시 */}
          <div
            className={styles.centerTextWhite}
            style={{ 
              opacity: text5Opacity,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, calc(-50% - ${text5TranslateY}px))`,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
              zIndex: 12, // 텍스트4보다 위에 표시
              color: 'white', // 흰색 텍스트
              fontSize: '6rem'
            }}
            dangerouslySetInnerHTML={{ __html: currentTexts[4] }}
          />
          
          {/* 텍스트 6 - 흰색으로 표시 */}
          <div
            className={styles.centerTextWhite}
            style={{ 
              opacity: text6Opacity,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              transition: 'opacity 0.1s ease-out',
              zIndex: 13, // 텍스트5보다 위에 표시
              color: 'white', // 흰색 텍스트
              fontSize: '6rem'
            }}
            dangerouslySetInnerHTML={{ __html: currentTexts[5] }}
          />
        
        {/* 하단 SVG 요소들 - 텍스트4와 함께 나타남 */}
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            opacity: svgOpacity, // text4Opacity 대신 svgOpacity 사용
            transition: 'opacity 0.1s ease-out',
            zIndex: 11
          }}
        >
                  {/* svg1: 책상 + 노트북 */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="177" 
          height="133" 
          fill="none"
          style={{
            transform: `translate(${svg1TranslateX}vw, ${svg1TranslateY}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        >
          <path stroke={svg1StrokeColor} strokeLinejoin="round" strokeWidth="3" d="M174.766 132.342V68.096H2v64.246"/>
          <path stroke={svg1StrokeColor} strokeMiterlimit="10" strokeWidth="3" d="M120.318 44.603h-65.73v-40.5c0-1.16.942-2.103 2.103-2.103h61.524c1.161 0 2.103.942 2.103 2.104v40.5Z"/>
          <path stroke={svg1StrokeColor} strokeLinejoin="round" strokeWidth="3" d="M54.592 44.603h65.731l5.705 9.05H49l5.592-9.05Z"/>
        </svg>
        
        {/* 새로운 SVG - svg1과 겹쳐서 나타남 */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="113" 
          height="114" 
          fill="none"
          style={{
            position: 'absolute',
            left: 'calc(50% - 185px)', // svg1보다 약간 왼쪽
            bottom: '40%',
            transform: `scale(${newSvgScale})`,
            transition: 'transform 0.3s ease-out',
            zIndex: 12 // svg1보다 위에 표시
          }}
        >
          <path fill="#fff" d="M55.133 112.022V32.449a1.5 1.5 0 0 1 3 0v79.573a1.5 1.5 0 1 1-3 0Z"/>
          <path fill="#fff" d="M83.86 16.027c7.856 0 15.03 2.38 20.273 6.3 5.242 3.917 8.628 9.444 8.63 15.676v.006l-.007.153a1.5 1.5 0 0 1-1.493 1.347c-.039 0-.077-.003-.115-.006H84.219a1.5 1.5 0 0 1-.925-.32c-8.306-6.508-19.094-6.663-25.453-.596a1.5 1.5 0 0 1-2.535-1.057c-.009-.476-.055-.946-.128-1.445a1.421 1.421 0 0 1-.01-.092 1.496 1.496 0 0 1-.021-.539c.564-3.821 2.425-7.296 5.157-10.203 3.172-3.402 7.576-6.041 12.65-7.602l.637-.192c3.198-.932 6.654-1.43 10.269-1.43Zm0 3c-3.563 0-6.936.524-10.009 1.486l-.008.002c-4.653 1.43-8.583 3.819-11.348 6.786l-.004.004c-1.971 2.097-3.358 4.465-4.04 6.987 7.575-4.934 18.157-3.91 26.278 2.21h24.952c-.486-4.494-3.134-8.627-7.344-11.774-4.676-3.494-11.205-5.7-18.477-5.7Z"/>
          <path fill="#fff" d="M55.777 36.416c7.692-7.339 20.185-6.782 29.357.393.92.7 1.806 1.486 2.636 2.321l.436.445c9.024 9.424 10.26 23.578 1.98 31.859-.282.281-.663.44-1.061.44h-.006a1.5 1.5 0 0 1-1.06-.44l-32.37-32.37a1.499 1.499 0 0 1-.375-1.494l-.002-.058v-.01c0-.41.169-.803.465-1.086Zm27.524 2.768c-7.947-6.226-18.164-6.64-24.602-1.352l30.37 30.37c5.827-7.1 4.72-18.812-3.42-26.95l-.004-.005a22.562 22.562 0 0 0-2.327-2.05l-.017-.013Z"/>
          <path fill="#fff" d="M29.416 16.016c3.809 0 7.445.555 10.785 1.58l.102.029c5.089 1.566 9.494 4.216 12.667 7.624 2.734 2.91 4.584 6.385 5.148 10.198.023.16.017.32-.01.477a1.493 1.493 0 0 1-.042.25c-.06.456-.098.902-.107 1.35a1.502 1.502 0 0 1-2.535 1.056c-6.359-6.067-17.147-5.91-25.442.597-.264.207-.59.32-.926.32H2.001a1.5 1.5 0 0 1-1.5-1.5c0-6.234 3.388-11.764 8.632-15.683 5.245-3.918 12.421-6.298 20.283-6.298Zm0 3c-7.278 0-13.81 2.207-18.487 5.702C6.716 27.866 4.07 32 3.583 36.498h24.962c8.113-6.123 18.694-7.145 26.269-2.21-.68-2.521-2.06-4.889-4.03-6.984l-.004-.005c-2.756-2.962-6.667-5.354-11.307-6.79l-.066-.018c-3.07-.953-6.44-1.475-9.991-1.475Zm28.597 17.33.008-.02v-.004l-.008.025Zm.066-.287v.003l.002-.007-.002.004Zm.002-.01.002-.014a1.443 1.443 0 0 0-.002.015Z"/>
                    <path fill="#fff" d="M28.152 36.81c9.161-7.177 21.656-7.732 29.347-.394.305.292.47.697.461 1.117a1.493 1.493 0 0 1-.416 1.58L25.211 71.433a1.5 1.5 0 0 1-2.12 0c-8.4-8.41-7.005-22.89 2.426-32.305a26.11 26.11 0 0 1 2.635-2.32Zm26.426 1.025c-6.438-5.29-16.656-4.878-24.592 1.348l-.018.014a23.121 23.121 0 0 0-2.331 2.054l-.001.001c-8.146 8.132-9.248 19.845-3.43 26.947l30.372-30.364ZM25.574 4.79c3.604-3.605 8.74-4.83 13.984-4.074 5.242.757 10.692 3.497 15.17 7.977.678.678 1.318 1.38 1.916 2.101a30.202 30.202 0 0 1 1.914-2.1c4.478-4.479 9.929-7.219 15.17-7.976 5.24-.758 10.375.467 13.974 4.072a1.5 1.5 0 0 1 0 2.12L74.475 20.136a1.5 1.5 0 1 1-2.121-2.121L84.445 5.922c-2.706-2.048-6.333-2.807-10.29-2.235-4.54.656-9.412 3.063-13.477 7.129a26.108 26.108 0 0 0-2.809 3.301 1.5 1.5 0 0 1-2.44.004 26.711 26.711 0 0 0-2.823-3.306C48.542 6.746 43.67 4.34 39.13 3.685c-3.959-.572-7.59.188-10.3 2.238l12.082 12.081.103.114a1.5 1.5 0 0 1-2.11 2.11l-.114-.102L25.574 6.91a1.5 1.5 0 0 1 0-2.12Z"/>
        </svg>
        
        {/* 두 번째 새로운 SVG - svg1보다 위쪽에 나타남 */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="87" 
          height="79" 
          fill="none"
          style={{
            position: 'absolute',
            left: 'calc(50% - 44px)', // svg1 가운데 정렬
            bottom: '110%', // svg1보다 위쪽
            transform: `scale(${newSvg2Scale})`,
            transition: 'transform 0.3s ease-out',
            zIndex: 12 // svg1보다 위에 표시
          }}
        >
          <path fill="#fff" d="M41.6 77.001v-52.66a1.5 1.5 0 0 1 3 0v52.66a1.5 1.5 0 0 1-3 0Z"/>
          <path fill="#fff" d="M64.01 12.2c5.992 0 11.477 1.814 15.497 4.819s6.651 7.272 6.651 12.113l-.006.153a1.501 1.501 0 0 1-1.494 1.347c-.025 0-.05-.003-.076-.004h-20.3c-.336 0-.662-.113-.926-.32-6.152-4.82-14.069-4.887-18.696-.473a1.5 1.5 0 0 1-2.535-1.057 8.258 8.258 0 0 0-.093-1.043 1.435 1.435 0 0 1-.008-.077 1.499 1.499 0 0 1-.015-.505c.438-2.965 1.88-5.651 3.982-7.887 2.442-2.618 5.822-4.639 9.7-5.83 2.577-.805 5.38-1.237 8.319-1.237ZM42.054 27.787a1.28 1.28 0 0 0-.001-.008v.008ZM64.01 15.2c-2.649 0-5.153.39-7.43 1.103l-.008.002c-3.454 1.061-6.357 2.83-8.39 5.011l-.004.005c-1.205 1.282-2.109 2.695-2.664 4.189 5.747-3.202 13.366-2.278 19.272 2.119h18.26c-.464-3.108-2.356-5.98-5.335-8.206-3.454-2.581-8.294-4.223-13.701-4.223Z"/>
          <path fill="#fff" d="M42.598 27.665c5.964-5.69 15.597-5.217 22.616.283h-.001a19.621 19.621 0 0 1 2.008 1.768c7.2 7.2 8.34 18.344 1.82 24.864a1.5 1.5 0 0 1-1.06.44h-.005a1.5 1.5 0 0 1-1.06-.44L42.524 30.19a1.5 1.5 0 0 1-.392-1.435v-.004c0-.41.168-.802.465-1.085Zm20.766 2.644c-5.752-4.507-13.048-4.859-17.753-1.276l22.294 22.294c3.955-5.201 3.106-13.579-2.805-19.49l-.003-.003a16.632 16.632 0 0 0-1.716-1.511l-.017-.014Z"/>
          <path fill="#fff" d="M22.987 12.191c2.903 0 5.676.424 8.226 1.207.029.007.058.013.087.022 3.89 1.197 7.27 3.228 9.712 5.851h-.001c2.1 2.238 3.532 4.92 3.97 7.877a1.5 1.5 0 0 1-.007.46 1.498 1.498 0 0 1-.033.203 8.65 8.65 0 0 0-.076.963 1.502 1.502 0 0 1-2.535 1.057c-4.627-4.415-12.544-4.347-18.687.473a1.5 1.5 0 0 1-.926.32H2.33a1.5 1.5 0 0 1-1.5-1.5c0-4.84 2.63-9.108 6.652-12.113 4.022-3.005 9.509-4.82 15.504-4.82Zm21.965 15.517.003-.018a1.44 1.44 0 0 0-.003.018ZM22.987 15.191c-5.411 0-10.253 1.642-13.708 4.223-2.98 2.227-4.872 5.1-5.336 8.21H22.21c5.9-4.398 13.52-5.32 19.266-2.12-.554-1.492-1.453-2.904-2.656-4.184l-.005-.006c-2.028-2.18-4.92-3.951-8.369-5.017l-.04-.01c-2.277-.707-4.778-1.096-7.419-1.096Z"/>
          <path fill="#fff" d="M21.813 27.935c7.01-5.488 16.633-5.955 22.592-.27.29.277.453.657.462 1.054a1.494 1.494 0 0 1-.417 1.502l-24.367 24.36a1.5 1.5 0 0 1-2.122-.002c-6.51-6.52-5.381-17.666 1.829-24.864a20.056 20.056 0 0 1 2.023-1.78Zm19.58 1.099c-4.706-3.584-12.001-3.232-17.746 1.275l-.017.014c-.587.445-1.161.956-1.72 1.514v.001c-5.915 5.905-6.761 14.283-2.814 19.486l22.297-22.29ZM19.832 3.839C22.649 1.022 26.645.082 30.682.665c4.037.582 8.215 2.689 11.64 6.116.413.413.808.837 1.183 1.272.374-.435.767-.86 1.18-1.272C48.11 3.356 52.289 1.25 56.325.667c4.035-.583 8.03.355 10.844 3.173a1.5 1.5 0 0 1-.001 2.12l-9.966 9.967a1.5 1.5 0 0 1-2.12-2.122l8.8-8.803c-1.905-1.286-4.393-1.762-7.13-1.366-3.333.481-6.933 2.254-9.945 5.267a19.305 19.305 0 0 0-2.078 2.44 1.5 1.5 0 0 1-2.44.005 19.766 19.766 0 0 0-2.088-2.445c-3.012-3.015-6.612-4.787-9.947-5.268-2.738-.396-5.229.08-7.138 1.367l8.795 8.795a1.5 1.5 0 0 1-2.008 2.224l-.113-.103-9.958-9.957a1.502 1.502 0 0 1 0-2.122Z"/>
        </svg>
        
        {/* 세 번째 새로운 SVG - svg1 오른쪽에 나타남 (왼쪽과 동일한 내용) */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="113" 
          height="114" 
          fill="none"
          style={{
            position: 'absolute',
            left: 'calc(50% + 70px)', // svg1보다 약간 왼쪽
            bottom: '40%',
            transform: `scale(${newSvgScale})`,
            transition: 'transform 0.3s ease-out',
            zIndex: 12 // svg1보다 위에 표시
          }}
        >
          <path fill="#fff" d="M55.133 112.022V32.449a1.5 1.5 0 0 1 3 0v79.573a1.5 1.5 0 1 1-3 0Z"/>
          <path fill="#fff" d="M83.86 16.027c7.856 0 15.03 2.38 20.273 6.3 5.242 3.917 8.628 9.444 8.63 15.676v.006l-.007.153a1.5 1.5 0 0 1-1.493 1.347c-.039 0-.077-.003-.115-.006H84.219a1.5 1.5 0 0 1-.925-.32c-8.306-6.508-19.094-6.663-25.453-.596a1.5 1.5 0 0 1-2.535-1.057c-.009-.476-.055-.946-.128-1.445a1.421 1.421 0 0 1-.01-.092 1.496 1.496 0 0 1-.021-.539c.564-3.821 2.425-7.296 5.157-10.203 3.172-3.402 7.576-6.041 12.65-7.602l.637-.192c3.198-.932 6.654-1.43 10.269-1.43Zm0 3c-3.563 0-6.936.524-10.009 1.486l-.008.002c-4.653 1.43-8.583 3.819-11.348 6.786l-.004.004c-1.971 2.097-3.358 4.465-4.04 6.987 7.575-4.934 18.157-3.91 26.278 2.21h24.952c-.486-4.494-3.134-8.627-7.344-11.774-4.676-3.494-11.205-5.7-18.477-5.7Z"/>
          <path fill="#fff" d="M55.777 36.416c7.692-7.339 20.185-6.782 29.357.393.92.7 1.806 1.486 2.636 2.321l.436.445c9.024 9.424 10.26 23.578 1.98 31.859-.282.281-.663.44-1.061.44h-.006a1.5 1.5 0 0 1-1.06-.44l-32.37-32.37a1.499 1.499 0 0 1-.375-1.494l-.002-.058v-.01c0-.41.169-.803.465-1.086Zm27.524 2.768c-7.947-6.226-18.164-6.64-24.602-1.352l30.37 30.37c5.827-7.1 4.72-18.812-3.42-26.95l-.004-.005a22.562 22.562 0 0 0-2.327-2.05l-.017-.013Z"/>
          <path fill="#fff" d="M29.416 16.016c3.809 0 7.445.555 10.785 1.58l.102.029c5.089 1.566 9.494 4.216 12.667 7.624 2.734 2.91 4.584 6.385 5.148 10.198.023.16.017.32-.01.477a1.493 1.493 0 0 1-.042.25c-.06.456-.098.902-.107 1.35a1.502 1.502 0 0 1-2.535 1.056c-6.359-6.067-17.147-5.91-25.442.597-.264.207-.59.32-.926.32H2.001a1.5 1.5 0 0 1-1.5-1.5c0-6.234 3.388-11.764 8.632-15.683 5.245-3.918 12.421-6.298 20.283-6.298Zm0 3c-7.278 0-13.81 2.207-18.487 5.702C6.716 27.866 4.07 32 3.583 36.498h24.962c8.113-6.123 18.694-7.145 26.269-2.21-.68-2.521-2.06-4.889-4.03-6.984l-.004-.005c-2.756-2.962-6.667-5.354-11.307-6.79l-.066-.018c-3.07-.953-6.44-1.475-9.991-1.475Zm28.597 17.33.008-.02v-.004l-.008.025Zm.066-.287v.003l.002-.007-.002.004Zm.002-.01.002-.014a1.443 1.443 0 0 0-.002.015Z"/>
                    <path fill="#fff" d="M28.152 36.81c9.161-7.177 21.656-7.732 29.347-.394.305.292.47.697.461 1.117a1.493 1.493 0 0 1-.416 1.58L25.211 71.433a1.5 1.5 0 0 1-2.12 0c-8.4-8.41-7.005-22.89 2.426-32.305a26.11 26.11 0 0 1 2.635-2.32Zm26.426 1.025c-6.438-5.29-16.656-4.878-24.592 1.348l-.018.014a23.121 23.121 0 0 0-2.331 2.054l-.001.001c-8.146 8.132-9.248 19.845-3.43 26.947l30.372-30.364ZM25.574 4.79c3.604-3.605 8.74-4.83 13.984-4.074 5.242.757 10.692 3.497 15.17 7.977.678.678 1.318 1.38 1.916 2.101a30.202 30.202 0 0 1 1.914-2.1c4.478-4.479 9.929-7.219 15.17-7.976 5.24-.758 10.375.467 13.974 4.072a1.5 1.5 0 0 1 0 2.12L74.475 20.136a1.5 1.5 0 1 1-2.121-2.121L84.445 5.922c-2.706-2.048-6.333-2.807-10.29-2.235-4.54.656-9.412 3.063-13.477 7.129a26.108 26.108 0 0 0-2.809 3.301 1.5 1.5 0 0 1-2.44.004 26.711 26.711 0 0 0-2.823-3.306C48.542 6.746 43.67 4.34 39.13 3.685c-3.959-.572-7.59.188-10.3 2.238l12.082 12.081.103.114a1.5 1.5 0 0 1-2.11 2.11l-.114-.102L25.574 6.91a1.5 1.5 0 0 1 0-2.12Z"/>
        </svg>
        
        {/* line1: 점선 */}
          <div style={{ 
            width: `${Math.max(0, lineWidth)}vw`, 
            height: '3px', 
            display: 'flex', 
            alignItems: 'center', 
            overflow: 'hidden',
            transform: `translateY(${lineTranslateY}px)`,
            transition: 'transform 0.3s ease-out, width 0.3s ease-out, padding 0.3s ease-out',
            padding: `0 ${linePadding}px`
          }}>
            <svg 
              width="100%" 
              height="3" 
              viewBox="0 0 100 3" 
              preserveAspectRatio="none" 
              style={{ 
                opacity: lineOpacity, 
                transition: 'opacity 0.1s ease-out',
                visibility: lineWidth > 0 ? 'visible' : 'hidden' // width가 0일 때 숨김
              }}
            >
              <line x1="0" y1="1.5" x2="100%" y2="1.5" stroke={lineStrokeColor} strokeWidth="3" strokeDasharray="3,3"/>
            </svg>
          </div>
          
                  {/* svg2: 야자나무 2개 */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width={svg2Width}
          height="146" 
          fill="none"
          style={{
            transform: `translate(${svg2TranslateX}vw, ${svg2TranslateY}px)`,
            transition: 'transform 0.3s ease-out, width 0.3s ease-out'
          }}
        >
            <path stroke={svg2StrokeColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M45.191 81v63.358M88.687 86.057H67.154c-6.959-5.452-16.232-5.739-21.828-.4a10.27 10.27 0 0 0-.113-1.3v-.041c-.009-.043-.009-.072-.026-.114.409-2.764 1.76-5.314 3.796-7.48 2.364-2.538 5.684-4.54 9.559-5.731 2.566-.804 5.372-1.237 8.326-1.237 12.046 0 21.82 7.304 21.82 16.308v-.005Z"/>
            <path stroke={svg2StrokeColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M71.058 111.832 45.284 86.058h.06c0-.13 0-.261-.01-.392v-.008c5.596-5.34 14.87-5.053 21.828.4.686.521 1.35 1.11 1.978 1.741 7.165 7.165 8.032 17.924 1.922 24.033h-.004ZM45.191 84.198c-.017.042-.017.076-.017.114-.008.025-.017.042-.017.059-.058.425-.096.85-.105 1.283-5.596-5.34-14.869-5.053-21.819.4H1.691c0-9.004 9.774-16.308 21.828-16.308 2.945 0 5.747.433 8.31 1.229h.008c3.883 1.195 7.203 3.206 9.567 5.747 2.037 2.167 3.379 4.716 3.787 7.476Z"/>
            <path stroke={svg2StrokeColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M45.111 86.058 19.33 111.832c-6.1-6.109-5.243-16.872 1.931-24.033a19.595 19.595 0 0 1 1.977-1.742c6.95-5.452 16.224-5.738 21.82-.4-.009.131-.009.27-.009.4h.068-.005ZM31.828 70.977 21.305 60.455c5.087-5.087 14.722-3.698 21.525 3.11a22.452 22.452 0 0 1 2.373 2.78 21.975 21.975 0 0 1 2.364-2.78c6.804-6.804 16.438-8.197 21.517-3.11l-10.531 10.53M136.696 35.115V144.36M196.607 41.486h-29.658c-9.584-7.514-22.357-7.905-30.061-.55a13.374 13.374 0 0 0-.16-1.793v-.055c-.013-.055-.013-.1-.034-.16.564-3.807 2.424-7.32 5.226-10.308 3.256-3.492 7.826-6.252 13.165-7.897 3.538-1.102 7.4-1.7 11.465-1.7 16.589 0 30.048 10.06 30.048 22.46l.009.003Z"/>
            <path stroke={svg2StrokeColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m172.322 76.986-35.501-35.502h.08c0-.18 0-.361-.013-.538v-.013c7.704-7.354 20.477-6.959 30.062.551.946.72 1.859 1.532 2.726 2.398 9.866 9.867 11.061 24.69 2.646 33.104ZM136.698 38.928c-.021.055-.021.101-.021.16a.218.218 0 0 0-.021.08c-.08.585-.135 1.17-.147 1.767-7.704-7.355-20.478-6.959-30.054.551H76.79c0-12.399 13.459-22.458 30.061-22.458 4.056 0 7.918.598 11.444 1.692h.013c5.351 1.645 9.925 4.413 13.177 7.918 2.806 2.987 4.653 6.5 5.213 10.295v-.004Z"/>
            <path stroke={svg2StrokeColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M136.584 41.486 101.07 76.987c-8.402-8.414-7.22-23.237 2.659-33.103a27.023 27.023 0 0 1 2.726-2.398c9.576-7.514 22.346-7.906 30.054-.551-.013.18-.013.37-.013.55h.088ZM118.294 20.714 103.8 6.22c7.005-7.006 20.275-5.091 29.645 4.278a31.04 31.04 0 0 1 3.265 3.83 29.872 29.872 0 0 1 3.256-3.83c9.37-9.37 22.64-11.284 29.632-4.278l-14.507 14.507"/>
          </svg>
        </div>
      </section>
        
      {/* 스크롤 애니메이션을 위한 투명한 스페이서 - 섹션 외부 */}
      {showSpacer && (
        <div 
          style={{
            height: isMobile ? '2000vh' : '1400vh', // 모바일에서는 절반으로 줄임 (700vh vs 1400vh)
            width: '100%',
            background: 'transparent',
            pointerEvents: 'none'
          }}
        />
      )}
    </>
  );
};

export default Section3;
