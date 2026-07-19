import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { ArrowIcon, BookIcon, CheckIcon } from '@/components/icons';
import { LocalizedText } from '@/components/localized-text';
import { TutorialLibrary } from '@/components/tutorials/tutorial-library';

import styles from '@/components/tutorials/tutorials.module.css';

export const metadata: Metadata = {
  title: 'Tutorials',
  description: 'Short visual guides for setting up Kira, finding manga, reading offline, and personalizing the app.',
  alternates: { canonical: '/tutorials' },
};

export default function TutorialsPage() {
  return (
    <div className={styles.tutorialsPage}>
      <section className={styles.hubHero} aria-labelledby="tutorials-title">
        <div className={styles.hubGlow} aria-hidden="true" />
        <Image className={styles.hubMark} src="/brand/kira-logo.svg" alt="" width={467} height={319} priority unoptimized />
        <div className={`${styles.hubHeroInner} shell`}>
          <p className={styles.hubEyebrow}><BookIcon /><LocalizedText en="KIRA HELP CENTER" ar="مركز مساعدة كيرا" /></p>
          <h1 id="tutorials-title"><LocalizedText en={<>Learn Kira,<br /><span>one chapter at a time.</span></>} ar={<>تعلّم كيرا،<br /><span>فصلًا بعد فصل.</span></>} /></h1>
          <p><LocalizedText en="Short, visual answers built around the real app—from first setup to offline reading." ar="إجابات قصيرة وبصرية مبنية على التطبيق الحقيقي—من الإعداد الأول إلى القراءة دون إنترنت." /></p>
          <div className={styles.hubActions}>
            <a className="button buttonPrimary" href="#tutorial-library-title"><LocalizedText en="Browse tutorials" ar="تصفّح الشروحات" /> <ArrowIcon /></a>
            <Link className="button buttonGhost" href="/support"><LocalizedText en="Get support" ar="احصل على دعم" /></Link>
          </div>
          <div className={styles.hubProof}>
            <span><CheckIcon /><LocalizedText en="Real app captures" ar="لقطات حقيقية" /></span>
            <span><CheckIcon /><LocalizedText en="Arabic and English" ar="العربية والإنجليزية" /></span>
            <span><CheckIcon /><LocalizedText en="Practical steps only" ar="خطوات عملية فقط" /></span>
          </div>
        </div>
      </section>

      <div className={`${styles.libraryShell} shell`}><TutorialLibrary /></div>
    </div>
  );
}
