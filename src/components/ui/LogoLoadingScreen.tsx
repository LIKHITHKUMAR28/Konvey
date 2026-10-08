import React, { useState, useEffect } from 'react';
import styles from './LogoLoadingScreen.module.css';

interface LogoLoadingScreenProps {
  message?: string;
  onFinish?: () => void;
  minDurationMs?: number;
}

export const LogoLoadingScreen: React.FC<LogoLoadingScreenProps> = ({
  message = 'Initializing Konvey Workspace...',
  onFinish,
  minDurationMs = 1200,
}) => {
  const [fadingOut, setFadingOut] = useState(false);
  const [statusText, setStatusText] = useState(message);

  useEffect(() => {
    const textTimer1 = setTimeout(() => {
      setStatusText('Syncing Delivery Signals & Blocker Radar...');
    }, 450);

    const textTimer2 = setTimeout(() => {
      setStatusText('Preparing Secure Workspace...');
    }, 850);

    const finishTimer = setTimeout(() => {
      setFadingOut(true);
      setTimeout(() => {
        if (onFinish) {
          onFinish();
        }
      }, 350); // duration of fade-out
    }, minDurationMs);

    return () => {
      clearTimeout(textTimer1);
      clearTimeout(textTimer2);
      clearTimeout(finishTimer);
    };
  }, [minDurationMs, onFinish]);

  return (
    <div className={`${styles.splashContainer} ${fadingOut ? styles.splashFadeOut : ''}`}>
      {/* Subtle ambient background glow */}
      <div className={styles.ambientGlow} />

      <div className={styles.loaderContent}>
        {/* Animated Circle Apparatus with Logo */}
        <div className={styles.circleApparatus}>
          {/* Radiating pulse waves */}
          <div className={styles.pulseWaveOuter} />
          <div className={styles.pulseWaveInner} />

          {/* Rotating gradient track SVG */}
          <svg className={styles.spinnerSvg} viewBox="0 0 120 120">
            <defs>
              <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
            {/* Background subtle ring */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3"
            />
            {/* Animated spinning arc */}
            <circle
              className={styles.spinnerCircle}
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="url(#spinnerGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="90 230"
            />
          </svg>

          {/* Center Logo Holder with Logo.png */}
          <div className={styles.logoCircleHolder}>
            <img
              src="/logo.png"
              alt="Konvey Logo"
              className={styles.centerLogoImg}
            />
          </div>
        </div>

        {/* Brand Name & Loading Message */}
        <div className={styles.textContainer}>
          <div className={styles.brandTitleGroup}>
            <span className={styles.brandTitle}>KONVEY</span>
            <span className={styles.brandTagline}>Keep work moving.</span>
          </div>

          <p className={styles.statusMessage}>{statusText}</p>

          {/* Micro progress bar */}
          <div className={styles.progressBarWrapper}>
            <div className={styles.progressBarFill} />
          </div>
        </div>
      </div>
    </div>
  );
};
