# Editing Kira Web Content

The site keeps editable content separate from rendering code:

- `site.ts` — metadata, header, footer, shared labels, and navigation links.
- `home.ts` — every English and Arabic string shown on the homepage.
- `tutorials.ts` — general tutorial-page interface labels only. Tutorial/category records are authored
  through the backend ADMIN API and must not be added here.
- `pages/` — one structured content file for each help or policy page.
- `media.ts` — the single registry for logo and app-screen paths, dimensions, and alt text.
- `types.ts` — shared content types. This normally does not need editing.

## Replace an image

Put the replacement under `public/assets/` and update its entry in `media.ts`. Keep app captures in:

```text
public/assets/app-screens/
├── discover/
├── details/
└── settings/
```

Use the same aspect ratio when possible. `npm run check` enforces the current 160 KB asset budget.

## Edit copy

Each editable label uses this shape:

```ts
title: {
  en: 'English text',
  ar: 'النص العربي',
}
```

Always update both languages. Help and policy pages are currently English-only and use small helpers such as `strong()`, `contentLink()`, and `placeholder()` to describe formatting without JSX. Do not put JSX or styling in content files; presentation is handled by components.

## Verify changes

Run `npm run verify` before committing. It checks lint, TypeScript, the standalone production build,
the backend-response boundary, associations, and required assets.
