import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';

import Overlay from './components/overlay/Overlay';

// Preload theme to avoid flash
try {
  const saved = localStorage.getItem('darkMode');
  const isDark = saved ? JSON.parse(saved) : false;
  if (isDark) document.documentElement.classList.add('dark');
} catch {}

createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <Overlay />
  </>
);
