import Image from 'next/image';
import Link from 'next/link';

import { ArrowIcon, BookIcon } from '@/components/icons';
import { LocalizedText } from '@/components/localized-text';

import styles from './home.module.css';

export function FinalCta() {
  return (
    <section className={styles.finalSection} aria-labelledby="cta-title">
      <div className={`${styles.finalCard} shell`}>
        <div className={styles.finalGlow} aria-hidden="true" />
        <Image className={styles.finalMark} src="/brand/kira-logo.svg" alt="" width={467} height={319} unoptimized />
        <div className={styles.finalCopy}>
          <p className={styles.eyebrow}><span>04</span><LocalizedText en="YOUR NEXT CHAPTER" ar="فصلك التالي" /></p>
          <h2 id="cta-title"><LocalizedText en={<>Closer than<br />it looks.</>} ar={<>أقرب مما<br />تتخيّل.</>} /></h2>
          <p><LocalizedText en="Open Kira on your phone, choose the sources you want, and make the next chapter the only thing on screen." ar="افتح كيرا على هاتفك، واختر مصادرك، واجعل الفصل التالي هو الشيء الوحيد على الشاشة." /></p>
          <div className={styles.finalActions}>
            <Link className={styles.finalPrimary} href="/activate"><LocalizedText en="Start reading" ar="ابدأ القراءة" /> <ArrowIcon /></Link>
            <Link className={styles.finalSecondary} href="/tutorials"><BookIcon /><LocalizedText en="View tutorials" ar="شاهد الشروحات" /></Link>
          </div>
          <small><LocalizedText en="No account or payment is required to reveal Sources management." ar="لا يلزم حساب أو دفع لإظهار إدارة المصادر." /></small>
        </div>
        <div className={styles.finalIndex} aria-hidden="true"><span>04</span><i /><span>KIRA / 2026</span></div>
      </div>
    </section>
  );
}
