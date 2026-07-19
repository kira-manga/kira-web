import { ImageResponse } from 'next/og';

export const alt = 'Kira Manga — Your next chapter is already waiting';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '74px 86px', background: '#0e1014', color: '#f3f4f7', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760 }}>
        <div style={{ color: '#ff7180', fontSize: 24, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>Kira Manga</div>
        <div style={{ marginTop: 28, fontSize: 76, lineHeight: 1.03, fontWeight: 800, letterSpacing: -4 }}>Your next chapter is already waiting.</div>
        <div style={{ marginTop: 30, color: '#aab0bc', fontSize: 28 }}>Read your way on Android and iOS.</div>
      </div>
      <div style={{ width: 230, height: 230, borderRadius: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg, #202532, #090b0f)', boxShadow: '0 30px 80px rgba(0,0,0,.55)', color: '#ff6f68', fontSize: 180, fontWeight: 900 }}>k</div>
    </div>,
    size,
  );
}
