import type { Metadata } from 'next';

export interface DocumentMetadata {
  title: string;
  description: string;
  canonical: `/${string}`;
}

export type InlineToken =
  | { kind: 'strong'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'link'; text: string; href: string }
  | { kind: 'break' };

export type RichText = readonly (string | InlineToken)[];

export type DocumentBlock =
  | { kind: 'paragraph'; content: RichText }
  | { kind: 'subheading'; text: string }
  | { kind: 'orderedList' | 'unorderedList'; items: readonly RichText[] }
  | { kind: 'notice'; warning?: boolean; content: RichText }
  | { kind: 'meta'; rows: readonly { label: string; value: RichText }[] }
  | { kind: 'banner'; title: string; description: string }
  | { kind: 'steps'; items: readonly { title: string; body: RichText }[] };

export interface DocumentSection {
  id?: string;
  number?: string;
  title: string;
  tocLabel?: string;
  blocks: readonly DocumentBlock[];
}

export interface DocumentPageContent {
  metadata: DocumentMetadata;
  hero: {
    eyebrow: string;
    title: string;
    intro: string;
    actions?: readonly {
      label: string;
      href: string;
      variant: 'primary' | 'ghost';
      arrow?: boolean;
    }[];
  };
  preface?: readonly DocumentBlock[];
  sections: readonly DocumentSection[];
  afterword?: readonly DocumentBlock[];
}

export const strong = (text: string): InlineToken => ({ kind: 'strong', text });
export const inlineCode = (text: string): InlineToken => ({ kind: 'code', text });
export const contentLink = (text: string, href: string): InlineToken => ({ kind: 'link', text, href });
export const lineBreak = (): InlineToken => ({ kind: 'break' });

export function createDocumentMetadata({ title, description, canonical }: DocumentMetadata): Metadata {
  return { title, description, alternates: { canonical } };
}
