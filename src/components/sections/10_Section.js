import React, { useRef, useEffect, useState } from "react";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import { db } from "../../admin/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import styles from "./10_Section.module.css";

const Section10 = () => {
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '-50px'
  });
  
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
        setIsLoading(false);
      }
    };

    loadWorkLifeData();
  }, []);

  // 동적 CSS 스타일 생성
  useEffect(() => {
    if (!workLifeData) return;

    const style = document.createElement('style');
    style.id = 'dynamic-worklife-gradients';
    
    const existingStyle = document.getElementById('dynamic-worklife-gradients');
    if (existingStyle) {
      existingStyle.remove();
    }

    let css = '';
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

  // 아이템 클릭 핸들러
  const handleItemClick = (itemIndex) => {
    setItemStates(prev => ({
      ...prev,
      [itemIndex]: { isExpanded: !prev[itemIndex]?.isExpanded }
    }));
  };

  if (isLoading || !workLifeData) {
    return (
      <section ref={ref} className={styles.section10}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1>
              데스커가 제안하는
              <br />
              새로운 <span className={styles.highlight}>WORK-LIFE</span>
            </h1>
          </div>
          <div className={styles.description}>
            <p>데이터를 불러오는 중입니다...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className={styles.section10}>
      <div className={styles.content}>
        <div className={`${styles.header} ${hasIntersected ? styles.fadeInUp : ''}`} style={{animationDelay: '0.2s'}}>
          <h1>
            데스커가 제안하는
            <br />
            새로운 <span className={styles.highlight}>WORK-LIFE</span>
          </h1>
        </div>
        
        <div className={`${styles.description} ${hasIntersected ? styles.fadeInUp : ''}`} style={{animationDelay: '0.4s'}}>
          <p>
            일하는 모든 이들을 위한 새로운 WORK & LIFE의 가능성에 함께하고자
            합니다.
          </p>
        </div>

        <div className={styles.gridContainer}>
          {(() => {
            const itemOrder = workLifeData.itemOrder || ['item1', 'item2', 'item3', 'item4'];
            
            return itemOrder.map((itemKey, index) => {
              const itemData = workLifeData[itemKey];
              if (!itemData) return null;
              
              const itemIndex = index + 1;
              return (
                <div 
                  key={itemKey} 
                  className={`${styles.gridItem} ${itemStates[itemIndex]?.isExpanded ? styles.expanded : ''} ${hasIntersected ? styles.fadeInUp : ''}`} 
                  data-item={itemIndex}
                  style={{ animationDelay: `${0.6 + index * 0.2}s` }}
                  onClick={() => handleItemClick(itemIndex)}
                >
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
                    <a 
                      href={itemData.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        pointerEvents: itemStates[itemIndex]?.isExpanded ? 'auto' : 'none' 
                      }}
                    >
                      <button 
                        className={`${styles.ctaButton} ${itemStates[itemIndex]?.isExpanded ? styles.visible : ''}`}
                        disabled={!itemStates[itemIndex]?.isExpanded}
                      >
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