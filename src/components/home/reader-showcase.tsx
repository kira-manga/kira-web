import Image from 'next/image';

import { CheckIcon } from '@/components/icons';
import { LocalizedText } from '@/components/localized-text';
import { LiveAppScreen } from '@/components/preferences';

import styles from './home.module.css';

export function ReaderShowcase() {
  return (
    <section className={styles.screensSection} id="real-screens" aria-labelledby="screens-title">
      <div className={`${styles.sectionHeading} ${styles.screenHeading} shell`}>
        <div>
          <p className={styles.eyebrow}><span>02</span><LocalizedText en="INSIDE KIRA" ar="داخل كيرا" /></p>
          <h2 id="screens-title">
            <LocalizedText
              en={<>The interface is<br /><span>the advertisement.</span></>}
              ar={<>الواجهة نفسها<br /><span>هي الإعلان.</span></>}
            />
          </h2>
        </div>
        <div className={styles.authenticNote}>
          <CheckIcon />
          <p><LocalizedText en="Every screen below comes from the installed Kira app. No generated mockups, no rebuilt UI." ar="كل شاشة أدناه من تطبيق كيرا المثبّت. لا نماذج مولّدة ولا واجهات معاد رسمها." /></p>
        </div>
      </div>

      <div className={`${styles.productWindow} shell`}>
        <div className={styles.windowBar}>
          <span className={styles.windowDots}><i /><i /><i /></span>
          <span className={styles.windowTitle}>KIRA / PRODUCT TOUR</span>
          <span className={styles.windowStatus}><i /> <LocalizedText en="REAL BUILD" ar="نسخة حقيقية" /></span>
        </div>

        <div className={styles.windowGrid}>
          <div className={styles.windowStory}>
            <span className={styles.storyNumber}>01 / 03</span>
            <p className={styles.storyLabel}><LocalizedText en="DISCOVERY" ar="الاكتشاف" /></p>
            <h3><LocalizedText en="A home that gets you somewhere." ar="واجهة توصلك لما تريد." /></h3>
            <p><LocalizedText en="Switch sources, scan what is popular, catch the latest updates, or go straight to search." ar="بدّل المصادر، وتصفّح الشائع، وتابع آخر التحديثات، أو انتقل مباشرةً إلى البحث." /></p>
            <div className={styles.storySignals}>
              <span><i /><LocalizedText en="Source switching" ar="تبديل المصادر" /></span>
              <span><i /><LocalizedText en="Latest updates" ar="آخر التحديثات" /></span>
              <span><i /><LocalizedText en="Quick save" ar="حفظ سريع" /></span>
            </div>
          </div>

          <figure className={`${styles.appPanel} ${styles.discoverPanel}`}>
            <div className={styles.appPanelImage}><LiveAppScreen /></div>
            <figcaption><b>01</b><span><LocalizedText en="Discover · adapts to this site’s theme and language" ar="اكتشف · تتوافق مع مظهر ولغة الموقع" /></span></figcaption>
          </figure>

          <figure className={`${styles.appPanel} ${styles.detailsPanel}`}>
            <div className={styles.appPanelImage}>
              <Image src="/screens/manga-details.jpg" alt="Real Kira manga details screen" width={588} height={1280} loading="lazy" unoptimized />
            </div>
            <figcaption><b>02</b><span><LocalizedText en="Details · chapters, progress, downloads" ar="التفاصيل · الفصول والتقدّم والتنزيل" /></span></figcaption>
          </figure>

          <figure className={`${styles.appPanel} ${styles.settingsPanel}`}>
            <div className={styles.appPanelImage}>
              <Image src="/screens/settings-dark.jpg" alt="Real Kira settings screen" width={540} height={1200} loading="lazy" unoptimized />
            </div>
            <figcaption><b>03</b><span><LocalizedText en="Control · theme, privacy, storage" ar="التحكم · المظهر والخصوصية والتخزين" /></span></figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
