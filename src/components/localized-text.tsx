import type { ReactNode } from 'react';

interface LocalizedTextProps {
  en: ReactNode;
  ar: ReactNode;
}

export function LocalizedText({ en, ar }: LocalizedTextProps) {
  return (
    <>
      <span className="langEn" lang="en">{en}</span>
      <span className="langAr" lang="ar">{ar}</span>
    </>
  );
}
