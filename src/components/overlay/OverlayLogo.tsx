import { Logo } from '@pmndrs/branding';

const OverlayLogo = () => (
  <Logo style={{ position: 'absolute', bottom: 40, left: 40, width: 30 }} />
  // const mode = useModeStore((state) => state.mode);
  // const src = mode === '3d' ? '/pilot-gO-DZ75j.png' : '/growth-2exHRyUm.png';
  // return (
  //   <img
  //     src={src}
  //     alt={mode === '3d' ? '3D Logo' : 'Canvas Logo'}
  //     className="absolute left-10 bottom-10 w-[60px] h-auto select-none"
  //     draggable={false}
  //   />
  // );
);

export default OverlayLogo;
