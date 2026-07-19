import Link from 'next/link';

import { ArrowIcon } from '@/components/icons';

import styles from './home.module.css';

export function FinalCta() {
  return (
    <section className={`${styles.finalCta} shell`} aria-labelledby="cta-title">
      <p>Kira Manga · Read your way</p>
      <h2 id="cta-title">One more chapter<br />starts <em>here.</em></h2>
      <div>
        <span>Android &amp; iOS</span>
        <Link className="button buttonDark" href="/activate">Open Kira <ArrowIcon /></Link>
      </div>
    </section>
  );
}
