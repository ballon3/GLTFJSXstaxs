
import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import OverlayColorWheel from './overlay/OverlayColorWheel';



const CanvasView: React.FC = () => {

  const [paths, setPaths] = useState<{ d: string; color: string }[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [color, setColor] = useState('#222');


  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    setCurrentPath(`M${offsetX},${offsetY}`);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    setCurrentPath((prev) => prev + ` L${offsetX},${offsetY}`);
  };


  const handlePointerUp = () => {
    if (drawing && currentPath) {
      setPaths((prev) => [...prev, { d: currentPath, color }]);
      setCurrentPath('');
    }
    setDrawing(false);
  };


  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
      }}
    >
      {/* Color wheel overlay */}
      <OverlayColorWheel color={color} setColor={setColor} />
      {/* Dotted notebook background as SVG */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Dots grid */}
        {Array.from({ length: Math.ceil(window.innerWidth / 20) }).map((_, x) =>
          Array.from({ length: Math.ceil(window.innerHeight / 20) }).map((_, y) => (
            <circle
              key={`dot-${x}-${y}`}
              cx={x * 20 + 10}
              cy={y * 20 + 10}
              r={1.2}
              fill="#bbb"
              opacity={0.7}
            />
          ))
        )}
        {/* Drawn paths */}
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            stroke={p.color}
            strokeWidth={2.5}
            fill="none"
          />
        ))}
        {currentPath && (
          <path
            d={currentPath}
            stroke={color}
            strokeWidth={2.5}
            fill="none"
            opacity={0.5}
          />
        )}
      </svg>
      {/* Floating card for comfort */}
      {/* <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: 340,
          minHeight: 220,
          background: 'rgba(255,255,255,0.7)',
          borderRadius: '18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '32px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <h2 style={{ position: 'fixed', fontFamily: 'Meslo, monospace', fontWeight: 700, fontSize: 22, marginBottom: 16, color: '#222' }}>
          Dotted Notebook Canvas
        </h2>
        <p style={{ fontSize: 15, color: '#444', marginBottom: 8, textAlign: 'center' }}>
          Draw with your mouse or touch. SVG paths are animated with GSAP.
        </p>
      </div> */}
    </div>
  );
};

export default CanvasView;
