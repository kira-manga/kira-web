import type { Route } from 'next';
import Link from 'next/link';

import { ArrowIcon, BookIcon, DownloadIcon, SearchIcon, SettingsIcon } from '@/components/icons';
import { LocalizedText } from '@/components/localized-text';

import styles from './home.module.css';

const guides = [
  {
    href: '/tutorials/getting-started',
    icon: BookIcon,
    step: '01',
    time: '4 MIN',
    enTitle: 'Set up Kira and reach your first chapter',
    arTitle: 'أعدّ كيرا واصل إلى فصلك الأول',
  },
  {
    href: '/tutorials/discover-manga',
    icon: SearchIcon,
    step: '02',
    time: '3 MIN',
    enTitle: 'Find manga across your enabled sources',
    arTitle: 'اعثر على المانجا في مصادرك المفعّلة',
  },
  {
    href: '/tutorials/read-offline',
    icon: DownloadIcon,
    step: '03',
    time: '4 MIN',
    enTitle: 'Download chapters and read offline',
    arTitle: 'حمّل الفصول واقرأ دون إنترنت',
  },
  {
    href: '/tutorials/personalize-kira',
    icon: SettingsIcon,
    step: '04',
    time: '3 MIN',
    enTitle: 'Tune theme, language, and storage',
    arTitle: 'اضبط المظهر واللغة والتخزين',
  },
] as const;

export function HowItWorks() {
  return (
    <section className={styles.tutorialSection} id="tutorials" aria-labelledby="tutorials-title">
      <div className={`${styles.tutorialLayout} shell`}>
        <div className={styles.tutorialCopy}>
          <p className={styles.eyebrow}><span>03</span><LocalizedText en="LEARN KIRA" ar="تعلّم كيرا" /></p>
          <h2 id="tutorials-title">
            <LocalizedText en={<>A clear answer before<br /><span>you have to ask.</span></>} ar={<>إجابة واضحة قبل<br /><span>أن تضطر للسؤال.</span></>} />
          </h2>
          <p><LocalizedText en="Short, visual tutorials take you from setup to offline reading without burying the useful part." ar="شروحات قصيرة وبصرية تنقلك من الإعداد إلى القراءة دون إنترنت من غير حشو." /></p>
          <Link className={styles.allTutorialsLink} href="/tutorials">
            <LocalizedText en="Browse every tutorial" ar="تصفّح كل الشروحات" /> <ArrowIcon />
          </Link>
        </div>

        <div className={styles.guideBrowser}>
          <div className={styles.guideBrowserBar}>
            <span><i /><i /><i /></span>
            <b><LocalizedText en="Kira Help Center" ar="مركز مساعدة كيرا" /></b>
            <small>kiramanga.me/tutorials</small>
          </div>
          <div className={styles.guideBrowserBody}>
            <aside className={styles.guideSidebar}>
              <span className={styles.sidebarLogo}>K</span>
              <p><LocalizedText en="GET STARTED" ar="ابدأ هنا" /></p>
              {guides.map((guide, index) => (
                <span className={index === 0 ? styles.activeSidebarItem : undefined} key={guide.step}>{guide.step}</span>
              ))}
            </aside>
            <div className={styles.guideList}>
              <div className={styles.guideListHeader}>
                <span><LocalizedText en="QUICK GUIDES" ar="أدلة سريعة" /></span>
                <span>4 <LocalizedText en="ARTICLES" ar="مقالات" /></span>
              </div>
              {guides.map(({ href, icon: Icon, step, time, enTitle, arTitle }) => (
                <Link href={href as Route} className={styles.guideRow} key={step}>
                  <span className={styles.guideIcon}><Icon /></span>
                  <span className={styles.guideMeta}><small>{step} · {time}</small><strong><LocalizedText en={enTitle} ar={arTitle} /></strong></span>
                  <ArrowIcon />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
