import OverlayLogo from './OverlayLogo';
import OverlayLink from './OverlayLink';
import OverlayInfo from './OverlayInfo';
import OverlayShortcuts from './OverlayShortcuts';
import OverlayDate from './OverlayDate';
import OverlayColorWheel from './OverlayColorWheel';
import { useModeStore } from '../../store/useModeStore';


const Overlay = () => {
  const mode = useModeStore((state) => state.mode);
  return (
    <div className="absolute inset-0 pointer-events-none">
      <OverlayLogo />
      <OverlayLink />
      {mode === '3d' && <OverlayInfo />}
      <OverlayShortcuts />
      <OverlayDate />
      {mode === 'canvas' && <OverlayColorWheel color="#222" setColor={() => {}} />}
    </div>
  );
};

export default Overlay;
