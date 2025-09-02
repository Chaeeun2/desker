import React, { useState, useEffect, useRef } from 'react';
import styles from './RightBottomIcon.module.css';
import SurveyModal from './SurveyModal';

const RightBottomIcon = ({ isSection1Visible, isSection2Visible }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoTooltipVisible, setIsAutoTooltipVisible] = useState(false);
  const [hasTriggeredAutoTooltip, setHasTriggeredAutoTooltip] = useState(false);
  const autoTooltipTimeoutRef = useRef(null);

  const handleIconClick = () => {
    // 클릭 시 자동 툴팁 숨김
    if (isAutoTooltipVisible) {
      console.log('클릭으로 자동 툴팁 숨김');
      setIsAutoTooltipVisible(false);
      if (autoTooltipTimeoutRef.current) {
        clearTimeout(autoTooltipTimeoutRef.current);
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Section2 진입 시 자동 툴팁 노출
  useEffect(() => {
    if (isSection2Visible && !hasTriggeredAutoTooltip) {
      console.log('Section2 진입 - 자동 툴팁 시작');
      // 자동 툴팁 표시
      setIsAutoTooltipVisible(true);
      setHasTriggeredAutoTooltip(true);
      
      // 5초 후 자동으로 숨김
      autoTooltipTimeoutRef.current = setTimeout(() => {
        console.log('5초 후 자동 툴팁 숨김');
        setIsAutoTooltipVisible(false);
      }, 5000);
    }
  }, [isSection2Visible, hasTriggeredAutoTooltip]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (autoTooltipTimeoutRef.current) {
        clearTimeout(autoTooltipTimeoutRef.current);
      }
    };
  }, []);

  // 마우스 호버 시 자동 툴팁 숨김
  const handleMouseEnter = () => {
    console.log('마우스 진입');
    setIsHovered(true);
    if (isAutoTooltipVisible) {
      console.log('호버로 자동 툴팁 숨김');
      setIsAutoTooltipVisible(false);
      if (autoTooltipTimeoutRef.current) {
        clearTimeout(autoTooltipTimeoutRef.current);
      }
    }
  };

  const handleMouseLeave = () => {
    console.log('마우스 떠남');
    setIsHovered(false);
  };

  // 디버깅용 로그
  useEffect(() => {
    console.log('상태 변경:', {
      isSection2Visible,
      hasTriggeredAutoTooltip,
      isAutoTooltipVisible,
      isHovered
    });
  }, [isSection2Visible, hasTriggeredAutoTooltip, isAutoTooltipVisible, isHovered]);

  return (
    <>
      <div className={`${styles.rightBottomIcon} ${isSection1Visible ? styles.hidden : ''}`}>
        <div 
          className={styles.iconContainer}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleIconClick}
        >
          <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/icon.png" alt="Character Icon" className={styles.characterIcon} />
          <span className={styles.notificationBadge}>1</span>
          
          {/* 호버 시 말풍선 또는 자동 툴팁 */}
          <div className={`${styles.tooltip} ${(isHovered || isAutoTooltipVisible) ? styles.visible : ''}`}>
            <span>더 나은 WORK-LIFE에 대한 
<br/>여러분의 이야기를 들려주세요!
</span>
          </div>
        </div>
      </div>

      {/* 설문 모달 */}
      <SurveyModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default RightBottomIcon;
