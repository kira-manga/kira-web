export type TutorialRequest =
  | { kind: 'categories' }
  | { kind: 'tutorials'; category?: string; featured?: boolean }
  | { kind: 'tutorial'; slug: string };

export function tutorialRequestPath(request: TutorialRequest): string {
  if (request.kind === 'categories') return '/api/v1/tutorial-categories';
  if (request.kind === 'tutorial') return `/api/v1/tutorials/${encodeURIComponent(request.slug)}`;
  const query = new URLSearchParams();
  if (request.category) query.set('category', request.category);
  if (request.featured !== undefined) query.set('featured', String(request.featured));
  return `/api/v1/tutorials${query.size ? `?${query}` : ''}`;
}

export function tutorialCacheKey(internalOrigin: string, publicOrigin: string, request: TutorialRequest): string {
  // One serialized tuple: unstable_cache comma-joins keyParts, so separate arbitrary
  // strings would be ambiguous. Bump the version when the validated representation changes.
  const key = [
    'kira-tutorial-api',
    1,
    request.kind,
    internalOrigin,
    publicOrigin,
    tutorialRequestPath(request),
    request.kind === 'tutorial' ? request.slug : null,
    request.kind === 'tutorials' ? request.category || null : null,
    request.kind === 'tutorials' ? request.featured ?? null : null,
  ] as const;
  return JSON.stringify(key);
}
