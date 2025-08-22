import React, { useState } from 'react';
import styles from './MobileFloatingMenu.module.css';
import SurveyModal from './SurveyModal';

const MobileFloatingMenu = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMenuClick = (menuType) => {
    console.log(`${menuType} 메뉴 클릭됨`);
    // 여기에 각 메뉴별 동작 추가
    if (menuType === 'news') {
      setIsModalOpen(true);
      setIsExpanded(false); // 메뉴 접기
    }
  };

  return (
    <>
      <div className={styles.mobileFloatingMenu}>
        {/* 메뉴 버튼들 */}
        <div className={`${styles.menuButtons} ${isExpanded ? styles.expanded : ''}`}>
          {/* 뉴스 버튼 */}
          <button 
            className={`${styles.menuButton} ${styles.newsButton}`}
            onClick={() => handleMenuClick('news')}
          >
            <div className={styles.buttonIcon}>
              <span className={styles.octopusIcon}>🐙</span>
            </div>
            {isExpanded && <span className={styles.menuLabel}>워크라이프 소식</span>}
          </button>

          {/* 설정 버튼 */}
          <button 
            className={`${styles.menuButton} ${styles.settingsButton}`}
            onClick={() => handleMenuClick('settings')}
          >
            <div className={styles.buttonIcon}>
              <span className={styles.settingsIcon}>⚙️</span>
            </div>
            {isExpanded && <span className={styles.menuLabel}>설정</span>}
          </button>

          {/* 도움말 버튼 */}
          <button 
            className={`${styles.menuButton} ${styles.helpButton}`}
            onClick={() => handleMenuClick('help')}
          >
            <div className={styles.buttonIcon}>
              <span className={styles.helpIcon}>❓</span>
            </div>
            {isExpanded && <span className={styles.menuLabel}>도움말</span>}
          </button>
        </div>

        {/* 토글 버튼 (+ 버튼) */}
        <button 
          className={`${styles.toggleButton} ${isExpanded ? styles.expanded : ''}`}
          onClick={handleToggle}
          aria-label={isExpanded ? '메뉴 접기' : '메뉴 펼치기'}
        >
          <span className={styles.plusIcon}>+</span>
        </button>
      </div>

      {/* 설문 모달 */}
      {isModalOpen && (
        <SurveyModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

export default MobileFloatingMenu;
