import React from 'react';
import gsap from 'gsap';
import type { CardType } from './Card';

export type Edge = 'top' | 'right' | 'bottom' | 'left';

export type Connection = {
  id: string;
  fromCardId: string;
  fromEdge: Edge;
  toCardId: string;
  toEdge: Edge;
};

function getEdgePoint(card: CardType, edge: Edge) {
  const cx = card.x + card.width / 2;
  const cy = card.y + card.height / 2;
  switch (edge) {
    case 'top':
      return { x: cx, y: card.y };
    case 'right':
      return { x: card.x + card.width, y: cy };
    case 'bottom':
      return { x: cx, y: card.y + card.height };
    case 'left':
      return { x: card.x, y: cy };
  }
}

type Props = {
  connections: Connection[];
  cards: CardType[];
  darkMode?: boolean;
};

const SVGConnections: React.FC<Props> = ({ connections, cards, darkMode = false }) => {
  const cardMap = React.useMemo(() => {
    const m = new Map<string, CardType>();
    for (const c of cards) m.set(c.id, c);
    return m;
  }, [cards]);
  const stroke = darkMode ? '#eaeaea' : '#181818';
  const connEls = React.useRef<Map<string, SVGLineElement>>(new Map());
  const prevIds = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    const currentIds = new Set(connections.map((c) => c.id));
    // Animate newly added connections
    connections.forEach((c) => {
      if (!prevIds.current.has(c.id)) {
        const el = connEls.current.get(c.id);
        if (el) {
          const x1 = Number(el.getAttribute('x1')) || 0;
          const y1 = Number(el.getAttribute('y1')) || 0;
          const x2 = Number(el.getAttribute('x2')) || 0;
          const y2 = Number(el.getAttribute('y2')) || 0;
          const len = Math.hypot(x2 - x1, y2 - y1);
          gsap.set(el, { attr: { 'stroke-dasharray': len, 'stroke-dashoffset': len } });
          gsap.to(el, { attr: { 'stroke-dashoffset': 0 }, duration: 0.6, ease: 'power2.out' });
        }
      }
    });
    prevIds.current = currentIds;
    // Cleanup missing refs
    for (const key of Array.from(connEls.current.keys())) {
      if (!currentIds.has(key)) connEls.current.delete(key);
    }
  }, [connections]);

  return (
    <svg
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1004,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <marker id="arrow-head" orient="auto" markerWidth="8" markerHeight="8" refX="4" refY="4">
          <path d="M0,0 L8,4 L0,8 z" fill={stroke} />
        </marker>
      </defs>
      {connections.map((conn) => {
        const fromCard = cardMap.get(conn.fromCardId);
        const toCard = cardMap.get(conn.toCardId);
        if (!fromCard || !toCard) return null;
        const a = getEdgePoint(fromCard, conn.fromEdge);
        const b = getEdgePoint(toCard, conn.toEdge);
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        // Simple straight line; can be upgraded to curved path later
        return (
          <g key={conn.id}>
            <line ref={(el) => { if (el) connEls.current.set(conn.id, el); }} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth={2} markerEnd="url(#arrow-head)" />
            <circle cx={a.x} cy={a.y} r={3} fill={stroke} opacity={0.5} />
            <circle cx={b.x} cy={b.y} r={3} fill={stroke} opacity={0.5} />
            <circle cx={mx} cy={my} r={2} fill={stroke} opacity={0.3} />
          </g>
        );
      })}
    </svg>
  );
};

export default SVGConnections;
