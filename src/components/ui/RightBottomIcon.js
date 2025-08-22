import React from 'react';
import styles from './RightBottomIcon.module.css';

const RightBottomIcon = () => {
  return (
    <div className={styles.rightBottomIcon}>
      <div className={styles.iconContainer}>
        <img src="https://pub-d4c8ae88017d4b4b9b44bb7f19c5472a.r2.dev/icon.png" alt="Character Icon" className={styles.characterIcon} />
        <span className={styles.notificationBadge}>1</span>
      </div>
    </div>
  );
};

export default RightBottomIcon;
