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

Always update both languages. Help and policy pages are currently English-only and use small helpers such as `strong()` and `contentLink()` to describe formatting without JSX. Do not put JSX or styling in content files; presentation is handled by components.

### Arabic interface and count messages

Functional labels, including assistive-only names and media chrome, use the same bilingual copy
as visible controls. `LocalizedText` switches through the existing root language state; an
`aria-labelledby` target must be a non-hidden wrapper or visible heading, not either hidden locale
span. The brand's home link keeps the visible **Kira Manga** name plus a localized home suffix.
English-only reference hero/actions, body and TOC links are English/LTR islands, separate from
the Arabic notice and the active-language TOC heading/landmark; do not translate legal prose here.

The explicit language-neutral interface allowlist is limited to:

- Brand marks/names: `Kira`, `Kira Manga`, `KIRA`, and the monogram `K`.
- Platform names: `Android`/`ANDROID`, `iOS`, and `iPhone`.
- Actual URLs, domains and email addresses; language-switch destination markers `EN` and `ع`.
- Numeric/decorative indices (including step/slide indices, `404`, copyright year and `KIRA / 2026`).

This does not exempt English functional phrases such as `home`, `PRODUCT TOUR` or `GUIDE VIEW`.
Guide/step totals are not neutral indices: `tutorials.ts`'s `library.count` and `library.steps`
contain whole messages, with English `one`/`other` and Arabic `zero`/`one`/`two`/`few`/`many`/`other`.
Use `{count}` where a numeral belongs; natural zero/singular/dual messages need no numeral prefix.
`formatTutorialCount` uses cardinal `Intl.PluralRules` and explicitly chooses Arabic-Indic digits
with `Intl.NumberFormat('ar', { numberingSystem: 'arab' })` for nonnegative integer collection lengths.

`npm run test:tutorial-counts` checks both nouns/locales at 0, 1, 2, 3, 11, 100 and 102 against
explicit complete strings. It uses the existing TypeScript compiler and native Node test runner;
no Next build, backend, browser or new test framework is needed.

## Verify changes

Run `npm run verify` before committing. It checks lint, TypeScript, the standalone production build,
the backend-response boundary, associations, and required assets.
