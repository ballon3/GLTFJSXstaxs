import React, { useRef, useState } from 'react';

export type CardType = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  content: string;
};

const Card: React.FC<{
  card: CardType;
  onDrag: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onEdit?: (id: string, title: string, content: string) => void;
}> = ({ card, onDrag, onResize, onEdit }) => {
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

  return (
    <div
      style={{
        position: 'absolute',
        left: card.x,
        top: card.y,
        width: card.width,
        height: card.height,
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
        zIndex: 1002,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transition: 'box-shadow 0.2s',
      }}
      onPointerDown={handlePointerDown}
    >
      <div style={{ position: 'absolute', right: 8, bottom: 8, width: 18, height: 18, cursor: 'nwse-resize', zIndex: 2 }}
        onPointerDown={handleResizeDown}
      >
        <svg width={18} height={18}><rect x={2} y={2} width={14} height={14} fill="#eee" stroke="#aaa" strokeWidth={1.5} /></svg>
      </div>
      {editing ? (
        <>
          <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, width: '90%' }} />
          <textarea value={editContent} onChange={e => setEditContent(e.target.value)} style={{ fontSize: 15, width: '90%', minHeight: 60, marginBottom: 8 }} />
          <button onClick={handleEditSave} style={{marginRight:8}}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <h2 style={{ fontFamily: 'Meslo, monospace', fontWeight: 700, fontSize: 22, marginBottom: 16, color: '#222', cursor: 'pointer' }} onDoubleClick={() => setEditing(true)}>
            {card.title}
          </h2>
          <p style={{ fontSize: 15, color: '#444', marginBottom: 8, textAlign: 'center', cursor: 'pointer' }} onDoubleClick={() => setEditing(true)}>
            {card.content}
          </p>
        </>
      )}
    </div>
  );
};

export default Card;