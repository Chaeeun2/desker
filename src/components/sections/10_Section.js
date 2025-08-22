import React, { useRef, useEffect, useState } from "react";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
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

  // fade in 애니메이션을 위한 intersection observer
  const [headerRef, headerIntersecting, headerHasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [descriptionRef, descriptionIntersecting, descriptionHasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [gridRef, gridIntersecting, gridHasIntersected] = useIntersectionObserver({ threshold: 0.3 });

  // 아이템 클릭 핸들러
  const handleItemClick = (itemIndex) => {
    const currentState = itemStates[itemIndex].isExpanded;
    
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
          {/* 데스커 라운지 홍대 */}
          <div className={`${styles.gridItem} ${itemStates[1].isExpanded ? styles.expanded : ''}`} data-item="1">
            <div className={styles.itemContent}>
              <div className={`${styles.textWrapper} ${itemStates[1].isExpanded ? styles.hidden : ''}`}>
                <p className={styles.itemContentText1}>
                  가치있게 일하는 사람들의 연결고리
                </p>
              </div>
              <h3>데스커 라운지 홍대</h3>
              <div className={`${styles.iconWrapper} ${itemStates[1].isExpanded ? styles.hidden : ''}`}>
                <div 
                  className={styles.plusIcon}
                  onClick={() => handleItemClick(1)}
                  style={{ cursor: 'pointer' }}
                >
                  <span>→</span>
                </div>
              </div>
              <p className={`${styles.itemContentText2} ${itemStates[1].isExpanded ? styles.visible : ''}`}>
                일을 통해 성장하는 사람들이 함께 연결되어,
                <br />
                다양한 가능성을 찾아갈 수 있는 공간을 꿈꿉니다.
                          </p>
                          <a href="https://www.instagram.com/desker_lounge_hd/" target="_blank">
              <button className={`${styles.ctaButton} ${itemStates[1].isExpanded ? styles.visible : ''}`}>
                데스커 라운지 홍대 보러가기 →
                              </button>
                              </a>
              <div 
                className={`${styles.closeIcon} ${itemStates[1].isExpanded ? styles.visible : ''}`}
                onClick={() => handleItemClick(1)}
                style={{ cursor: 'pointer' }}
              >
                <span>×</span>
              </div>
            </div>
            <div className={styles.itemImage}>
              <img
                src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S10-1.jpg"
                alt="데스커 라운지 홍대"
                className={styles.image}
              />
            </div>
          </div>

          {/* 데스커 라운지 대구 */}
          <div className={`${styles.gridItem} ${itemStates[2].isExpanded ? styles.expanded : ''}`} data-item="2">
            <div className={styles.itemContent}>
              <div className={`${styles.textWrapper} ${itemStates[2].isExpanded ? styles.hidden : ''}`}>
                <p className={styles.itemContentText1}>
                  삶을 위한 배움의 시작과 성장을 경험하는 공간
                </p>
              </div>
              <h3>데스커 라운지 대구</h3>
              <div className={`${styles.iconWrapper} ${itemStates[2].isExpanded ? styles.hidden : ''}`}>
                <div 
                  className={styles.plusIcon}
                  onClick={() => handleItemClick(2)}
                  style={{ cursor: 'pointer' }}
                >
                  <span>→</span>
                </div>
              </div>
              <p className={`${styles.itemContentText2} ${itemStates[2].isExpanded ? styles.visible : ''}`}>
                새로운 시작과 성장으로 이어갈 수 있는
                <br/>기회를 제공합니다.
                          </p>
                                                 <a href="https://www.instagram.com/desker_lounge_dg/" target="_blank">
              <button className={`${styles.ctaButton} ${itemStates[2].isExpanded ? styles.visible : ''}`}>
                데스커 라운지 대구 보러가기 →
                              </button>
                              </a>
              <div 
                className={`${styles.closeIcon} ${itemStates[2].isExpanded ? styles.visible : ''}`}
                onClick={() => handleItemClick(2)}
                style={{ cursor: 'pointer' }}
              >
                <span>×</span>
              </div>
            </div>
            <div className={styles.itemImage}>
              <img
                src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S10-2.jpg"
                alt="데스커 라운지 대구"
                className={styles.image}
              />
            </div>
          </div>

          {/* 데스커 베이스캠프 with nonce */}
          <div className={`${styles.gridItem} ${itemStates[3].isExpanded ? styles.expanded : ''}`} data-item="3">
            <div className={styles.itemContent}>
              <div className={`${styles.textWrapper} ${itemStates[3].isExpanded ? styles.hidden : ''}`}>
                <p className={styles.itemContentText1}>
                  미래의 창업가를 위한 성장 베이스 캠프
                </p>
              </div>
              <h3>데스커 베이스캠프<br/>with nonce</h3>
              <div className={`${styles.iconWrapper} ${itemStates[3].isExpanded ? styles.hidden : ''}`}>
                <div 
                  className={styles.plusIcon}
                  onClick={() => handleItemClick(3)}
                  style={{ cursor: 'pointer' }}
                >
                  <span>→</span>
                </div>
              </div>
              <p className={`${styles.itemContentText2} ${itemStates[3].isExpanded ? styles.visible : ''}`}>
                매년 150명의 창업 희망 학생을 선발해 
                <br/>전문가 멘토링, 기술 워크샵, 네트워크 등 
                <br/>다양한 프로그램을 통해 노하우를 전달하고 있습니다.
                          </p>
               <a href="https://www.instagram.com/desker_basecamp_with_nonce/" target="_blank">
              <button className={`${styles.ctaButton} ${itemStates[3].isExpanded ? styles.visible : ''}`}>
                데스커 베이스캠프 보러가기 →
                              </button>
                              </a>
              <div 
                className={`${styles.closeIcon} ${itemStates[3].isExpanded ? styles.visible : ''}`}
                onClick={() => handleItemClick(3)}
                style={{ cursor: 'pointer' }}
              >
                <span>×</span>
              </div>
            </div>
            <div className={styles.itemImage}>
              <img
                src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S10-3.jpg"
                alt="데스커 베이스캠프 with nonce"
                className={styles.image}
              />
            </div>
          </div>

          {/* differ */}
          <div className={`${styles.gridItem} ${itemStates[4].isExpanded ? styles.expanded : ''}`} data-item="4">
            <div className={styles.itemContent}>
              <div className={`${styles.textWrapper} ${itemStates[4].isExpanded ? styles.hidden : ''}`}>
                <p className={styles.itemContentText1}>
                  책상 앞 우리들의 성장 커뮤니티
                </p>
              </div>
              <h3>differ</h3>
              <div className={`${styles.iconWrapper} ${itemStates[4].isExpanded ? styles.hidden : ''}`}>
                <div 
                  className={styles.plusIcon}
                  onClick={() => handleItemClick(4)}
                  style={{ cursor: 'pointer' }}
                >
                  <span>→</span>
                </div>
              </div>
              <p className={`${styles.itemContentText2} ${itemStates[4].isExpanded ? styles.visible : ''}`}>
                책상에서 시작된 가능성의 이야기를 조명하고,
                <br/>그 앞에서 마주한 고민과 영감을 주고 받는
                <br/>성장 커뮤니티입니다.
                          </p>
                                         <a href="https://differ.co.kr/" target="_blank">
              <button className={`${styles.ctaButton} ${itemStates[4].isExpanded ? styles.visible : ''}`}>
           differ 보러가기 →
                              </button>
                              </a>
              <div 
                className={`${styles.closeIcon} ${itemStates[4].isExpanded ? styles.visible : ''}`}
                onClick={() => handleItemClick(4)}
                style={{ cursor: 'pointer' }}
              >
                <span>×</span>
              </div>
            </div>
            <div className={styles.itemImage}>
              <img
                src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S10-4.jpg"
                alt="differ"
                className={styles.image}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section10;