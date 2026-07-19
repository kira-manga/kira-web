import { ImageResponse } from 'next/og';

export const alt = 'Kira Manga — Your manga universe';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '74px 86px', background: '#0e1014', color: '#f3f4f7', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760 }}>
        <div style={{ color: '#ff5b6e', fontSize: 24, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>Kira Manga</div>
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', fontSize: 76, lineHeight: 1.03, fontWeight: 800, letterSpacing: -4 }}>Your manga<span style={{ color: '#ff6370' }}>universe.</span></div>
        <div style={{ marginTop: 30, color: '#9aa1af', fontSize: 28 }}>Discover. Collect. Read beyond the ordinary.</div>
      </div>
      <div style={{ width: 290, height: 290, border: '2px solid #292e3a', borderRadius: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#161a23', boxShadow: '0 30px 90px rgba(0,0,0,.45)' }}>
        <svg width="235" height="161" viewBox="0 0 467.19 319.48">
          <path fill="#ff5b6e" d="m164.66 154.27 119.81 165.21-130.2-44.31-39.93-76.59-19.7 20.25-11.49 56.88-65.32 34.39 8.08-81.57-18.35 86.97H7.55L0 319.48 51.97 86.98 0 61.26 145.52 26.8l-26.26 93.01 80.97-88.08 3.07-.76-31.27 42.19 45.14-45.61L328.78 0l-48.59 45.68-42.1 39.56-73.43 69.03Z" />
          <path fill="#ff8a5b" d="m467.19 42.4-42.67 208.98-77.42 30.9 33.11-147.77-42.95 108.65h-45.67l-8.75-114.68-16.9 148.77-56.52-75.35 28.67-116.66 9.73-39.56h73.85l10.95 97.92 49.22-97.92 74.4-2.86-18.84 78.79 28.37-79.16 1.42-.05Z" />
        </svg>
      </div>
    </div>,
    size,
  );
}
