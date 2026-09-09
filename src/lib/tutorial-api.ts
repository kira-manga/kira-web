import { unstable_cache } from 'next/cache';
import { connection } from 'next/server';

import type { LocalizedCopy } from '@/content/types';
import { tutorialCacheKey, tutorialRequestPath, type TutorialRequest } from './tutorial-cache-key';

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

type CachedTutorialResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'not-found' };

export type TutorialFetchResult<T> = CachedTutorialResult<T> | { status: 'unavailable' };

const internalApiUrl = (process.env.KIRA_TUTORIAL_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');
const publicApiUrl = (process.env.NEXT_PUBLIC_KIRA_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export async function getTutorialCategories(): Promise<TutorialFetchResult<TutorialCategory[]>> {
  return request({ kind: 'categories' }, categoryArray);
}

export async function getTutorials(options: { category?: string; featured?: boolean } = {}): Promise<TutorialFetchResult<Tutorial[]>> {
  return request({ kind: 'tutorials', category: options.category, featured: options.featured }, tutorialArray);
}

export async function getTutorial(slug: string): Promise<TutorialFetchResult<Tutorial>> {
  return request({ kind: 'tutorial', slug }, tutorial);
}

type TutorialFailureKind = 'network' | 'http' | 'json' | 'schema';

class TutorialApiFailure extends Error {
  constructor(kind: TutorialFailureKind) {
    super(`Tutorial API unavailable (${kind})`);
    this.name = 'TutorialApiFailure';
  }
}

async function fetchValidated<T>(resource: TutorialRequest, validate: (value: unknown) => T): Promise<CachedTutorialResult<T>> {
  let failureKind: TutorialFailureKind = 'network';
  try {
    // Do not let a raw status-200 response enter the fetch cache before validation.
    const response = await fetch(`${internalApiUrl}${tutorialRequestPath(resource)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    // An authoritative archive replaces a positive cache entry. Throwing here would
    // preserve the old tutorial on every refresh, potentially indefinitely.
    if (resource.kind === 'tutorial' && response.status === 404) return { status: 'not-found' };
    failureKind = 'http';
    if (!response.ok) throw new TutorialApiFailure(failureKind);
    failureKind = 'json';
    const body: unknown = await response.json();
    failureKind = 'schema';
    return { status: 'ok', data: validate(body) };
  } catch {
    // Next logs background rejections itself. Never attach the original error,
    // message, body or cause: JSON/network errors can contain upstream content.
    throw new TutorialApiFailure(failureKind);
  }
}

async function request<T>(resource: TutorialRequest, validate: (value: unknown) => T): Promise<TutorialFetchResult<T>> {
  // Outside both catches and the cached callback: do not swallow Next's dynamic
  // rendering control flow or bake a backend-less build's unavailable UI into ISR.
  await connection();
  try {
    return await unstable_cache(
      () => fetchValidated(resource, validate),
      [tutorialCacheKey(internalApiUrl, publicApiUrl, resource)],
      { revalidate: 60 },
    )();
  } catch (error) {
    // Cold failures are uncached. On refresh failure Next returns the last validated
    // value (including a cached not-found) and never reaches this fallback.
    console.error(error instanceof TutorialApiFailure ? error.message : 'Tutorial API unavailable (cache)');
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
