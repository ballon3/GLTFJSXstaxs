
import React, { useRef, useState } from 'react';
import ToolStatusTooltip from './ToolStatusTooltip';
import StatsOverlay from './StatsOverlay';
import gsap from 'gsap';
import OverlayColorWheel from './overlay/OverlayColorWheel';
import LayersPanel from './LayersPanel';
import SVGGrid from './SVGGrid';
import SVGGridLined from './SVGGridLined';
import SVGPaths from './SVGPaths';
import SVGTextElements from './SVGTextElements';
import SVGPoints from './SVGPoints';
import Card, { CardType } from './Card';
import SVGConnections, { Connection, Edge } from './SVGConnections';

const CanvasView: React.FC = () => {
  // --- Overlay collapsed state ---
  const [toolStatusCollapsed, setToolStatusCollapsed] = useState(true);
  const [statsCollapsed, setStatsCollapsed] = useState(false);
  // --- Cards state ---
  const [cards, setCards] = useState<CardType[]>([
    {
      id: 'card-1',
      x: window.innerWidth / 2 - 170,
      y: window.innerHeight / 2 - 110,
      width: 340,
      height: 220,
      title: 'staxs.dev <br/> studio canvas',
      content: 'A flexible digital canvas for brainstorming, note-taking, and visual thinking.',
      hidden: false,
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
        hidden: false,
      },
    ]);
  };
  // Connection helpers
  const edgePoints = (card: CardType) => ({
    top: { x: card.x + card.width / 2, y: card.y },
    right: { x: card.x + card.width, y: card.y + card.height / 2 },
    bottom: { x: card.x + card.width / 2, y: card.y + card.height },
    left: { x: card.x, y: card.y + card.height / 2 },
  });
  const handleAnchorClick = (cardId: string, edge: Edge) => {
    if (!pendingConn) {
      setPendingConn({ cardId, edge });
    } else {
      const id = `conn-${Date.now()}`;
      setConnections((prev) => [
        ...prev,
        {
          id,
          fromCardId: pendingConn.cardId,
          fromEdge: pendingConn.edge,
          toCardId: cardId,
          toEdge: edge,
        },
      ]);
      setPendingConn(null);
    }
  };
  const cancelPendingConn = () => setPendingConn(null);
    // Hide/Show card
    const handleToggleHideCard = (id: string) => {
      setCards(prev => prev.map(c => c.id === id ? { ...c, hidden: !c.hidden } : c));
    };
    // Delete card
    const handleDeleteCard = (id: string) => {
      setCards(prev => prev.filter(c => c.id !== id));
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
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingConn, setPendingConn] = useState<{ cardId: string; edge: Edge } | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [anchorHover, setAnchorHover] = useState<boolean>(false);
  const [connDrag, setConnDrag] = useState<{
    cardId: string;
    edge: Edge;
    start: { x: number; y: number };
    cursor: { x: number; y: number };
  } | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  // --- Project save/load ---
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [saveVersion, setSaveVersion] = useState<number>(0);
  const projectKey = 'staxs_project';
  const formatTs = (ts: number) => {
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  // --- Drag-from-anchor helpers ---
  const findCardAt = (x: number, y: number) => {
    return cards.find((c) => !c.hidden && x >= c.x && x <= c.x + c.width && y >= c.y && y <= c.y + c.height) || null;
  };
  const nearestEdge = (card: CardType, pos: { x: number; y: number }): Edge => {
    const pts = edgePoints(card);
    const d = (p: { x: number; y: number }) => (p.x - pos.x) ** 2 + (p.y - pos.y) ** 2;
    const entries: Array<[Edge, number]> = [
      ['top', d(pts.top)],
      ['right', d(pts.right)],
      ['bottom', d(pts.bottom)],
      ['left', d(pts.left)],
    ];
    entries.sort((a, b) => a[1] - b[1]);
    return entries[0][0];
  };
  const startConnDrag = (cardId: string, edge: Edge) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    const start = edgePoints(card)[edge];
    setConnDrag({ cardId, edge, start, cursor: { x: start.x, y: start.y } });
  };
  React.useEffect(() => {
    if (!connDrag) return;
    const onMove = (e: MouseEvent) => {
      setConnDrag((prev) => (prev ? { ...prev, cursor: { x: e.clientX, y: e.clientY } } : prev));
    };
    const onUp = (e: MouseEvent) => {
      const target = findCardAt(e.clientX, e.clientY);
      if (target) {
        const edge = nearestEdge(target, { x: e.clientX, y: e.clientY });
        const id = `conn-${Date.now()}`;
        setConnections((prev) => [
          ...prev,
          {
            id,
            fromCardId: connDrag.cardId,
            fromEdge: connDrag.edge,
            toCardId: target.id,
            toEdge: edge,
          },
        ]);
      }
      setConnDrag(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [connDrag, cards]);

  React.useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Load saved project on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(projectKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (parsed.cards) setCards(parsed.cards);
        if (parsed.connections) setConnections(parsed.connections);
        if (parsed.layers) setLayers(parsed.layers);
        if (parsed.paths) setPaths(parsed.paths);
        if (parsed.textElements) setTextElements(parsed.textElements);
        if (parsed.backgroundType) setBackgroundType(parsed.backgroundType);
        if (parsed.zoom) setZoom(parsed.zoom);
        if (parsed.lastSavedAt) setLastSavedAt(parsed.lastSavedAt);
        if (parsed.saveVersion) setSaveVersion(parsed.saveVersion);
      }
    } catch (e) {
      // ignore load errors
    }
  }, []);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Toggle snap-to-grid with S key, point mode with P key, clear with Ctrl+C or Cmd+C, background with Ctrl+G
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd+T toggles tool status overlay
      if (e.metaKey && !e.ctrlKey && !e.altKey && (e.key === 't' || e.key === 'T')) {
        setToolStatusCollapsed((prev) => !prev);
        e.preventDefault();
        return;
      }
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

  // Save project to localStorage
  const handleSaveProject = () => {
    const payload = {
      cards,
      connections,
      layers,
      paths,
      textElements,
      backgroundType,
      zoom,
      lastSavedAt: Date.now(),
      saveVersion: saveVersion + 1,
    };
    try {
      localStorage.setItem(projectKey, JSON.stringify(payload));
      setLastSavedAt(payload.lastSavedAt);
      setSaveVersion(payload.saveVersion);
    } catch (e) {
      // ignore save errors
    }
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
        background: darkMode ? '#0b0b0b' : '#f7f7f7',
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
      {/* Tool status modal tooltip as a component */}
      <ToolStatusTooltip
        snapToGrid={snapToGrid}
        pointMode={pointMode}
        selectMode={selectMode}
        textMode={textMode}
        measure={(function() {
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
          return measure;
        })()}
        cursorPos={cursorPos}
        backgroundType={backgroundType}
        zoom={zoom}
        collapsed={toolStatusCollapsed}
        onToggleCollapse={() => setToolStatusCollapsed(c => !c)}
      />
      {/* Stats Overlay (collapsed by default, if you want to show/hide) */}
      <StatsOverlay
        backgroundType={backgroundType}
        zoom={zoom}
        measure={(function() {
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
          return measure;
        })()}
        cursorPos={cursorPos}
        pointMode={pointMode}
        points={points}
        currentPath={currentPath}
        paths={paths}
        collapsed={statsCollapsed}
        onToggleCollapse={() => setStatsCollapsed(c => !c)}
      />
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
      {/* Connection drag preview */}
      {connDrag && (
        <svg
          width={window.innerWidth}
          height={window.innerHeight}
          style={{ position: 'absolute', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 1002, pointerEvents: 'none' }}
        >
          <line x1={connDrag.start.x} y1={connDrag.start.y} x2={connDrag.cursor.x} y2={connDrag.cursor.y} stroke="#181818" strokeWidth={2} strokeDasharray="4 4" />
        </svg>
      )}
      {/* Connections overlay */}
      <SVGConnections connections={connections} cards={cards} darkMode={darkMode} />
      {/* Anchors overlay */}
      {cards.filter(c => !c.hidden && c.id === hoveredCardId).map((card) => (
        <div key={`anchors-${card.id}`} style={{ position: 'absolute', left: 0, top: 0, zIndex: 1003, pointerEvents: 'none' }}>
          {(['top','right','bottom','left'] as Edge[]).map((edge) => {
            const pos = edgePoints(card)[edge];
            return (
              <button
                key={`${card.id}-${edge}`}
                title={`Connect from ${edge}`}
                onMouseEnter={() => { setAnchorHover(true); setHoveredCardId(card.id); }}
                onMouseLeave={() => { setAnchorHover(false); }}
                onPointerDown={(e) => { e.stopPropagation(); startConnDrag(card.id, edge); }}
                onClick={(e) => { e.stopPropagation(); if (connDrag) return; handleAnchorClick(card.id, edge); }}
                style={{
                  position: 'absolute',
                  left: pos.x - 6,
                  top: pos.y - 6,
                  width: 12,
                  height: 12,
                  borderRadius: 9999,
                  background: pendingConn && pendingConn.cardId === card.id && pendingConn.edge === edge ? 'rgba(24,24,24,0.8)' : 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(136,136,136,0.6)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  opacity: 0.5,
                  pointerEvents: 'auto',
                  cursor: 'crosshair',
                }}
              />
            );
          })}
        </div>
      ))}
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
          darkMode={darkMode}
          onDrag={handleDragCard}
          onResize={handleResizeCard}
          onEdit={handleEditCard}
          onDelete={handleDeleteCard}
          onHide={handleToggleHideCard}
          onHoverChange={(id, hovered) => {
            if (hovered) {
              setHoveredCardId(id);
            } else {
              setHoveredCardId((prev) => {
                if (prev !== id) return prev;
                return anchorHover ? id : null;
              });
            }
          }}
        />
      ))}
      {/* Add Card Button */}
      <button
        style={{
          position: 'fixed',
          left: '10%',
          top: '3%',
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
      {/* Save Project (top right) */}
      <div
        style={{
          position: 'fixed',
          right: '10%',
          top: '3%',
          zIndex: 2002,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            background: '#fff',
            border: '1px solid #aaa',
            borderRadius: 8,
            padding: '8px 12px',
            fontWeight: 700,
            fontSize: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer',
          }}
          onClick={() => setDarkMode(m => !m)}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          title="Save project"
          style={{
            background: '#fff',
            border: '1px solid #aaa',
            borderRadius: 8,
            padding: '8px 18px',
            fontWeight: 700,
            fontSize: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer',
          }}
          onClick={handleSaveProject}
        >
          Save Project
        </button>
        <div
          style={{
            background: '#fff',
            border: '1px solid #aaa',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 14,
            color: '#333',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          {lastSavedAt ? `Saved v${saveVersion} — ${formatTs(lastSavedAt)}` : 'Not saved yet'}
        </div>
      </div>
      {pendingConn && (
        <button
          style={{
            position: 'fixed',
            left: '10%',
            top: '16%',
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
          onClick={cancelPendingConn}
        >
          Cancel Connection
        </button>
      )}
      {/* Unhide all cards */}
      <button
        style={{
          position: 'fixed',
          left: '10%',
          top: '10%',
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
        onClick={() => setCards(prev => prev.map(c => ({ ...c, hidden: false })))}
      >
        Show Cards
      </button>
    </div>
  );
};

export default CanvasView;
