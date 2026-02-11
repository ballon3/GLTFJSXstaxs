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
        className="fixed bottom-1 right-5 z-[2001] rounded-md px-[18px] py-[6px] text-[14px] font-bold font-[Meslo,monospace] tracking-wider shadow-md cursor-pointer bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
        title="Show stats overlay"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="block" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="17" width="3" height="4" fill="var(--stroke)"/>
          <rect x="9" y="13" width="3" height="8" fill="var(--stroke)"/>
          <rect x="15" y="9" width="3" height="12" fill="var(--stroke)"/>
          <rect x="21" y="5" width="3" height="16" fill="var(--stroke)"/>
        </svg>
      </button>
    );
  }
  return (
    <div className="fixed bottom-1 right-5 z-[2001] rounded-md px-[18px] py-[6px] text-[14px] flex items-center gap-[18px] shadow-md select-none text-[var(--stroke)]">
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
        BG: <span className="text-neutral-500 dark:text-neutral-400">{backgroundType[0].toUpperCase()}</span>
      </span>
      <span style={{ minWidth: 60 }}>
        Zoom: <span className="text-neutral-500 dark:text-neutral-400">{(zoom * 100).toFixed(0)}%</span>
      </span>
      <span style={{ minWidth: 70 }}>
        Units: <span className="text-neutral-500 dark:text-neutral-400">{measure !== null ? measure.toFixed(1) : '--'}</span>
      </span>
      <span style={{ minWidth: 90 }}>
        Cursor: <span className="text-neutral-500 dark:text-neutral-400">{cursorPos ? `${Math.round(cursorPos.x)},${Math.round(cursorPos.y)}` : '--,--'}</span>
      </span>
    </div>
  );
};

export default StatsOverlay;
