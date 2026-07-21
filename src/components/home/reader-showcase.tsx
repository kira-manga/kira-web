'use client';

import { useEffect, useState } from 'react';

import { LocalizedText } from '@/components/ui/localized-text';
import { AppScreen } from '@/components/ui/preferences';
import { homeCopy } from '@/content/home';
import type { AppScreenKey } from '@/content/media';

import styles from './home.module.css';

type ScreenPosition = 'start' | 'center' | 'end' | 'hidden';

const screenOrder = homeCopy.screens.tabs.map((tab) => tab.key) satisfies AppScreenKey[];

function getScreenPosition(screen: AppScreenKey, activeScreen: AppScreenKey): ScreenPosition {
  const activeIndex = screenOrder.indexOf(activeScreen);
  const screenIndex = screenOrder.indexOf(screen);
  if (screenIndex === activeIndex) return 'center';
  if (screenIndex === (activeIndex - 1 + screenOrder.length) % screenOrder.length) return 'start';
  if (screenIndex === (activeIndex + 1) % screenOrder.length) return 'end';
  return 'hidden';
}

export function ReaderShowcase() {
  const copy = homeCopy.screens;
  const [activeScreen, setActiveScreen] = useState<AppScreenKey>('discover');
  const [isPaused, setIsPaused] = useState(false);
  const activeIndex = screenOrder.indexOf(activeScreen);
  const activeStory = copy.stories[activeScreen];

  useEffect(() => {
    if (isPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setTimeout(() => {
      setActiveScreen((current) => {
        const currentIndex = screenOrder.indexOf(current);
        return screenOrder[(currentIndex + 1) % screenOrder.length];
      });
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [activeScreen, isPaused]);

  const activateScreenFromKeyboard = (event: React.KeyboardEvent<HTMLElement>, screen: AppScreenKey) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    setActiveScreen(screen);
  };

  return (
    <section className={styles.screensSection} id="inside-kira" aria-labelledby="screens-title">
      <div className={`${styles.sectionHeading} ${styles.screenHeading} shell`}>
        <div>
          <p className={styles.eyebrow}><span>02</span><LocalizedText en={copy.eyebrow.en} ar={copy.eyebrow.ar} /></p>
          <h2 id="screens-title">
            <LocalizedText
              en={<>{copy.title.lead.en}<br /><span>{copy.title.accent.en}</span></>}
              ar={<>{copy.title.lead.ar}<br /><span>{copy.title.accent.ar}</span></>}
            />
          </h2>
        </div>
      </div>

      <div
        className={`${styles.productWindow} shell`}
        data-paused={isPaused ? '' : undefined}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
        }}
      >
        <div className={styles.windowBar}>
          <span className={styles.windowTitle}>{copy.windowTitle}</span>
        </div>

        <div className={styles.screenTabs} aria-label={copy.switcherLabel}>
          {copy.tabs.map((tab) => (
            <button
              className={activeScreen === tab.key ? styles.activeScreenTab : undefined}
              key={tab.key}
              type="button"
              aria-pressed={activeScreen === tab.key}
              onClick={() => setActiveScreen(tab.key)}
            >
              <span>{tab.number}</span>
              <LocalizedText en={tab.label.en} ar={tab.label.ar} />
            </button>
          ))}
        </div>

        <div className={styles.windowGrid}>
          <div className={styles.windowStory} key={activeScreen}>
            <span className={styles.storyNumber}>{String(activeIndex + 1).padStart(2, '0')} / {String(screenOrder.length).padStart(2, '0')}</span>
            <p className={styles.storyLabel}><LocalizedText en={activeStory.label.en} ar={activeStory.label.ar} /></p>
            <h3><LocalizedText en={activeStory.title.en} ar={activeStory.title.ar} /></h3>
            <p><LocalizedText en={activeStory.description.en} ar={activeStory.description.ar} /></p>
            <div className={styles.storySignals}>
              {activeStory.signals.map((signal) => <span key={signal.en}><i /><LocalizedText en={signal.en} ar={signal.ar} /></span>)}
            </div>
          </div>

          {screenOrder.map((screen, index) => {
            const story = copy.stories[screen];
            return (
              <figure
                className={styles.appPanel}
                data-position={getScreenPosition(screen, activeScreen)}
                key={screen}
                role="button"
                tabIndex={screen === activeScreen ? 0 : -1}
                aria-label={story.buttonLabel}
                aria-pressed={screen === activeScreen}
                onClick={() => setActiveScreen(screen)}
                onKeyDown={(event) => activateScreenFromKeyboard(event, screen)}
              >
                <div className={styles.appPanelImage}><AppScreen screen={screen} /></div>
                <figcaption>
                  <b>{String(index + 1).padStart(2, '0')}</b>
                  <span><LocalizedText en={story.caption.en} ar={story.caption.ar} /></span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
