import React, { useRef } from "react";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import styles from "./11_Section.module.css";

const Section11 = () => {
  const sectionRef = useRef(null);
  
  // fade in 애니메이션을 위한 intersection observer
  const [mainTextRef, mainTextIntersecting, mainTextHasIntersected] = useIntersectionObserver({ threshold: 0.3 });
  const [copyrightRef, copyrightIntersecting, copyrightHasIntersected] = useIntersectionObserver({ threshold: 0.3 });

  return (
      <section ref={sectionRef} className={styles.section11}>
                  {/* 이미지 컨테이너 */}
        <div className={styles.imageContainer}>
          <img 
            src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/S11.png" 
          />
        </div>
          
        {/* 메인 감사 메시지 */}
        <div ref={mainTextRef} className={`${styles.mainText} ${mainTextHasIntersected ? styles.fadeIn : ''}`}>
          <p>
            데스커 워케이션의 여정에 함께해주신
            <br />
            모든 분들에게 감사합니다.
            <br /><br />
            앞으로도 더 나은 WORK-LIFE의 도전에
            <br />
            많은 관심 부탁드립니다.
          </p>
        </div>
      <div className={styles.content}>

        {/* 저작권 정보 */}
        <div ref={copyrightRef} className={`${styles.copyright} ${copyrightHasIntersected ? styles.fadeIn : ''}`}>
          <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/desker.png" />
          <p className={styles.copyrightText}>
            Copyright 2025 iloom CO, LTD. All rights reserved
          </p>
        </div>
      </div>
    </section>
  );
};

export default Section11;
