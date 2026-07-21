# Asset Library

Keep production images and fonts grouped by purpose:

```text
assets/
├── app-screens/
│   ├── details/
│   ├── discover/
│   ├── history/
│   ├── library/
│   ├── notifications/
│   └── settings/
├── brand/
└── fonts/
```

After adding or replacing an image, update its path, dimensions, language/theme variants, and English/Arabic alt text in `src/content/media.ts`. App captures may use different resolutions, but should keep the same portrait aspect ratio and include English/Arabic light/dark variants. Keep each production asset below 160 KB, then run `npm run verify`.
