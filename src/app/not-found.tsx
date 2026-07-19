import Link from 'next/link';

import { ArrowIcon, SparkIcon } from '@/components/ui/icons';
import { siteCopy } from '@/content/site';

export default function NotFound() {
  const copy = siteCopy.notFound;

  return (
    <section className="notFound shell">
      <SparkIcon />
      <p className="eyebrow"><span />{copy.eyebrow}</p>
      <h1>{copy.title}</h1>
      <p>{copy.description}</p>
      <Link className="button buttonPrimary" href="/">{copy.cta} <ArrowIcon /></Link>
    </section>
  );
}
