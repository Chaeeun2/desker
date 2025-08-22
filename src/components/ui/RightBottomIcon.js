import React, { useState } from 'react';
import styles from './RightBottomIcon.module.css';
import SurveyModal from './SurveyModal';

const RightBottomIcon = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleIconClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={styles.rightBottomIcon}>
        <div 
          className={styles.iconContainer}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleIconClick}
        >
          <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/icon.png" alt="Character Icon" className={styles.characterIcon} />
          <span className={styles.notificationBadge}>1</span>
          
          {/* 호버 시 말풍선 */}
          <div className={`${styles.tooltip} ${isHovered ? styles.visible : ''}`}>
            <span>워크라이프 소식 받아보기</span>
          </div>
        </div>
      </div>

      {/* 설문 모달 */}
      <SurveyModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default RightBottomIcon;
