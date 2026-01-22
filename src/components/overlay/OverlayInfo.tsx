const OverlayInfo = () => (
  <div style={{ position: 'absolute', top: 40, right: 40, fontSize: '13px', fontFamily: 'Meslo', lineHeight: '1.6em', whiteSpace: 'pre' }}>
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
