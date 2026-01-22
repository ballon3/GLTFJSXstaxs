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
      style={{
        position: 'fixed',
        bottom: 80,
        right: 24,
        zIndex: 2002,
        background: 'transparent',
        padding: collapsed ? '16px 16px' : '28px 28px',
        fontSize: 15,
        color: '#181818',
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
        style={{
        background: '#eeebeb',
          color: '#222',
          border: 'none',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 28,
          padding: '10px 22px',
          marginBottom: 0,
          cursor: 'pointer',
          alignSelf: 'center',
          boxShadow: '0 1px 4px 0 rgba(0,0,0,0.10)',
          opacity: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          transition: 'background 0.15s',
        }}
        title={collapsed ? 'Show tool status' : 'Hide tool status'}
      >
        <span style={{fontSize: '1.5em', marginRight: 0, letterSpacing: '0.04em'}}>⌘</span>
      </button>
      {!collapsed && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'flex-start',
          width: '100%',
          marginTop: 12,
          textAlign: 'left',
        }}>
          <div>Snap: <b style={{color:'#181818'}}>{snapToGrid ? 'ON' : 'OFF'}</b> <span style={{opacity:0.6}}>(Ctrl+S)</span></div>
          <div>Points: <b style={{color:'#181818'}}>{pointMode ? 'ON' : 'OFF'}</b> <span style={{opacity:0.6}}>(Ctrl+P, Enter)</span></div>
          <div>Select: <b style={{color:'#181818'}}>{selectMode ? 'ON' : 'OFF'}</b> <span style={{opacity:0.6}}>(Ctrl+V)</span></div>
          <div>Text: <b style={{color:'#181818'}}>{textMode ? 'ON' : 'OFF'}</b> <span style={{opacity:0.6}}>(Ctrl+T)</span></div>
          <div>Clear: <b style={{color:'#181818'}}>Ctrl+C</b></div>
        </div>
      )}
    </div>
      <div style={{
          position: 'fixed',
          bottom: 50,
          right: 24,
          color: '#888',
          fontSize: 15,
          fontStyle: 'italic',
          opacity: 0.7,
          textAlign: 'left',
        }}>
        ⌘ T <br />to toggle tool status
      </div>
      </>
  );
};

export default ToolStatusTooltip;
