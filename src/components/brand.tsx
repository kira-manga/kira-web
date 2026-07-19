import Link from 'next/link';

export function KiraMark({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? 'brandMark brandMarkSmall' : 'brandMark'} aria-hidden="true">
      <span className="brandLetter">k</span>
      <svg className="brandSpark" viewBox="0 0 100 100">
        <path d="M50 8c5 30 12 37 42 42-30 5-37 12-42 42-5-30-12-37-42-42 30-5 37-12 42-42Z" />
      </svg>
    </span>
  );
}

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Kira Manga home">
      <KiraMark small />
      <span className="wordmark">kira<span>.</span></span>
    </Link>
  );
}
