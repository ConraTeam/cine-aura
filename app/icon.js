import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a0b2e 0%, #6d28d9 100%)',
          color: '#fff',
          fontSize: 260,
          fontWeight: 700,
          fontFamily: 'sans-serif',
        }}
      >
        CA
      </div>
    ),
    { ...size }
  );
}
