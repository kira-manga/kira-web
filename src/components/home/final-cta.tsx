import Image from 'next/image';
import Link from 'next/link';

import { ArrowIcon, BookIcon } from '@/components/ui/icons';
import { LocalizedText } from '@/components/ui/localized-text';
import { homeCopy } from '@/content/home';
import { media } from '@/content/media';

import styles from './home.module.css';

export function FinalCta() {
  const copy = homeCopy.finalCta;
  const logo = media.brand.logo;

  return (
    <section className={styles.finalSection} aria-labelledby="cta-title">
      <div className={`${styles.finalCard} shell`}>
        <div className={styles.finalGlow} aria-hidden="true" />
        <Image className={styles.finalMark} src={logo.src} alt="" width={logo.width} height={logo.height} unoptimized />
        <div className={styles.finalCopy}>
          <p className={styles.eyebrow}><span>04</span><LocalizedText en={copy.eyebrow.en} ar={copy.eyebrow.ar} /></p>
          <h2 id="cta-title"><LocalizedText en={<>{copy.title.lead.en}<br />{copy.title.accent.en}</>} ar={<>{copy.title.lead.ar}<br />{copy.title.accent.ar}</>} /></h2>
          <p><LocalizedText en={copy.description.en} ar={copy.description.ar} /></p>
          <div className={styles.finalActions}>
            <Link className={styles.finalPrimary} href="/activate"><LocalizedText en={copy.primaryCta.en} ar={copy.primaryCta.ar} /> <ArrowIcon /></Link>
            <Link className={styles.finalSecondary} href="/tutorials"><BookIcon /><LocalizedText en={copy.secondaryCta.en} ar={copy.secondaryCta.ar} /></Link>
          </div>
          <small><LocalizedText en={copy.note.en} ar={copy.note.ar} /></small>
        </div>
        <div className={styles.finalIndex} aria-hidden="true"><span>04</span><i /><span>{copy.index}</span></div>
      </div>
    </section>
  );
}
