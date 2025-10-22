import React, { useState, useEffect, useRef } from 'react';
import styles from './RightBottomIcon.module.css';
import SurveyModal from './SurveyModal';

const RightBottomIcon = ({ isSection1Visible, isSection2Visible, isSection3Visible, isSection4Visible, isSection5Visible, isSection6Visible, isSection7Visible, isSection8Visible, isSection10Visible }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [showAutoTooltip, setShowAutoTooltip] = useState(false);
  const autoTooltipTimeoutRef = useRef(null);
  const lastShownSectionRef = useRef(null);

  // 스크롤 위치별 툴팁 메시지 정의
  const tooltipMessages = {
    text1: <>더 나은 WORK-LIFE에 대한<br />여러분의 이야기를 들려주세요!</>, // 섹션 2-4
    text2: <>워케이션에 대한<br />여러분의 생각을 나눠주세요!</>, // 섹션 5
    text3: <>설문에 참여하고<br />소중한 의견을 공유해주세요!</>, // 섹션 6-7
    text4: <>여러분의 경험을<br />들려주세요!</> // 섹션 8~
  };

  const handleIconClick = () => {
    // GTM 이벤트 전송
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'survey_button'
      });
    }

    
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 스크롤 위치에 따라 툴팁 메시지 결정 및 자동 표시 (5초 타이머)
  useEffect(() => {
    let message = '';
    let currentSection = null;

    // 먼저 특별 케이스 체크 (섹션 exit 감지)
    // 섹션 4 벗어남 → 섹션 5 툴팁
    if (!isSection4Visible && !isSection3Visible && !isSection2Visible &&
        !isSection5Visible && !isSection6Visible && !isSection7Visible && !isSection8Visible &&
        lastShownSectionRef.current === 'section2') {
      message = tooltipMessages.text2;
      currentSection = 'section5';
    }
    // 섹션 7 벗어남 → 섹션 8 툴팁
    else if (!isSection7Visible && !isSection6Visible && !isSection8Visible &&
        lastShownSectionRef.current === 'section6') {
      message = tooltipMessages.text4;
      currentSection = 'section8';
    }
    // 일반 케이스: 스크롤 위치에 따라 메시지 선택 (섹션 번호 역순으로 체크)
    else if (isSection8Visible && !isSection7Visible) {
      message = tooltipMessages.text4; // 섹션 8~ (섹션7이 완전히 사라진 후에만)
      currentSection = 'section8';
    } else if (isSection7Visible) {
      message = tooltipMessages.text3; // 섹션 7
      currentSection = null; // 섹션 7은 자동 표시 안 함
    } else if (isSection6Visible) {
      message = tooltipMessages.text3; // 섹션 6
      currentSection = 'section6';
    } else if (isSection5Visible) {
      message = tooltipMessages.text2; // 섹션 5
      currentSection = 'section5';
    } else if (isSection4Visible) {
      message = tooltipMessages.text1; // 섹션 4
      currentSection = null; // 섹션 4는 자동 표시 안 함
    } else if (isSection3Visible) {
      message = tooltipMessages.text1; // 섹션 3
      currentSection = null; // 섹션 3은 자동 표시 안 함
    } else if (isSection2Visible) {
      message = tooltipMessages.text1; // 섹션 2
      currentSection = 'section2';
    }

    // 메시지가 있으면 설정
    if (message) {
      setTooltipMessage(message);
    }

    // 새로운 섹션에 진입했을 때만 자동 툴팁 표시
    if (currentSection && currentSection !== lastShownSectionRef.current) {
      // 이전 타이머 클리어
      if (autoTooltipTimeoutRef.current) {
        clearTimeout(autoTooltipTimeoutRef.current);
      }

      // 툴팁 표시
      setShowAutoTooltip(true);
      lastShownSectionRef.current = currentSection;

      // 5초 후 자동으로 숨김
      autoTooltipTimeoutRef.current = setTimeout(() => {
        setShowAutoTooltip(false);
      }, 5000);
    }
  }, [isSection2Visible, isSection3Visible, isSection4Visible, isSection5Visible, isSection6Visible, isSection7Visible, isSection8Visible]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (autoTooltipTimeoutRef.current) {
        clearTimeout(autoTooltipTimeoutRef.current);
      }
    };
  }, []);

  

  // 마우스 호버 이벤트
  const handleMouseEnter = () => {
    setIsHovered(true);
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
          <div className={`${styles.tooltip} ${(isHovered || showAutoTooltip) ? styles.visible : ''}`}>
            <span>
              {tooltipMessage || <>더 나은 WORK-LIFE에 대한<br />여러분의 이야기를 들려주세요!</>}
            </span>
          </div>
        </div>

        {/* 버튼 하단 텍스트 */}
        <div className={styles.bottomText}>
          워크라이프<br/>설문 참여하기
        </div>
      </div>

      {/* 설문 모달 */}
      <SurveyModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default RightBottomIcon;
