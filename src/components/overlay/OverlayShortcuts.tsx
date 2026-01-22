

const stats = [
  { label: 'Canvas Mode', value: '⌘ Ctrl+S', desc: 'Switch to Canvas & Save' },
  { label: '3D Mode', value: '⌘ X', desc: 'Switch to 3D view' },
];

const OverlayShortcuts = () => (
  <div
    style={{
      position: 'fixed',
      top: 100,
      left: 32,
      zIndex: 2100,
      fontFamily: 'Menlo, monospace',
      fontSize: 13,
      color: '#222',
      background: 'none',
      textAlign: 'left',
      lineHeight: 1.7,
      pointerEvents: 'none',
      letterSpacing: 0.2,
      userSelect: 'none',
      minWidth: 260,
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {stats.map((s) => (
        <div key={s.label} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minHeight: 22 }}>
            <span style={{ minWidth: 90, textAlign: 'left', color: 'rgba(0,0,0,0.55)', fontWeight: 700, fontSize: 14, letterSpacing: 0.5, opacity: 0.7 }}>{s.value}</span>
          </div>
          <div style={{ textAlign: 'left', color: '#444', fontSize: 11, marginLeft: 0, marginTop: 1, opacity: 0.7 }}>{s.desc}</div>
        </div>
      ))}
    </div>
  </div>
);

export default OverlayShortcuts;
