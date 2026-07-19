import Link from 'next/link';
import Image from 'next/image';

import { media } from '@/content/media';
import { siteConfig } from '@/content/site';

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
    <Link className="brand" href="/" aria-label={`${siteConfig.name} home`}>
      <KiraMark small />
      <span className="wordmark">{siteConfig.shortName} <small>{siteConfig.wordmarkSuffix}</small></span>
    </Link>
  );
}
