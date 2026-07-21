import type { LocalizedCopy } from '@/content/types';

export interface TutorialCategory {
  id: string;
  slug: string;
  label: LocalizedCopy;
  iconCode: 'book' | 'search' | 'download' | 'settings';
  position: number;
  revision: number;
}

export interface TutorialMediaAsset {
  id: string;
  url: string;
  contentType: 'image/jpeg' | 'image/png';
  width: number;
  height: number;
  sha256: string;
}

export interface TutorialMediaSlot {
  default: TutorialMediaAsset;
  alt: LocalizedCopy;
  variants: {
    enLight?: TutorialMediaAsset | null;
    enDark?: TutorialMediaAsset | null;
    arLight?: TutorialMediaAsset | null;
    arDark?: TutorialMediaAsset | null;
  };
}

export interface TutorialStep {
  id: string;
  title: LocalizedCopy;
  body: LocalizedCopy;
  tip?: LocalizedCopy | null;
  media?: TutorialMediaSlot | null;
}

export interface Tutorial {
  id: string;
  slug: string;
  category: TutorialCategory;
  title: LocalizedCopy;
  summary: LocalizedCopy;
  introduction: LocalizedCopy;
  duration: LocalizedCopy;
  level: LocalizedCopy;
  cover: TutorialMediaSlot;
  steps: TutorialStep[];
  position: number;
  featuredPosition?: number | null;
  revision: number;
}

export type TutorialFetchResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'not-found' }
  | { status: 'unavailable' };

const internalApiUrl = (process.env.KIRA_TUTORIAL_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');
const publicApiUrl = (process.env.NEXT_PUBLIC_KIRA_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export async function getTutorialCategories(): Promise<TutorialFetchResult<TutorialCategory[]>> {
  return request('/api/v1/tutorial-categories', categoryArray);
}

export async function getTutorials(options: { category?: string; featured?: boolean } = {}): Promise<TutorialFetchResult<Tutorial[]>> {
  const query = new URLSearchParams();
  if (options.category) query.set('category', options.category);
  if (options.featured !== undefined) query.set('featured', String(options.featured));
  const suffix = query.size ? `?${query}` : '';
  return request(`/api/v1/tutorials${suffix}`, tutorialArray);
}

export async function getTutorial(slug: string): Promise<TutorialFetchResult<Tutorial>> {
  return request(`/api/v1/tutorials/${encodeURIComponent(slug)}`, tutorial);
}

async function request<T>(path: string, validate: (value: unknown) => T): Promise<TutorialFetchResult<T>> {
  try {
    const response = await fetch(`${internalApiUrl}${path}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });
    if (response.status === 404) return { status: 'not-found' };
    if (!response.ok) throw new Error(`tutorial API returned ${response.status}`);
    return { status: 'ok', data: validate(await response.json()) };
  } catch {
    return { status: 'unavailable' };
  }
}

function object(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${path} must be an object`);
  return value as Record<string, unknown>;
}

function string(value: unknown, path: string): string {
  if (typeof value !== 'string' || !value) throw new Error(`${path} must be a non-empty string`);
  return value;
}

function number(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) throw new Error(`${path} must be a non-negative integer`);
  return value;
}

function localized(value: unknown, path: string): LocalizedCopy {
  const item = object(value, path);
  return { en: string(item.en, `${path}.en`), ar: string(item.ar, `${path}.ar`) };
}

function category(value: unknown, path = 'category'): TutorialCategory {
  const item = object(value, path);
  const iconCode = string(item.iconCode, `${path}.iconCode`);
  if (!['book', 'search', 'download', 'settings'].includes(iconCode)) throw new Error(`${path}.iconCode is unsupported`);
  return {
    id: string(item.id, `${path}.id`),
    slug: string(item.slug, `${path}.slug`),
    label: localized(item.label, `${path}.label`),
    iconCode: iconCode as TutorialCategory['iconCode'],
    position: number(item.position, `${path}.position`),
    revision: number(item.revision, `${path}.revision`),
  };
}

function asset(value: unknown, path: string): TutorialMediaAsset {
  const item = object(value, path);
  const contentType = string(item.contentType, `${path}.contentType`);
  if (contentType !== 'image/jpeg' && contentType !== 'image/png') throw new Error(`${path}.contentType is unsupported`);
  const rawUrl = string(item.url, `${path}.url`);
  return {
    id: string(item.id, `${path}.id`),
    url: rawUrl.startsWith('/') ? `${publicApiUrl}${rawUrl}` : rawUrl,
    contentType,
    width: number(item.width, `${path}.width`),
    height: number(item.height, `${path}.height`),
    sha256: string(item.sha256, `${path}.sha256`),
  };
}

function optionalAsset(value: unknown, path: string) {
  return value === null || value === undefined ? null : asset(value, path);
}

function mediaSlot(value: unknown, path: string): TutorialMediaSlot {
  const item = object(value, path);
  const variants = object(item.variants, `${path}.variants`);
  return {
    default: asset(item.default, `${path}.default`),
    alt: localized(item.alt, `${path}.alt`),
    variants: {
      enLight: optionalAsset(variants.enLight, `${path}.variants.enLight`),
      enDark: optionalAsset(variants.enDark, `${path}.variants.enDark`),
      arLight: optionalAsset(variants.arLight, `${path}.variants.arLight`),
      arDark: optionalAsset(variants.arDark, `${path}.variants.arDark`),
    },
  };
}

function step(value: unknown, path: string): TutorialStep {
  const item = object(value, path);
  return {
    id: string(item.id, `${path}.id`),
    title: localized(item.title, `${path}.title`),
    body: localized(item.body, `${path}.body`),
    tip: item.tip === null || item.tip === undefined ? null : localized(item.tip, `${path}.tip`),
    media: item.media === null || item.media === undefined ? null : mediaSlot(item.media, `${path}.media`),
  };
}

function tutorial(value: unknown, path = 'tutorial'): Tutorial {
  const item = object(value, path);
  if (!Array.isArray(item.steps) || item.steps.length === 0) throw new Error(`${path}.steps must be a non-empty array`);
  const featuredPosition = item.featuredPosition;
  return {
    id: string(item.id, `${path}.id`),
    slug: string(item.slug, `${path}.slug`),
    category: category(item.category, `${path}.category`),
    title: localized(item.title, `${path}.title`),
    summary: localized(item.summary, `${path}.summary`),
    introduction: localized(item.introduction, `${path}.introduction`),
    duration: localized(item.duration, `${path}.duration`),
    level: localized(item.level, `${path}.level`),
    cover: mediaSlot(item.cover, `${path}.cover`),
    steps: item.steps.map((value, index) => step(value, `${path}.steps[${index}]`)),
    position: number(item.position, `${path}.position`),
    featuredPosition: featuredPosition === null || featuredPosition === undefined ? null : number(featuredPosition, `${path}.featuredPosition`),
    revision: number(item.revision, `${path}.revision`),
  };
}

function categoryArray(value: unknown): TutorialCategory[] {
  if (!Array.isArray(value)) throw new Error('categories must be an array');
  return value.map((item, index) => category(item, `categories[${index}]`));
}

function tutorialArray(value: unknown): Tutorial[] {
  if (!Array.isArray(value)) throw new Error('tutorials must be an array');
  return value.map((item, index) => tutorial(item, `tutorials[${index}]`));
}
