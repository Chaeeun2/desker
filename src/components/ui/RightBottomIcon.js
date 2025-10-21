import React, { useState, useEffect, useRef } from 'react';
import styles from './RightBottomIcon.module.css';
import SurveyModal from './SurveyModal';

const RightBottomIcon = ({ isSection1Visible, isSection2Visible, isSection5Visible, isSection6Visible, isSection8Visible, isSection10Visible }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoTooltipVisible, setIsAutoTooltipVisible] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const autoTooltipTimeoutRef = useRef(null);

  // 섹션별 툴팁 메시지 정의
  const tooltipMessages = {
    section2: '더 나은 WORK-LIFE에 대한\n여러분의 이야기를 들려주세요!',
    section5: '워케이션에 대한\n여러분의 생각을 나눠주세요!',
    section6: '설문에 참여하고\n소중한 의견을 공유해주세요!',
    section8: '여러분의 경험을\n들려주세요!'
  };

  const handleIconClick = () => {
    // GTM 이벤트 전송
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'survey_button'
      });
    }

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

  // Section2, 5, 6, 8 진입 시 자동 툴팁 노출
  useEffect(() => {
    console.log('🔍 Tooltip Debug:', {
      isSection2Visible,
      isSection5Visible,
      isSection6Visible,
      isSection8Visible
    });

    let message = '';

    // 우선순위: Section 2 > 5 > 6 > 8
    if (isSection2Visible) {
      message = tooltipMessages.section2;
      console.log('✅ Section 2 tooltip activated');
    } else if (isSection5Visible) {
      message = tooltipMessages.section5;
      console.log('✅ Section 5 tooltip activated');
    } else if (isSection6Visible) {
      message = tooltipMessages.section6;
      console.log('✅ Section 6 tooltip activated');
    } else if (isSection8Visible) {
      message = tooltipMessages.section8;
      console.log('✅ Section 8 tooltip activated');
    }
    
    // 메시지가 있으면 툴팁 표시
    if (message) {
      // 이전 타이머가 있다면 취소
      if (autoTooltipTimeoutRef.current) {
        clearTimeout(autoTooltipTimeoutRef.current);
      }
      
      // 툴팁 메시지 설정 및 표시
      setTooltipMessage(message);
      setIsAutoTooltipVisible(true);
      
      // 3초 후 자동으로 숨김
      autoTooltipTimeoutRef.current = setTimeout(() => {
        setIsAutoTooltipVisible(false);
      }, 3000);
    }
  }, [isSection2Visible, isSection5Visible, isSection6Visible, isSection8Visible]);

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
            <span>
              {isAutoTooltipVisible && tooltipMessage
                ? tooltipMessage.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < tooltipMessage.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))
                : <>더 나은 WORK-LIFE에 대한<br />여러분의 이야기를 들려주세요!</>
              }
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
