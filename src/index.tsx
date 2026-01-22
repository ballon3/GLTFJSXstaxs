import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';

import Overlay from './components/overlay/Overlay';

createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <Overlay />
  </>
);
