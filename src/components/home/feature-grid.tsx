import { BookIcon, DownloadIcon, GlobeIcon, SearchIcon } from '@/components/icons';
import { LocalizedText } from '@/components/localized-text';

import styles from './home.module.css';

const features = [
  {
    icon: SearchIcon,
    number: '01',
    enTitle: 'Discover across sources',
    arTitle: 'اكتشف عبر المصادر',
    enText: 'Move between enabled sources, search directly, and find something worth your next hour.',
    arText: 'تنقّل بين المصادر المفعّلة وابحث مباشرةً واعثر على ما يستحق ساعتك القادمة.',
  },
  {
    icon: BookIcon,
    number: '02',
    enTitle: 'A library that remembers',
    arTitle: 'مكتبة تتذكّر',
    enText: 'Keep titles, chapter state, and reading progress together so returning feels instant.',
    arText: 'احتفظ بالعناوين وحالة الفصول وتقدّم القراءة معًا لتعود فورًا إلى مكانك.',
  },
  {
    icon: DownloadIcon,
    number: '03',
    enTitle: 'Chapters ready offline',
    arTitle: 'فصول جاهزة دون إنترنت',
    enText: 'Download before the signal disappears and keep completed chapters available on your device.',
    arText: 'حمّل قبل أن تنقطع الشبكة واحتفظ بالفصول المكتملة جاهزة على جهازك.',
  },
  {
    icon: GlobeIcon,
    number: '04',
    enTitle: 'Designed for your language',
    arTitle: 'مصمم للغتك',
    enText: 'Multilingual UI and complete Arabic right-to-left behavior make every screen feel native.',
    arText: 'واجهة متعددة اللغات ودعم عربي كامل من اليمين إلى اليسار يجعل كل شاشة طبيعية.',
  },
] as const;

export function FeatureGrid() {
  return (
    <section className={styles.featureSection} id="features" aria-labelledby="features-title">
      <div className={`${styles.sectionHeading} shell`}>
        <div>
          <p className={styles.eyebrow}><span>01</span><LocalizedText en="THE READING STACK" ar="تجربة القراءة" /></p>
          <h2 id="features-title">
            <LocalizedText
              en={<>From “what should I read?”<br /><span>to the last page.</span></>}
              ar={<>من «ماذا أقرأ؟»<br /><span>حتى الصفحة الأخيرة.</span></>}
            />
          </h2>
        </div>
        <p>
          <LocalizedText
            en="Kira keeps discovery, progress, downloads, and language controls in one deliberate flow. Nothing competes with the chapter."
            ar="كيرا يجمع الاكتشاف والتقدّم والتنزيل وإعدادات اللغة في مسار واحد مدروس. لا شيء ينافس الفصل على انتباهك."
          />
        </p>
      </div>

      <div className={`${styles.featureGrid} shell`}>
        {features.map(({ icon: Icon, number, enTitle, arTitle, enText, arText }) => (
          <article className={styles.featureCard} key={number}>
            <div className={styles.featureTop}>
              <span className={styles.featureIcon}><Icon /></span>
              <span className={styles.featureNumber}>{number}</span>
            </div>
            <h3><LocalizedText en={enTitle} ar={arTitle} /></h3>
            <p><LocalizedText en={enText} ar={arText} /></p>
          </article>
        ))}
      </div>
    </section>
  );
}
