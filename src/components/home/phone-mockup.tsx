import type { ReactNode } from 'react';

import styles from './home.module.css';

interface PhoneMockupProps {
  variant: 'android' | 'iphone';
  className: string;
  platform: string;
  caption: ReactNode;
  children: ReactNode;
}

export function PhoneMockup({ variant, className, platform, caption, children }: PhoneMockupProps) {
  const deviceClass = variant === 'iphone' ? styles.iphoneDevice : styles.androidDevice;

  return (
    <figure className={`${styles.phoneMockup} ${className}`}>
      <div className={`${styles.phoneDevice} ${deviceClass}`}>
        <span className={`${styles.deviceButton} ${styles.buttonUpper}`} aria-hidden="true" />
        <span className={`${styles.deviceButton} ${styles.buttonMiddle}`} aria-hidden="true" />
        <span className={`${styles.deviceButton} ${styles.buttonLower}`} aria-hidden="true" />
        <span className={`${styles.deviceButton} ${styles.buttonSide}`} aria-hidden="true" />

        <div className={styles.phoneScreen}>{children}</div>

        {variant === 'iphone' ? (
          <>
            <span className={styles.dynamicIsland} aria-hidden="true"><i /></span>
            <span className={styles.homeIndicator} aria-hidden="true" />
          </>
        ) : (
          <>
            <span className={styles.speakerSlot} aria-hidden="true" />
            <span className={styles.cameraPunch} aria-hidden="true"><i /></span>
            <span className={styles.gestureBar} aria-hidden="true" />
          </>
        )}
      </div>

      <figcaption className={styles.deviceCaption}>
        <strong><i />{platform}</strong>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
