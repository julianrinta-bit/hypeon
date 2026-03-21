import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Hype On Media — YouTube. Engineered.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ color: '#FFD300', fontSize: 72, fontWeight: 800 }}>
          Hype On Media
        </div>
        <div style={{ color: '#f0f0ec', fontSize: 36, marginTop: 16 }}>
          YouTube. Engineered.
        </div>
        <div style={{ color: 'rgba(240,240,236,0.6)', fontSize: 24, marginTop: 24 }}>
          5B+ organic views &bull; $4M+/month revenue built &bull; 50+ channels
        </div>
      </div>
    ),
    { ...size }
  );
}
