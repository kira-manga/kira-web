import Link from 'next/link';
import Image from 'next/image';

export function KiraMark({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? 'brandMark brandMarkSmall' : 'brandMark'} aria-hidden="true">
      <Image src="/brand/kira-logo.svg" alt="" width="467" height="319" unoptimized />
    </span>
  );
}

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Kira Manga home">
      <KiraMark small />
      <span className="wordmark">Kira <small>Manga</small></span>
    </Link>
  );
}
