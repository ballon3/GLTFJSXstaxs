const OverlayDate = () => (
  <div className="fixed top-[60px] right-10 text-[15px] flex flex-col items-start text-left gap-[2px] text-[var(--stroke)]">
    <span>Version 1.0</span>
    <span>Author: Vox</span>
    <span>{new Date().toLocaleDateString()}</span>
  </div>
);

export default OverlayDate;
