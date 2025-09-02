import React, { useRef, useEffect, useState } from "react";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import { db } from "../../admin/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import styles from "./10_Section.module.css";

const Section10 = () => {
  const sectionRef = useRef(null);
  
  // 각 아이템의 상태 관리
  const [itemStates, setItemStates] = useState({
    1: { isExpanded: false },
    2: { isExpanded: false },
    3: { isExpanded: false },
    4: { isExpanded: false }
  });

  // Firebase 데이터 상태
  const [workLifeData, setWorkLifeData] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);

  // Firebase에서 work-life 데이터 로드
  useEffect(() => {
    const loadWorkLifeData = async () => {
      try {
        const docRef = doc(db, 'settings', 'workLifeSection');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setWorkLifeData(data);
        }
      } catch (error) {
        console.error('WorkLife 데이터 로드 실패:', error);
      } finally {
        setDataLoaded(true);
      }
    };

    loadWorkLifeData();
  }, []);

  // 동적 CSS 스타일 생성
  useEffect(() => {
    if (!dataLoaded || !workLifeData.item1) return;

    const style = document.createElement('style');
    style.id = 'dynamic-worklife-gradients';
    
    // 기존 동적 스타일 제거
    const existingStyle = document.getElementById('dynamic-worklife-gradients');
    if (existingStyle) {
      existingStyle.remove();
    }

    let css = '';
    
    // itemOrder를 사용하여 순서대로 처리
    const itemOrder = workLifeData.itemOrder || ['item1', 'item2', 'item3', 'item4'];
    itemOrder.forEach((itemKey, index) => {
      const itemData = workLifeData[itemKey];
      if (!itemData || !itemData.overlayColor) return;
      
      const itemIndex = index + 1; // nth-child는 1부터 시작
      const { r, g, b } = itemData.overlayColor;
      
      css += `
        [data-item="${itemIndex}"]::before {
          background: linear-gradient(
            0deg,
            rgba(${r}, ${g}, ${b}, 0) 0%,
            rgba(${r}, ${g}, ${b}, 1) 50%,
            rgba(${r}, ${g}, ${b}, 1) 100%
          ) !important;
        }
      `;
    });

    style.textContent = css;
    document.head.appendChild(style);

    return () => {
      const styleToRemove = document.getElementById('dynamic-worklife-gradients');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [workLifeData, dataLoaded]);

  // fade in 애니메이션을 위한 intersection observer
  const [headerRef, headerIntersecting, headerHasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [descriptionRef, descriptionIntersecting, descriptionHasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [gridRef, gridIntersecting, gridHasIntersected] = useIntersectionObserver({ threshold: 0.3 });

  // 아이템 클릭 핸들러
  const handleItemClick = (itemIndex) => {
    const currentState = itemStates[itemIndex]?.isExpanded || false;
    
    // Safari 감지
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    
    if (!currentState) {
      // 확장할 때: 즉시 확장
      setItemStates(prev => ({
        ...prev,
        [itemIndex]: { isExpanded: true }
      }));
    } else {
      // 축소할 때: 모든 변화 모니터링
      
      const textWrapper = document.querySelector(`[data-item="${itemIndex}"] .${styles.textWrapper}`);
      const iconWrapper = document.querySelector(`[data-item="${itemIndex}"] .${styles.iconWrapper}`);
      const gridItem = document.querySelector(`[data-item="${itemIndex}"]`);
      
      if (textWrapper && iconWrapper && gridItem) {
        
        // 상태 변경
        setItemStates(prev => ({
          ...prev,
          [itemIndex]: { isExpanded: false }
        }));
        
        // 실시간 모니터링 (모든 변화 추적)
        let monitorCount = 0;
        const fullMonitor = setInterval(() => {
          const textStyles = window.getComputedStyle(textWrapper);
          const iconStyles = window.getComputedStyle(iconWrapper);
          const gridStyles = window.getComputedStyle(gridItem);
          
          // 실제 DOM 요소의 크기와 위치 측정
          const textRect = textWrapper.getBoundingClientRect();
          const iconRect = iconWrapper.getBoundingClientRect();
          const gridRect = gridItem.getBoundingClientRect();
        
          
          if (monitorCount > 30) { // 3초 후 모니터링 중단
            clearInterval(fullMonitor);
          }
        }, 100);
        
        // 2초 후 최종 상태 확인
        setTimeout(() => {

          // 최종 DOM 실제 크기
          const finalTextRect = textWrapper.getBoundingClientRect();
          const finalIconRect = iconWrapper.getBoundingClientRect();
          const finalGridRect = gridItem.getBoundingClientRect();
        
          
          clearInterval(fullMonitor);
        }, 2000);
        
      } else {
        setItemStates(prev => ({
          ...prev,
          [itemIndex]: { isExpanded: false }
        }));
      }
    }
    
  };

  return (
    <section ref={sectionRef} className={styles.section10}>
      <div className={styles.content}>
        {/* 헤더 섹션 */}
        <div ref={headerRef} className={`${styles.header} ${headerHasIntersected ? styles.fadeIn : ''}`}>
          <h1>
            데스커가 제안하는
            <br />
            새로운 <span className={styles.highlight}>WORK-LIFE</span>
          </h1>
        </div>
        
        {/* 설명 섹션 */}
        <div ref={descriptionRef} className={`${styles.description} ${descriptionHasIntersected ? styles.fadeIn : ''}`}>
          <p>
            일하는 모든 이들을 위한 새로운 WORK & LIFE의 가능성에 함께하고자
            합니다.
          </p>
        </div>

        {/* 2x2 그리드 레이아웃 */}
        <div ref={gridRef} className={`${styles.gridContainer} ${gridHasIntersected ? styles.fadeIn : ''}`}>
          {dataLoaded && (workLifeData.itemOrder || ['item1', 'item2', 'item3', 'item4']).map((itemKey, index) => {
            const itemData = workLifeData[itemKey];
            if (!itemData) return null;
            const itemIndex = index + 1;
            return (
              <div key={itemKey} className={`${styles.gridItem} ${itemStates[itemIndex]?.isExpanded ? styles.expanded : ''}`} data-item={itemIndex}>
                <div className={styles.itemContent}>
                  <div className={`${styles.textWrapper} ${itemStates[itemIndex]?.isExpanded ? styles.hidden : ''}`}>
                    <p className={styles.itemContentText1} style={{ whiteSpace: 'pre-line' }}>
                      {itemData.subtitle}
                    </p>
                  </div>
                  <h3 style={{ whiteSpace: 'pre-line' }}>
                    {itemData.title}
                  </h3>
                  <div className={`${styles.iconWrapper} ${itemStates[itemIndex]?.isExpanded ? styles.hidden : ''}`}>
                    <div 
                      className={styles.plusIcon}
                      onClick={() => handleItemClick(itemIndex)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span>→</span>
                    </div>
                  </div>
                  <p className={`${styles.itemContentText2} ${itemStates[itemIndex]?.isExpanded ? styles.visible : ''}`} style={{ whiteSpace: 'pre-line' }}>
                    {itemData.description}
                  </p>
                  <a href={itemData.link} target="_blank" rel="noopener noreferrer">
                    <button className={`${styles.ctaButton} ${itemStates[itemIndex]?.isExpanded ? styles.visible : ''}`}>
                      {itemData.buttonText}
                    </button>
                  </a>
                  <div 
                    className={`${styles.closeIcon} ${itemStates[itemIndex]?.isExpanded ? styles.visible : ''}`}
                    onClick={() => handleItemClick(itemIndex)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>×</span>
                  </div>
                </div>
                <div className={styles.itemImage}>
                  <img
                    src={itemData.image}
                    alt={itemData.title}
                    className={styles.image}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Section10;