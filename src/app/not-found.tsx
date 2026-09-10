import Link from 'next/link';

import { ArrowIcon, SparkIcon } from '@/components/ui/icons';
import { LocalizedText } from '@/components/ui/localized-text';
import { siteCopy } from '@/content/site';

export default function NotFound() {
  const copy = siteCopy.notFound;

  return (
    <section className="notFound shell">
      <SparkIcon />
      <p className="eyebrow"><span />{copy.eyebrow}</p>
      <h1><LocalizedText en={copy.title.en} ar={copy.title.ar} /></h1>
      <p><LocalizedText en={copy.description.en} ar={copy.description.ar} /></p>
      <Link className="button buttonPrimary" href="/"><LocalizedText en={copy.cta.en} ar={copy.cta.ar} /> <ArrowIcon /></Link>
    </section>
  );
}
