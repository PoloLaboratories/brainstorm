import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #e8a849, #d4735e)',
          borderRadius: 40,
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Edges */}
          <line x1="256" y1="148" x2="152" y2="310" stroke="white" strokeWidth="14" strokeLinecap="round" opacity="0.5" />
          <line x1="256" y1="148" x2="360" y2="310" stroke="white" strokeWidth="14" strokeLinecap="round" opacity="0.5" />
          <line x1="152" y1="310" x2="360" y2="310" stroke="white" strokeWidth="14" strokeLinecap="round" opacity="0.5" />
          <line x1="256" y1="148" x2="256" y2="256" stroke="white" strokeWidth="14" strokeLinecap="round" opacity="0.5" />
          <line x1="152" y1="310" x2="256" y2="256" stroke="white" strokeWidth="14" strokeLinecap="round" opacity="0.5" />
          <line x1="360" y1="310" x2="256" y2="256" stroke="white" strokeWidth="14" strokeLinecap="round" opacity="0.5" />
          {/* Central node */}
          <circle cx="256" cy="256" r="36" fill="white" />
          {/* Top node */}
          <circle cx="256" cy="148" r="28" fill="white" opacity="0.9" />
          {/* Bottom-left node */}
          <circle cx="152" cy="310" r="24" fill="white" opacity="0.85" />
          {/* Bottom-right node */}
          <circle cx="360" cy="310" r="24" fill="white" opacity="0.85" />
          {/* Small accent nodes */}
          <circle cx="190" cy="196" r="10" fill="white" opacity="0.5" />
          <circle cx="330" cy="200" r="10" fill="white" opacity="0.5" />
          <circle cx="256" cy="365" r="10" fill="white" opacity="0.5" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
