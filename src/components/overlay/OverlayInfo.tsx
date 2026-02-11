const OverlayInfo = () => (
  <div className="absolute top-10 right-10 text-[13px] font-[Meslo] leading-[1.6em] whitespace-pre text-[var(--stroke)]">
    &gt; gltfjsx 3d web interface
    <br />
    &gt; todo: drag &amp; drop model upload
    <br />
    &gt; auto transform &amp; set world units
    <br />
    {'-rw-r--r-- 1 ph  94M model.glb'}
    <br />
    {'-rw-r--r-- 1 ph 406K model-transformed.glb'}
  </div>
);

export default OverlayInfo;
