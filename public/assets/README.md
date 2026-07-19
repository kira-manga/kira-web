# Asset Library

Keep production images and fonts grouped by purpose:

```text
assets/
├── app-screens/
│   ├── details/
│   ├── discover/
│   └── settings/
├── brand/
└── fonts/
```

After adding or replacing an image, update its path, dimensions, and English/Arabic alt text in `src/content/media.ts`. Discover captures have one file for every language/theme pair and should keep matching dimensions. Keep each production asset below 160 KB, then run `npm run verify`.
