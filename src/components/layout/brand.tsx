import Link from 'next/link';
import Image from 'next/image';

import { LocalizedText } from '@/components/ui/localized-text';
import { media } from '@/content/media';
import { siteConfig, siteCopy } from '@/content/site';

export function KiraMark({ small = false }: { small?: boolean }) {
  const logo = media.brand.logo;

  return (
    <span className={small ? 'brandMark brandMarkSmall' : 'brandMark'} aria-hidden="true">
      <Image src={logo.src} alt="" width={logo.width} height={logo.height} unoptimized />
    </span>
  );
}

export function Brand() {
  return (
    <Link className="brand" href="/">
      <KiraMark small />
      <span className="wordmark" lang="en" dir="ltr">{siteConfig.shortName} <small>{siteConfig.wordmarkSuffix}</small></span>
      <span className="srOnly"> — <LocalizedText en={siteCopy.header.homeLinkSuffix.en} ar={siteCopy.header.homeLinkSuffix.ar} /></span>
    </Link>
  );
}
