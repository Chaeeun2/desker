import React, { useState, useEffect, useRef } from 'react';
import styles from './RightBottomIcon.module.css';
import SurveyModal from './SurveyModal';

const RightBottomIcon = ({ isSection1Visible, isSection2Visible, isSection6Visible, isSection10Visible }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoTooltipVisible, setIsAutoTooltipVisible] = useState(false);
  const autoTooltipTimeoutRef = useRef(null);

  const handleIconClick = () => {
    // 클릭 시 자동 툴팁 숨김
    if (isAutoTooltipVisible) {
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

  // Section2, 6, 10 진입 시 자동 툴팁 노출
  useEffect(() => {
    console.log('섹션 가시성 상태:', {
      섹션2: isSection2Visible,
      섹션6: isSection6Visible,
      섹션10: isSection10Visible
    });
    
    // 섹션2, 6, 10 중 하나라도 보이면 툴팁 표시
    if (isSection2Visible || isSection6Visible || isSection10Visible) {
      console.log('자동 툴팁 트리거!');
      
      // 이전 타이머가 있다면 취소 (새로 진입할 때만)
      if (autoTooltipTimeoutRef.current) {
        clearTimeout(autoTooltipTimeoutRef.current);
      }
      
      // 자동 툴팁 표시
      setIsAutoTooltipVisible(true);
      
      // 5초 후 자동으로 숨김
      autoTooltipTimeoutRef.current = setTimeout(() => {
        console.log('자동 툴팁 숨김');
        setIsAutoTooltipVisible(false);
      }, 3000);
    }
    // 섹션을 벗어나도 타이머는 유지 (5초간 툴팁 표시 지속)
  }, [isSection2Visible, isSection6Visible, isSection10Visible]);

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
    setIsHovered(true);
    if (isAutoTooltipVisible) {
      setIsAutoTooltipVisible(false);
      if (autoTooltipTimeoutRef.current) {
        clearTimeout(autoTooltipTimeoutRef.current);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // 디버깅용 로그
  useEffect(() => {
  }, [isSection2Visible, isAutoTooltipVisible, isHovered]);

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
