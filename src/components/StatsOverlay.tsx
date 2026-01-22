import React from 'react';

interface StatsOverlayProps {
  backgroundType: 'blank' | 'dotted' | 'lined';
  zoom: number;
  measure: number | null;
  cursorPos: { x: number; y: number } | null;
  pointMode: boolean;
  points: { x: number; y: number }[];
  currentPath: string;
  paths: { d: string; color: string; layerId: string }[];
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const StatsOverlay: React.FC<StatsOverlayProps> = ({
  backgroundType,
  zoom,
  measure,
  cursorPos,
  collapsed,
  onToggleCollapse,
}) => {
  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        style={{
          position: 'fixed',
          bottom: 5,
          right: 20,
          zIndex: 2001,
          background: 'rgba(241, 233, 233, 0.82)',
          borderRadius: 7,
          padding: '6px 18px',
          fontSize: 14,
          color: '#181818',
          fontFamily: 'Meslo, monospace',
          fontWeight: 700,
          letterSpacing: '0.04em',
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.18)',
          userSelect: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
        title="Show stats overlay"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{display:'block'}} xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="17" width="3" height="4" fill="#181818"/>
          <rect x="9" y="13" width="3" height="8" fill="#181818"/>
          <rect x="15" y="9" width="3" height="12" fill="#181818"/>
          <rect x="21" y="5" width="3" height="16" fill="#181818"/>
        </svg>
      </button>
    );
  }
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 5,
        right: 20,
        zIndex: 2001,
        // background: 'rgba(255, 255, 255, 0.82)',
        borderRadius: 7,
        padding: '6px 18px',
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        color: '#03291c',
        fontFamily: 'Meslo, monospace',
        fontWeight: 700,
        letterSpacing: '0.04em',
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.18)',
        userSelect: 'none',
      }}
    >
      {/* <button
        onClick={onToggleCollapse}
        style={{
        //   background: 'rgba(230,230,230,0.92)',
          color: '#181818',
          border: 'none',
          borderRadius: 8,
          fontSize: 18,
          padding: '4px 10px',
          marginRight: 10,
          cursor: 'pointer',
          alignSelf: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          transition: 'background 0.15s',
        }}
        title="Hide stats overlay"
      >
        Cursor: <span style={{ color: '#000000' }}>{cursorPos ? `${Math.round(cursorPos.x)},${Math.round(cursorPos.y)}` : '--,--'}</span>
      </button> */}
      <span style={{ minWidth: 60 }}>
        BG: <span style={{ color: '#000000' }}>{backgroundType[0].toUpperCase()}</span>
      </span>
      <span style={{ minWidth: 60 }}>
        Zoom: <span style={{ color: '#000000' }}>{(zoom * 100).toFixed(0)}%</span>
      </span>
      <span style={{ minWidth: 70 }}>
        Units: <span style={{ color: '#000000' }}>{measure !== null ? measure.toFixed(1) : '--'}</span>
      </span>
      <span style={{ minWidth: 90 }}>
        Cursor: <span style={{ color: '#000000' }}>{cursorPos ? `${Math.round(cursorPos.x)},${Math.round(cursorPos.y)}` : '--,--'}</span>
      </span>
    </div>
  );
};

export default StatsOverlay;
