import Link from 'next/link';

import { ArrowIcon } from '@/components/icons';

import styles from './home.module.css';

export function FinalCta() {
  return (
    <section className={`${styles.finalCta} shell`} aria-labelledby="cta-title">
      <p>Kira Manga · Read your way</p>
      <h2 id="cta-title">Your library is ready<br />when <em>you are.</em></h2>
      <div>
        <span>Android &amp; iOS</span>
        <Link className="button buttonLight" href="/activate">Open Kira <ArrowIcon /></Link>
      </div>
    </section>
  );
}
