import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { ArrowIcon, BookIcon, CheckIcon } from '@/components/ui/icons';
import { LocalizedText } from '@/components/ui/localized-text';
import { TutorialLibrary } from '@/components/tutorials/tutorial-library';
import { media } from '@/content/media';
import { tutorialsPageCopy } from '@/content/tutorials';

import styles from '@/components/tutorials/tutorials.module.css';

export const metadata: Metadata = {
  title: tutorialsPageCopy.metadata.title,
  description: tutorialsPageCopy.metadata.description,
  alternates: { canonical: '/tutorials' },
};

export default function TutorialsPage() {
  const copy = tutorialsPageCopy.hero;
  const logo = media.brand.logo;

  return (
    <div className={styles.tutorialsPage}>
      <section className={styles.hubHero} aria-labelledby="tutorials-title">
        <div className={styles.hubGlow} aria-hidden="true" />
        <Image className={styles.hubMark} src={logo.src} alt="" width={logo.width} height={logo.height} priority unoptimized />
        <div className={`${styles.hubHeroInner} shell`}>
          <p className={styles.hubEyebrow}><BookIcon /><LocalizedText en={copy.eyebrow.en} ar={copy.eyebrow.ar} /></p>
          <h1 id="tutorials-title">
            <LocalizedText
              en={<>{copy.title.lead.en}<br /><span>{copy.title.accent.en}</span></>}
              ar={<>{copy.title.lead.ar}<br /><span>{copy.title.accent.ar}</span></>}
            />
          </h1>
          <p><LocalizedText en={copy.description.en} ar={copy.description.ar} /></p>
          <div className={styles.hubActions}>
            <a className="button buttonPrimary" href="#tutorial-library-title"><LocalizedText en={copy.browseCta.en} ar={copy.browseCta.ar} /> <ArrowIcon /></a>
            <Link className="button buttonGhost" href="/support"><LocalizedText en={copy.supportCta.en} ar={copy.supportCta.ar} /></Link>
          </div>
          <div className={styles.hubProof}>
            {copy.proof.map((item) => (
              <span key={item.en}><CheckIcon /><LocalizedText en={item.en} ar={item.ar} /></span>
            ))}
          </div>
        </div>
      </section>

      <div className={`${styles.libraryShell} shell`}><TutorialLibrary /></div>
    </div>
  );
}
