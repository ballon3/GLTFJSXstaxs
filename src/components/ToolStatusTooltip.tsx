import React from 'react';

interface ToolStatusTooltipProps {
  snapToGrid: boolean;
  pointMode: boolean;
  selectMode: boolean;
  textMode: boolean;
  measure: number | null;
  cursorPos: { x: number; y: number } | null;
  backgroundType: 'blank' | 'dotted' | 'lined';
  zoom: number;
  collapsed: boolean;
  onToggleCollapse?: () => void;
}

const ToolStatusTooltip: React.FC<ToolStatusTooltipProps> = ({
  snapToGrid,
  pointMode,
  selectMode,
  textMode,
  measure,
  cursorPos,
  backgroundType,
  zoom,
  collapsed,
  onToggleCollapse,
}) => {
  return (
    <>
    <div
      className="fixed right-6 bottom-20 z-[2002]"
      style={{
        background: 'transparent',
        padding: collapsed ? '16px 16px' : '28px 28px',
        fontSize: 15,
        color: 'var(--stroke)',
        fontFamily: 'Meslo, monospace',
        fontWeight: 600,
        letterSpacing: '0.04em',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1,
        transition: 'all 0.2s',
      }}
    >
      <button
        onClick={onToggleCollapse}
        className="bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg font-bold text-[28px] px-[22px] py-[10px] mb-0 cursor-pointer self-center shadow-sm opacity-50 flex items-center gap-0"
        title={collapsed ? 'Show tool status' : 'Hide tool status'}
      >
        <span style={{fontSize: '1.5em', marginRight: 0, letterSpacing: '0.04em'}}>⌘</span>
      </button>
      {!collapsed && (
        <div className="flex flex-col gap-2 items-start w-full mt-3 text-left">
          <div>Snap: <b style={{color:'var(--stroke)'}}>{snapToGrid ? 'ON' : 'OFF'}</b> <span className="opacity-60">(Ctrl+S)</span></div>
          <div>Points: <b style={{color:'var(--stroke)'}}>{pointMode ? 'ON' : 'OFF'}</b> <span className="opacity-60">(Ctrl+P, Enter)</span></div>
          <div>Select: <b style={{color:'var(--stroke)'}}>{selectMode ? 'ON' : 'OFF'}</b> <span className="opacity-60">(Ctrl+V)</span></div>
          <div>Text: <b style={{color:'var(--stroke)'}}>{textMode ? 'ON' : 'OFF'}</b> <span className="opacity-60">(Ctrl+T)</span></div>
          <div>Clear: <b style={{color:'var(--stroke)'}}>Ctrl+C</b></div>
        </div>
      )}
    </div>
      <div className="fixed right-6 bottom-12 text-neutral-500 dark:text-neutral-400 text-[15px] italic opacity-70 text-left">
        ⌘ T <br />to toggle tool status
      </div>
      </>
  );
};

export default ToolStatusTooltip;
