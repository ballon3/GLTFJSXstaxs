

const stats = [
  { label: 'Canvas Mode', value: '⌘ Ctrl+S', desc: 'Switch to Canvas & Save' },
  { label: '3D Mode', value: '⌘ X', desc: 'Switch to 3D view' },
];

const OverlayShortcuts = () => (
  <div
    className="fixed top-[100px] left-8 z-[2000] font-[Menlo,monospace] text-[13px] text-[var(--stroke)] bg-none text-left leading-[1.7] pointer-events-none tracking-[0.2px] select-none min-w-[260px]"
  >
    <div className="flex flex-col gap-0">
      {stats.map((s) => (
        <div key={s.label} style={{ marginBottom: 10 }}>
          <div className="flex flex-row items-center min-h-[22px]">
            <span className="min-w-[90px] text-left font-bold text-[14px] tracking-[0.5px] opacity-70 text-neutral-700 dark:text-neutral-300">{s.value}</span>
          </div>
          <div className="text-left text-[11px] mt-[1px] opacity-70 text-neutral-600 dark:text-neutral-400">{s.desc}</div>
        </div>
      ))}
    </div>
  </div>
);

export default OverlayShortcuts;
