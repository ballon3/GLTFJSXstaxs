
import React, { useEffect } from 'react';
import CanvasView from './components/CanvasView';
import ThreeDView from './components/ThreeDView';
import { useModeStore } from './store/useModeStore';


const App: React.FC = () => {
  const mode = useModeStore((state) => state.mode);
  const setMode = useModeStore((state) => state.setMode);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+X: 3D mode
      if ((e.key === 'x' || e.key === 'X') && e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setMode('3d');
      }
      // Cmd+Ctrl+S: Save
      if ((e.key === 's' || e.key === 'S') && e.metaKey && e.ctrlKey) {
        e.preventDefault();
        // TODO: Implement save logic here
        // alert('Save triggered!');
        setMode('canvas');

      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setMode]);

  return (
    <>
      {mode === '3d' ? <ThreeDView /> : <CanvasView />}
      <div
        style={{
          position: 'fixed',
          top: 10,
          right: 20,
          // background: 'rgba(255,255,255,0.85)',
          borderRadius: '6px',
          padding: '6px 16px',
          fontSize: '15px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          // boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 1000,
        }}
      >
        UI/UX: {mode.toUpperCase()}
      </div>
    </>
  );
};

export default App;

