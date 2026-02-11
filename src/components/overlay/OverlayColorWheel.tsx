import React, { useRef, useState } from 'react';
import gsap from 'gsap';

const COLORS = [
  '#222', '#e63946', '#f1faee', '#a8dadc', '#457b9d', '#ffbe0b', '#fb5607', '#8338ec', '#3a86ff', '#06d6a0', '#ff006e', '#ffb4a2'
];

interface OverlayColorWheelProps {
  color: string;
  setColor: (c: string) => void;
}

const OverlayColorWheel: React.FC<OverlayColorWheelProps> = ({ color, setColor }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  React.useEffect(() => {
    if (wheelRef.current) {
      if (hovered) {
        gsap.to(wheelRef.current, {
          width: 160,
          height: 160,
          padding: 18,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          duration: 0.35,
          ease: 'power2.out',
        });
      } else {
        gsap.to(wheelRef.current, {
          width: 64,
          height: 64,
          padding: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          duration: 0.35,
          ease: 'power2.out',
        });
      }
    }
    // Animate color buttons outward in a wheel
    COLORS.forEach((_, i) => {
      const btn = document.getElementById(`color-btn-${i}`);
      if (btn) {
        if (hovered) {
          const angle = (i / COLORS.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 60;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          gsap.to(btn, {
            x,
            y,
            scale: 1.2,
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
          });
        } else {
          gsap.to(btn, {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.7,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      }
    });
  }, [hovered]);

  return (
    <div
      ref={wheelRef}
      className="fixed top-[18px] left-[18px] z-[2100] rounded-full flex flex-wrap w-[64px] h-[64px] items-center justify-center gap-1 cursor-pointer"
      style={{
        background: 'rgba(255,255,255,0.85)',
        transition: 'box-shadow 0.3s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {COLORS.map((c, i) => (
        <button
          key={c}
          id={`color-btn-${i}`}
          onClick={() => setColor(c)}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[28px] h-[28px] rounded-full cursor-pointer outline-none opacity-70 shadow"
          style={{
            border: color === c ? '2px solid var(--stroke)' : '1px solid #ccc',
            background: c,
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          }}
          aria-label={`Choose color ${c}`}
        />
      ))}
    </div>
  );
};

export default OverlayColorWheel;
