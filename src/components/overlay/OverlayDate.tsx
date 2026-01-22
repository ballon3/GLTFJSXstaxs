const OverlayDate = () => (
  <div
    style={{
      position: 'fixed',
      top: 60,
      right: 40,
      fontSize: '15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      textAlign: 'left',
      gap: 2,
    }}
  >
    <span>Version 1.0</span>
    <span>Author: Vox</span>
    <span>{new Date().toLocaleDateString()}</span>
  </div>
);

export default OverlayDate;
