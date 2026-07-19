import { ImageResponse } from 'next/og';

export const alt = 'Kira Manga — Your next chapter is already waiting';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '74px 86px', background: '#f6f2e8', color: '#1c1b17', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760 }}>
        <div style={{ color: '#9a6900', fontSize: 24, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>Kira Manga</div>
        <div style={{ marginTop: 28, fontSize: 76, lineHeight: 1.03, fontWeight: 800, letterSpacing: -4, textTransform: 'uppercase' }}>Immerse in every chapter.</div>
        <div style={{ marginTop: 30, color: '#68655d', fontSize: 28 }}>A focused manga reader for Android and iOS.</div>
      </div>
      <div style={{ width: 230, height: 230, borderRadius: 115, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1c1b17', boxShadow: '0 30px 80px rgba(65,48,8,.2)', color: '#f5c33d', fontSize: 180, fontWeight: 900 }}>k</div>
    </div>,
    size,
  );
}
