export type Language = 'en' | 'ar';
export type Theme = 'dark' | 'light';

export interface LocalizedCopy {
  en: string;
  ar: string;
}

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
  alt: LocalizedCopy;
}
