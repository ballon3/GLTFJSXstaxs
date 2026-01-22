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
      style={{
        position: 'fixed',
        top: 18,
        left: 18,
        zIndex: 2100,
        background: 'rgba(255,255,255,0.85)',
        borderRadius: '50%',
        display: 'flex',
        flexWrap: 'wrap',
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        transition: 'box-shadow 0.3s',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {COLORS.map((c, i) => (
        <button
          key={c}
          id={`color-btn-${i}`}
          onClick={() => setColor(c)}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: color === c ? '2px solid #222' : '1px solid #ccc',
            background: c,
            cursor: 'pointer',
            outline: 'none',
            opacity: 0.7,
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          }}
          aria-label={`Choose color ${c}`}
        />
      ))}
    </div>
  );
};

export default OverlayColorWheel;
