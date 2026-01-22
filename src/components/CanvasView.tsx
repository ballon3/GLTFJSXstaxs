
import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import OverlayColorWheel from './overlay/OverlayColorWheel';



const CanvasView: React.FC = () => {



  const [paths, setPaths] = useState<{ d: string; color: string }[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [color, setColor] = useState('#222');
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [pointMode, setPointMode] = useState(false);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  // Toggle snap-to-grid with S key, point mode with P key, clear with Ctrl+C or Cmd+C
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 's' || e.key === 'S') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setSnapToGrid((prev) => !prev);
      }
      if ((e.key === 'p' || e.key === 'P') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setPointMode((prev) => !prev);
        setPoints([]);
        setCurrentPath('');
      }
      // Clear all with Ctrl+C only
      if (e.ctrlKey && !e.metaKey && (e.key === 'c' || e.key === 'C')) {
        setPaths([]);
        setPoints([]);
        setCurrentPath('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Helper to snap a value to the nearest grid point (20px spacing)
  const snap = (v: number) => Math.round((v - 10) / 20) * 20 + 10;




  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    let { offsetX, offsetY } = e.nativeEvent;
    if (snapToGrid) {
      offsetX = snap(offsetX);
      offsetY = snap(offsetY);
    }
    if (pointMode) {
      setPoints((prev) => {
        const newPoints = [...prev, { x: offsetX, y: offsetY }];
        // Build path string from points
        if (newPoints.length > 1) {
          const d = newPoints.map((pt, i) => (i === 0 ? `M${pt.x},${pt.y}` : `L${pt.x},${pt.y}`)).join(' ');
          setCurrentPath(d);
        } else {
          setCurrentPath(`M${offsetX},${offsetY}`);
        }
        return newPoints;
      });
    } else {
      setDrawing(true);
      setCurrentPath(`M${offsetX},${offsetY}`);
    }
  };


  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (pointMode) return;
    if (!drawing) return;
    let { offsetX, offsetY } = e.nativeEvent;
    if (snapToGrid) {
      offsetX = snap(offsetX);
      offsetY = snap(offsetY);
    }
    setCurrentPath((prev) => prev + ` L${offsetX},${offsetY}`);
  };



  const handlePointerUp = () => {
    if (pointMode) return;
    if (drawing && currentPath) {
      setPaths((prev) => [...prev, { d: currentPath, color }]);
      setCurrentPath('');
    }
    setDrawing(false);
  };

  // Commit point path on Enter key
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (pointMode && (e.key === 'Enter' || e.key === 'Return')) {
        if (currentPath) {
          setPaths((prev) => [...prev, { d: currentPath, color }]);
          setCurrentPath('');
          setPoints([]);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [pointMode, currentPath, color]);


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
      {/* Snap to grid, point mode, and measurement indicator */}
      <div style={{
        position: 'fixed',
        bottom: 75,
        right: 24,
        background: '#eee',
        color: '#222',
        borderRadius: 6,
        padding: '4px 14px',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.04em',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        zIndex: 1001,
        userSelect: 'none',
        transition: 'all 0.2s',
        display: 'flex',
        gap: 16,
        flexDirection: 'column',
        alignItems: 'flex-end',
        minWidth: 220,
      }}>
        {/* Measurement calculation */}
        {(() => {
          let measure: number | null = null;
          if (pointMode && points.length >= 2) {
            const a = points[points.length - 2];
            const b = points[points.length - 1];
            measure = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
          } else if (!pointMode && currentPath) {
            // Try to extract the last segment for freehand
            const match = currentPath.match(/L(\d+\.?\d*),(\d+\.?\d*)$/);
            if (match) {
              const [_, x, y] = match;
              const d = paths.length > 0 ? paths[paths.length - 1].d : '';
              const m = d.match(/L(\d+\.?\d*),(\d+\.?\d*)$/);
              if (m) {
                const [__, x0, y0] = m;
                measure = Math.sqrt((parseFloat(x) - parseFloat(x0)) ** 2 + (parseFloat(y) - parseFloat(y0)) ** 2);
              }
            }
          }
          return (
            <div style={{display:'flex',gap:16,alignItems:'center',width:'100%'}}>
              <span>Snap: <b>{snapToGrid ? 'ON' : 'OFF'}</b> <span style={{opacity:0.7}}>(S)</span></span>
              <span>Points: <b>{pointMode ? 'ON' : 'OFF'}</b> <span style={{opacity:0.7}}>(P, Enter)</span></span>
              <span>Clear: <b>Ctrl+C</b></span>
              <span style={{borderLeft:'1px solid #ccc',marginLeft:8,paddingLeft:12,opacity:0.8}}>
                <span style={{fontWeight:400,marginRight:4}}>Units:</span>
                <span style={{fontWeight:700}}>{measure !== null ? measure.toFixed(1) : '--'}</span>
              </span>
            </div>
          );
        })()}
        {pointMode && (
          <div style={{fontWeight:400,fontSize:12,opacity:0.8,marginTop:2,textAlign:'right',width:'100%'}}>
            <span>Point mode: Click to set points, press Enter to connect and finish.</span>
          </div>
        )}
      </div>
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
        {/* Draw points in point mode */}
        {pointMode && points.map((pt, i) => (
          <circle
            key={`pt-${i}`}
            cx={pt.x}
            cy={pt.y}
            r={4}
            fill={color}
            opacity={0.7}
          />
        ))}
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
