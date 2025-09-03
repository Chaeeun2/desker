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
  const [workLifeData, setWorkLifeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Firebase에서 work-life 데이터 로드 (무한 재시도)
  useEffect(() => {
    let isMounted = true;

    const loadWorkLifeData = async () => {
      while (isMounted) {
        try {
          console.log('Firebase에서 WorkLife 데이터 로드 시도...');
          
          const docRef = doc(db, 'settings', 'workLifeSection');
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('WorkLife 데이터 로드 성공:', data);
            
            if (isMounted) {
              setWorkLifeData(data);
              setIsLoading(false);
              setError(null);
            }
            return; // 성공하면 루프 종료
          } else {
            throw new Error('Firebase 문서가 존재하지 않습니다');
          }
        } catch (err) {
          console.error('WorkLife 데이터 로드 실패:', err);
          
          if (isMounted) {
            setError(err.message);
          }
          
          // 3초 후 재시도
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    };

    loadWorkLifeData();

    // cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // 동적 CSS 스타일 생성
  useEffect(() => {
    if (!workLifeData) return;

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
      
      const itemIndex = index + 1;
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
  }, [workLifeData]);

  // fade in 애니메이션을 위한 intersection observer
  const [headerRef, headerIntersecting, headerHasIntersected] = useIntersectionObserver({ threshold: 0.1 });
  const [descriptionRef, descriptionIntersecting, descriptionHasIntersected] = useIntersectionObserver({ threshold: 0.1 });
  const [gridRef, gridIntersecting, gridHasIntersected] = useIntersectionObserver({ threshold: 0.1 });

  // 데이터 로딩 완료 후 강제로 페이드인 트리거
  useEffect(() => {
    if (workLifeData && !isLoading) {
      // 작은 딜레이 후 강제로 페이드인 트리거
      const timer = setTimeout(() => {
        // 스크롤 위치 체크해서 이미 보이는 영역이면 강제로 fadeIn 클래스 추가
        const headerElement = headerRef.current;
        const descriptionElement = descriptionRef.current;
        const gridElement = gridRef.current;
        
        if (headerElement) {
          const rect = headerElement.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
          if (isVisible) {
            headerElement.classList.add(styles.fadeIn);
          }
        }
        
        if (descriptionElement) {
          const rect = descriptionElement.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
          if (isVisible) {
            descriptionElement.classList.add(styles.fadeIn);
          }
        }
        
        if (gridElement) {
          const rect = gridElement.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
          if (isVisible) {
            gridElement.classList.add(styles.fadeIn);
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [workLifeData, isLoading, headerRef, descriptionRef, gridRef]);

  // 아이템 클릭 핸들러
  const handleItemClick = (itemIndex) => {
    const currentState = itemStates[itemIndex]?.isExpanded || false;
    
    if (!currentState) {
      setItemStates(prev => ({
        ...prev,
        [itemIndex]: { isExpanded: true }
      }));
    } else {
      setItemStates(prev => ({
        ...prev,
        [itemIndex]: { isExpanded: false }
      }));
    }
  };

  // 로딩 중이거나 에러일 때
  if (isLoading || !workLifeData) {
    return (
      <section ref={sectionRef} className={styles.section10}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1>
              데스커가 제안하는
              <br />
              새로운 <span className={styles.highlight}>WORK-LIFE</span>
            </h1>
          </div>
          <div className={styles.description}>
            <p>Firebase에서 데이터를 불러오는 중입니다...</p>
            {error && (
              <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
                연결 중... ({error})
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

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
          {(() => {
            const itemOrder = workLifeData.itemOrder || ['item1', 'item2', 'item3', 'item4'];
            
            return itemOrder.map((itemKey, index) => {
              const itemData = workLifeData[itemKey];
              if (!itemData) {
                return null;
              }
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
            });
          })()}
        </div>
      </div>
    </section>
  );
};

export default Section10;