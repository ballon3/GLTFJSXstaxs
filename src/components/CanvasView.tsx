
import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import OverlayColorWheel from './overlay/OverlayColorWheel';
import LayersPanel from './LayersPanel';



const CanvasView: React.FC = () => {



  // --- Layers ---
  type Layer = { id: string; name: string; visible: boolean };
  type Path = { d: string; color: string; layerId: string };
  type TextEl = { x: number; y: number; value: string; color: string; layerId: string };

  const [layers, setLayers] = useState<Layer[]>([
    { id: 'layer-1', name: 'Layer 1', visible: true },
  ]);
  const [activeLayerId, setActiveLayerId] = useState('layer-1');
  const [paths, setPaths] = useState<Path[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [color, setColor] = useState('#222');
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [pointMode, setPointMode] = useState(false);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  // --- Text and selection tool state ---
  const [textMode, setTextMode] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [textElements, setTextElements] = useState<TextEl[]>([]);
  const [pendingText, setPendingText] = useState<{ x: number; y: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState('');
  const [selectedPathIndex, setSelectedPathIndex] = useState<number | null>(null);
  const [selectedTextIndex, setSelectedTextIndex] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Toggle snap-to-grid with S key, point mode with P key, clear with Ctrl+C or Cmd+C
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === 's' || e.key === 'S') {
          setSnapToGrid((prev) => !prev);
        }
        if (e.key === 'p' || e.key === 'P') {
          setPointMode((prev) => !prev);
          setSelectMode(false);
          setTextMode(false);
          setPoints([]);
          setCurrentPath('');
        }
        if (e.key === 'v' || e.key === 'V') {
          setSelectMode((prev) => !prev);
          setPointMode(false);
          setTextMode(false);
          setPoints([]);
          setCurrentPath('');
          setSelectedPathIndex(null);
          setSelectedTextIndex(null);
        }
        if (e.key === 't' || e.key === 'T') {
          setTextMode((prev) => !prev);
          setSelectMode(false);
          setPointMode(false);
          setPoints([]);
          setCurrentPath('');
        }
        if (e.key === 'c' || e.key === 'C') {
          setPaths([]);
          setPoints([]);
          setCurrentPath('');
          setTextElements([]);
        }
      }
      if (e.key === 'Escape') {
        setPendingText(null);
        setTextInputValue('');
        setSelectedPathIndex(null);
        setSelectedTextIndex(null);
        setDragging(false);
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
    if (textMode) {
      setPendingText({ x: offsetX, y: offsetY });
      setTextInputValue('');
      return;
    }
    if (selectMode) {
      if (e.target === e.currentTarget) {
        setSelectedPathIndex(null);
        setSelectedTextIndex(null);
      }
      return;
    }
    if (pointMode) {
      setPoints((prev) => {
        const newPoints = [...prev, { x: offsetX, y: offsetY }];
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

  // For path elements in select mode
  const handlePathPointerDown = (e: React.PointerEvent<SVGPathElement>, i: number) => {
    if (!selectMode) return;
    e.stopPropagation();
    setSelectedPathIndex(i);
    setDragging(true);
    let { offsetX, offsetY } = e.nativeEvent;
    const path = paths[i];
    const match = path.d.match(/M(\d+\.?\d*),(\d+\.?\d*)/);
    if (match) {
      const [_, x, y] = match;
      dragOffset.current = { x: offsetX - parseFloat(x), y: offsetY - parseFloat(y) };
    } else {
      dragOffset.current = { x: 0, y: 0 };
    }
  };

  // For text elements in select mode
  const handleTextPointerDown = (e: React.PointerEvent<SVGTextElement>, i: number) => {
    if (!selectMode) return;
    e.stopPropagation();
    setSelectedTextIndex(i);
    setDragging(true);
    let { offsetX, offsetY } = e.nativeEvent;
    const text = textElements[i];
    dragOffset.current = { x: offsetX - text.x, y: offsetY - text.y };
  };


  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    let { offsetX, offsetY } = e.nativeEvent;
    if (snapToGrid) {
      offsetX = snap(offsetX);
      offsetY = snap(offsetY);
    }
    // Drag text
    if (selectMode && dragging && selectedTextIndex !== null) {
      setTextElements((prev) => prev.map((t, idx) => idx === selectedTextIndex ? { ...t, x: offsetX - dragOffset.current.x, y: offsetY - dragOffset.current.y } : t));
      return;
    }
    // Drag path
    if (selectMode && dragging && selectedPathIndex !== null) {
      setPaths((prev) => prev.map((p, idx) => {
        if (idx !== selectedPathIndex) return p;
        const points = Array.from(p.d.matchAll(/([ML])(\d+\.?\d*),(\d+\.?\d*)/g)).map(([, cmd, x, y]) => ({ cmd, x: parseFloat(x), y: parseFloat(y) }));
        if (points.length === 0) return p;
        const dx = offsetX - (points[0].x + dragOffset.current.x);
        const dy = offsetY - (points[0].y + dragOffset.current.y);
        const newD = points.map(pt => `${pt.cmd}${pt.x + dx},${pt.y + dy}`).join(' ');
        return { ...p, d: newD, color: p.color, layerId: p.layerId };
      }));
      return;
    }
    if (pointMode) return;
    if (!drawing) return;
    setCurrentPath((prev) => prev + ` L${offsetX},${offsetY}`);
  };



  const handlePointerUp = () => {
    if (selectMode && dragging) {
      setDragging(false);
      return;
    }
    if (pointMode) return;
    if (drawing && currentPath) {
      setPaths((prev) => [...prev, { d: currentPath, color, layerId: activeLayerId }]);
      setCurrentPath('');
    }
    setDrawing(false);
  };

  // Handle text input submit
  const handleTextInputSubmit = () => {
    if (pendingText && textInputValue.trim()) {
      setTextElements((prev) => [
        ...prev,
        { x: pendingText.x, y: pendingText.y, value: textInputValue, color, layerId: activeLayerId },
      ]);
      setPendingText(null);
      setTextInputValue('');
    }
  };
  // --- Layer management handlers ---
  const handleAddLayer = () => {
    const id = `layer-${Date.now()}`;
    setLayers((prev) => [...prev, { id, name: `Layer ${prev.length + 1}`, visible: true }]);
    setActiveLayerId(id);
  };
  const handleSelectLayer = (id: string) => setActiveLayerId(id);
  const handleDeleteLayer = (id: string) => {
    setLayers((prev) => prev.filter(l => l.id !== id));
    setPaths((prev) => prev.filter(p => p.layerId !== id));
    setTextElements((prev) => prev.filter(t => t.layerId !== id));
    setTimeout(() => {
      setLayers((layersNow) => {
        if (layersNow.length === 0) return [];
        if (!layersNow.find(l => l.id === activeLayerId)) {
          setActiveLayerId(layersNow[0].id);
        }
        return layersNow;
      });
    }, 0);
  };
  const handleToggleLayer = (id: string) => {
    setLayers((prev) => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };
  const handleRenameLayer = (id: string, name: string) => {
    setLayers((prev) => prev.map(l => l.id === id ? { ...l, name } : l));
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
      {/* Layers UI */}
      <LayersPanel
        layers={layers}
        activeLayerId={activeLayerId}
        onAddLayer={handleAddLayer}
        onSelectLayer={handleSelectLayer}
        onDeleteLayer={handleDeleteLayer}
        onToggleLayer={handleToggleLayer}
        onRenameLayer={handleRenameLayer}
      />
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
        minWidth: 260,
      }}>
        {/* Measurement calculation and tool status */}
        {(() => {
          let measure: number | null = null;
          if (pointMode && points.length >= 2) {
            const a = points[points.length - 2];
            const b = points[points.length - 1];
            measure = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
          } else if (!pointMode && currentPath) {
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
              <span>Snap: <b>{snapToGrid ? 'ON' : 'OFF'}</b> <span style={{opacity:0.7}}>(Ctrl+S)</span></span>
              <span>Points: <b>{pointMode ? 'ON' : 'OFF'}</b> <span style={{opacity:0.7}}>(Ctrl+P, Enter)</span></span>
              <span>Select: <b>{selectMode ? 'ON' : 'OFF'}</b> <span style={{opacity:0.7}}>(Ctrl+V)</span></span>
              <span>Text: <b>{textMode ? 'ON' : 'OFF'}</b> <span style={{opacity:0.7}}>(Ctrl+T)</span></span>
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
        {selectMode && (
          <div style={{fontWeight:400,fontSize:12,opacity:0.8,marginTop:2,textAlign:'right',width:'100%'}}>
            <span>Select mode: Click a path or text, then drag to move it.</span>
          </div>
        )}
        {textMode && (
          <div style={{fontWeight:400,fontSize:12,opacity:0.8,marginTop:2,textAlign:'right',width:'100%'}}>
            <span>Text mode: Click to place, type, Enter to add.</span>
          </div>
        )}
      </div>
      {/* Dotted notebook background as SVG */}
      {/* Text input overlay for adding text */}
      {pendingText && (
        <div
          style={{
            position: 'fixed',
            left: pendingText.x,
            top: pendingText.y,
            zIndex: 2000,
            background: 'white',
            border: '1px solid #aaa',
            borderRadius: 4,
            padding: '2px 8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <input
            autoFocus
            value={textInputValue}
            onChange={e => setTextInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleTextInputSubmit();
              if (e.key === 'Escape') { setPendingText(null); setTextInputValue(''); }
            }}
            style={{ fontSize: 16, border: 'none', outline: 'none', background: 'transparent', color }}
            placeholder="Enter text..."
          />
        </div>
      )}
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
        {paths.filter(p => {
          const layer = layers.find(l => l.id === p.layerId);
          return layer && layer.visible;
        }).map((p, i) => {
          const visiblePaths = paths.filter(pth => {
            const layer = layers.find(l => l.id === pth.layerId);
            return layer && layer.visible;
          });
          const isSelected = selectMode && visiblePaths[selectedPathIndex ?? -1]?.d === p.d;
          return (
            <path
              key={i}
              d={p.d}
              stroke={p.color}
              strokeWidth={isSelected ? 4 : 2.5}
              fill="none"
              opacity={isSelected ? 1 : 0.95}
              style={{ cursor: selectMode ? 'move' : 'pointer', filter: isSelected ? 'drop-shadow(0 0 4px #1a3a7a)' : undefined }}
              onPointerDown={e => handlePathPointerDown(e, i)}
            />
          );
        })}
        {/* Draw text elements */}
        {textElements.filter(t => {
          const layer = layers.find(l => l.id === t.layerId);
          return layer && layer.visible;
        }).map((t, i) => {
          const visibleTexts = textElements.filter(txt => {
            const layer = layers.find(l => l.id === txt.layerId);
            return layer && layer.visible;
          });
          const isSelected = selectMode && visibleTexts[selectedTextIndex ?? -1]?.x === t.x && visibleTexts[selectedTextIndex ?? -1]?.y === t.y;
          return (
            <text
              key={`text-${i}`}
              x={t.x}
              y={t.y}
              fill={t.color}
              fontSize={20}
              fontFamily="inherit, sans-serif"
              style={{
                userSelect: 'none',
                cursor: selectMode ? 'move' : 'text',
                filter: isSelected ? 'drop-shadow(0 0 4px #1a3a7a)' : undefined,
                pointerEvents: selectMode ? 'auto' : 'none',
              }}
              onPointerDown={e => handleTextPointerDown(e, i)}
            >
              {t.value}
            </text>
          );
        })}
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
