import Link from 'next/link';

import { ArrowIcon, SparkIcon } from '@/components/icons';

export default function NotFound() {
  return (
    <section className="notFound shell">
      <SparkIcon />
      <p className="eyebrow"><span />404</p>
      <h1>This page slipped between chapters.</h1>
      <p>The link may be outdated, or the page may have moved.</p>
      <Link className="button buttonPrimary" href="/">Back to Kira <ArrowIcon /></Link>
    </section>
  );
}
