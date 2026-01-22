
import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import OverlayColorWheel from './overlay/OverlayColorWheel';
import LayersPanel from './LayersPanel';
import SVGGrid from './SVGGrid';
import SVGGridLined from './SVGGridLined';
import SVGPaths from './SVGPaths';
import SVGTextElements from './SVGTextElements';
import SVGPoints from './SVGPoints';
import Card, { CardType } from './Card';

const CanvasView: React.FC = () => {
  // --- Cards state ---
  const [cards, setCards] = useState<CardType[]>([
    {
      id: 'card-1',
      x: window.innerWidth / 2 - 170,
      y: window.innerHeight / 2 - 110,
      width: 340,
      height: 220,
      title: 'Dotted Notebook Canvas',
      content: 'Draw with your mouse or touch. SVG paths are animated with GSAP.',
    },
  ]);

  // Add card handler
  const handleAddCard = () => {
    const id = `card-${Date.now()}`;
    setCards(prev => [
      ...prev,
      {
        id,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        width: 320,
        height: 180,
        title: 'New Card',
        content: 'Double-click to edit.',
      },
    ]);
  };
  // Drag card
  const handleDragCard = (id: string, x: number, y: number) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, x, y } : c));
  };
  // Resize card
  const handleResizeCard = (id: string, width: number, height: number) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, width, height } : c));
  };
  // Edit card
  const handleEditCard = (id: string, title: string, content: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, title, content } : c));
  };



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
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [backgroundType, setBackgroundType] = useState<'blank' | 'dotted' | 'lined'>('dotted');
  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: window.innerWidth, height: window.innerHeight });

  React.useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Toggle snap-to-grid with S key, point mode with P key, clear with Ctrl+C or Cmd+C, background with Ctrl+G
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
        if (e.key === 'g' || e.key === 'G') {
          setBackgroundType(prev => {
            if (prev === 'blank') return 'dotted';
            if (prev === 'dotted') return 'lined';
            return 'blank';
          });
        }
        if (e.key === '+' || e.key === '=') {
          setZoom(z => Math.min(5, z + 0.2));
        }
        if (e.key === '-') {
          setZoom(z => Math.max(0.2, z - 0.2));
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
    setCursorPos({ x: offsetX, y: offsetY });
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
          setPaths((prev) => [...prev, { d: currentPath, color, layerId: activeLayerId }]);
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
        bottom: '12%',
        right: '2%',
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
              {cursorPos && (
                <span style={{marginLeft:12,opacity:0.8,fontWeight:400,fontSize:13}}>
                  <span style={{fontWeight:700}}>Cursor:</span> {Math.round(cursorPos.x)}, {Math.round(cursorPos.y)}
                </span>
              )}
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
      {/* Background toggle UI and zoom controls */}
      <div style={{position:'fixed',bottom:'3%',right:'2%',zIndex:2001,background:'#fff',borderRadius:6,padding:'4px 12px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',fontSize:13,display:'flex',alignItems:'center',gap:16}}>
        <span style={{marginRight:8,fontWeight:600}}>Background:</span>
        <select value={backgroundType} onChange={e => setBackgroundType(e.target.value as any)}>
          <option value="blank">Blank</option>
          <option value="dotted">Dotted</option>
          <option value="lined">Lined</option>
        </select>
        <span style={{marginLeft:16,fontWeight:600}}>Zoom:</span>
        <button onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} style={{marginRight:4}}>-</button>
        <span style={{minWidth:40,textAlign:'center'}}>{(zoom * 100).toFixed(0)}%</span>
        <button onClick={() => setZoom(z => Math.min(5, z + 0.2))}>+</button>
      </div>
      {/* Grid SVG always fills viewport, not affected by zoom */}
      <svg
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {backgroundType === 'dotted' && (
          <SVGGrid width={window.innerWidth} height={window.innerHeight} zoom={1} />
        )}
        {backgroundType === 'lined' && (
          <SVGGridLined width={window.innerWidth} height={window.innerHeight} />
        )}
      </svg>
      {/* Main drawing SVG, zoomed */}
      <svg
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${zoom})`,
          transformOrigin: 'center center',
          zIndex: 1,
          background: 'transparent',
          boxShadow: zoom < 1 ? '0 0 24px 4px rgba(0,0,0,0.08)' : undefined,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Drawn paths */}
        <SVGPaths
          paths={paths}
          layers={layers}
          selectMode={selectMode}
          selectedPathIndex={selectedPathIndex}
          handlePathPointerDown={handlePathPointerDown}
        />
        {/* Draw text elements */}
        <SVGTextElements
          textElements={textElements}
          layers={layers}
          selectMode={selectMode}
          selectedTextIndex={selectedTextIndex}
          handleTextPointerDown={handleTextPointerDown}
        />
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
        <SVGPoints points={points} color={color} pointMode={pointMode} />
      </svg>
      {/* Dynamic Cards */}
      {cards.map(card => (
        <Card
          key={card.id}
          card={card}
          onDrag={handleDragCard}
          onResize={handleResizeCard}
          onEdit={handleEditCard}
        />
      ))}
      {/* Add Card Button */}
      <button
        style={{
          position: 'fixed',
          left: 24,
          top: 24,
          zIndex: 2002,
          background: '#fff',
          border: '1px solid #aaa',
          borderRadius: 8,
          padding: '8px 18px',
          fontWeight: 700,
          fontSize: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
        }}
        onClick={handleAddCard}
      >
        + Add Card
      </button>
      // (removed duplicate card state/handlers)
    </div>
  );
};

export default CanvasView;
