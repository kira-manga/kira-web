import { ImageResponse } from 'next/og';

export const alt = 'Kira Manga — Your manga, your way';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '74px 86px', background: '#0e1014', color: '#f3f4f7', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760 }}>
        <div style={{ color: '#ff5b6e', fontSize: 24, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>Kira Manga</div>
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', fontSize: 76, lineHeight: 1.03, fontWeight: 800, letterSpacing: -4 }}>Your manga.<span>Your way.</span></div>
        <div style={{ marginTop: 30, color: '#9aa1af', fontSize: 28 }}>Discover, save, download, and keep reading.</div>
      </div>
      <div style={{ width: 230, height: 230, border: '2px solid #292e3a', borderRadius: 58, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#161a23', boxShadow: '0 30px 90px rgba(0,0,0,.45)', color: '#ff6470', fontSize: 180, fontWeight: 900 }}>k</div>
    </div>,
    size,
  );
}
