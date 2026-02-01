import React, { useRef, useState } from 'react';

export type CardType = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  content: string;
  hidden?: boolean;
};

const Card: React.FC<{
  card: CardType;
  darkMode?: boolean;
  onDrag: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onEdit?: (id: string, title: string, content: string) => void;
  onDelete?: (id: string) => void;
  onHide?: (id: string) => void;
  onHoverChange?: (id: string, hovered: boolean) => void;
}> = ({ card, darkMode = false, onDrag, onResize, onEdit, onDelete, onHide, onHoverChange }) => {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const resizeStart = useRef<{ w: number; h: number; x: number; y: number }>({ w: 0, h: 0, x: 0, y: 0 });
  
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - card.x,
      y: e.clientY - card.y,
    };
    e.stopPropagation();
  };
  const handlePointerMove = (e: MouseEvent) => {
    if (dragging) {
      onDrag(card.id, e.clientX - dragOffset.current.x, e.clientY - dragOffset.current.y);
    }
    if (resizing) {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      onResize(card.id, Math.max(180, resizeStart.current.w + dx), Math.max(100, resizeStart.current.h + dy));
    }
  };
  const handlePointerUp = () => {
    setDragging(false);
    setResizing(false);
  };
  React.useEffect(() => {
    if (dragging || resizing) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      return () => {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
      };
    }
  });
  // Resize handle
  const handleResizeDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setResizing(true);
    resizeStart.current = {
      w: card.width,
      h: card.height,
      x: e.clientX,
      y: e.clientY,
    };
    e.stopPropagation();
  };
  // Edit title/content (optional)
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editContent, setEditContent] = useState(card.content);
  const handleEditSave = () => {
    if (onEdit) onEdit(card.id, editTitle, editContent);
    setEditing(false);
  };

  // Render a small dot icon when the card is hidden
  if (card.hidden) {
    return (
      <button
        title={`Show card: ${card.title}`}
        onClick={(e) => { e.stopPropagation(); if (onHide) onHide(card.id); }}
        style={{
          position: 'absolute',
          left: card.x,
          top: card.y,
          width: 16,
          height: 16,
          borderRadius: 9999,
          background: darkMode ? '#1a1a1a' : '#fff',
          border: darkMode ? '1px solid #555' : '1px solid #aaa',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          cursor: 'pointer',
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={10} height={10} viewBox="0 0 10 10" aria-hidden>
          <circle cx={5} cy={5} r={3} fill={darkMode ? '#eaeaea' : '#181818'} />
        </svg>
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: card.x,
        top: card.y,
        width: card.width,
        height: card.height,
        background: darkMode ? 'rgba(20,20,20,0.7)' : 'rgba(255,255,255,0.7)',
        borderRadius: '18px',
        boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.45)' : '0 8px 32px rgba(0,0,0,0.18)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '32px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        justifyContent: 'center',
        zIndex: 1002,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transition: 'box-shadow 0.2s',
        opacity: 1,
        pointerEvents: 'auto',
        overflow: 'hidden',
      }}
      onPointerDown={handlePointerDown}
      onMouseEnter={() => onHoverChange && onHoverChange(card.id, true)}
      onMouseLeave={() => onHoverChange && onHoverChange(card.id, false)}
    >
      {/* Small dot indicator to denote this is a card */}
      <div
        title="Card"
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          width: 10,
          height: 10,
          borderRadius: 9999,
          background: '#181818',
          opacity: 0.25,
          pointerEvents: 'none',
        }}
      />
      {/* Action buttons */}
      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8 }}>
        <button
          title={card.hidden ? '+' : '-'}
          onClick={(e) => { e.stopPropagation(); if (onHide) onHide(card.id); }}
          style={{
            background: darkMode ? '#1a1a1a' : '#fff',
            border: darkMode ? '1px solid #555' : '1px solid #aaa',
            borderRadius: 8,
            padding: '4px 8px',
            fontSize: 12,
            cursor: 'pointer',
            color: darkMode ? '#e6e6e6' : undefined,
          }}
        >
          {card.hidden ? '+' : '-'}
        </button>
        <button
          title="x"
          onClick={(e) => { e.stopPropagation(); if (onDelete) onDelete(card.id); }}
          style={{
            background: darkMode ? '#1a1a1a' : '#fff',
            border: darkMode ? '1px solid #555' : '1px solid #aaa',
            borderRadius: 8,
            padding: '4px 8px',
            fontSize: 12,
            cursor: 'pointer',
            color: darkMode ? '#e6e6e6' : undefined,
          }}
        >
          x
        </button>
      </div>
      <div style={{ position: 'absolute', right: 8, bottom: 8, width: 18, height: 18, cursor: 'nwse-resize', zIndex: 2 }}
        onPointerDown={handleResizeDown}
      >
        <svg width={18} height={18}><rect x={2} y={2} width={14} height={14} fill={darkMode ? '#333' : '#eee'} stroke={darkMode ? '#666' : '#aaa'} strokeWidth={1.5} /></svg>
      </div>
      {editing ? (
        <>
          <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, width: '90%', color: darkMode ? '#e6e6e6' : undefined, background: darkMode ? 'transparent' : undefined }} />
          <textarea value={editContent} onChange={e => setEditContent(e.target.value)} style={{ fontSize: 15, width: '90%', minHeight: 60, marginBottom: 8, color: darkMode ? '#e6e6e6' : undefined, background: darkMode ? 'transparent' : undefined }} />
          <button onClick={handleEditSave} style={{marginRight:8}}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <h2 style={{ fontFamily: 'Meslo, monospace', fontWeight: 700, fontSize: 22, marginBottom: 16, color: darkMode ? '#e6e6e6' : '#222', cursor: 'pointer' }} onDoubleClick={() => setEditing(true)}>
            {card.title}
          </h2>
          <p style={{ fontSize: 15, color: darkMode ? '#cfcfcf' : '#444', marginBottom: 8, textAlign: 'center', cursor: 'pointer' }} onDoubleClick={() => setEditing(true)}>
            {card.content}
          </p>
        </>
      )}
    </div>
  );
};

export default Card;