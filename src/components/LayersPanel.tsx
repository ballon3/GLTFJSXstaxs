import React from 'react';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
}

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onAddLayer: () => void;
  onSelectLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onToggleLayer: (id: string) => void;
  onRenameLayer?: (id: string, name: string) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  activeLayerId,
  onAddLayer,
  onSelectLayer,
  onDeleteLayer,
  onToggleLayer,
  onRenameLayer,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState('');

  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditValue(name);
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value);
  const handleEditBlur = () => {
    if (editingId && onRenameLayer) {
      onRenameLayer(editingId, editValue.trim() || 'Untitled Layer');
    }
    setEditingId(null);
    setEditValue('');
  };
  const handleEditKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleEditBlur();
    if (e.key === 'Escape') {
      setEditingId(null);
      setEditValue('');
    }
  };
  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 260,
    //   background: 'rgba(255,255,255,0.98)',
    //   borderRadius: '0 10px 10px 0',
    //   boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
      padding: 18,
      zIndex: 2000,
      fontFamily: 'Menlo, monospace',
      fontSize: 13,
      color: '#222',
      letterSpacing: 0.2,
      userSelect: 'none',
      minWidth: 260,
    }}>
      <div style={{fontWeight: 700, fontSize: 18, marginBottom: 12}}>Layers</div>
      <div style={{marginBottom: 12}}>
        <button onClick={onAddLayer} style={{padding: '4px 12px', borderRadius: 6, border: '1px solid #ccc', background: '#f7f7f7', cursor: 'pointer'}}>+ Add Layer</button>
      </div>
      <div>
        {layers.map(layer => (
          <div key={layer.id} style={{
            marginBottom: 10,
            background: layer.id === activeLayerId ? '#e6f0ff' : 'transparent',
            borderRadius: 6,
            padding: '7px 10px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 22,
            cursor: 'pointer',
            boxShadow: layer.id === activeLayerId ? '0 1px 4px rgba(30,100,255,0.07)' : 'none',
          }}>
            <input
              type="checkbox"
              checked={layer.visible}
              onChange={() => onToggleLayer(layer.id)}
              style={{ marginRight: 8, pointerEvents: 'auto' }}
            />
            {editingId === layer.id ? (
              <input
                autoFocus
                value={editValue}
                onChange={handleEditChange}
                onBlur={handleEditBlur}
                onKeyDown={handleEditKey}
                style={{
                  flex: 1,
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: 0.5,
                  padding: '2px 4px',
                  border: '1px solid #bcd',
                  borderRadius: 4,
                  background: '#f7faff',
                  color: '#1a3a7a',
                  outline: 'none',
                  minWidth: 0,
                  marginRight: 4,
                }}
              />
            ) : (
              <span
                onClick={() => onSelectLayer(layer.id)}
                onDoubleClick={() => handleEdit(layer.id, layer.name)}
                style={{
                  flex: 1,
                  fontWeight: layer.id === activeLayerId ? 700 : 400,
                  color: layer.id === activeLayerId ? '#1a3a7a' : '#444',
                  fontSize: 14,
                  letterSpacing: 0.5,
                  opacity: layer.visible ? 1 : 0.5,
                  textDecoration: layer.visible ? 'none' : 'line-through',
                  cursor: 'text',
                }}
                title="Double-click to rename"
              >
                {layer.name}
              </span>
            )}
            <button
              onClick={() => onDeleteLayer(layer.id)}
              style={{
                marginLeft: 8,
                background: 'none',
                border: 'none',
                color: '#c00',
                cursor: 'pointer',
                fontSize: 15,
                pointerEvents: 'auto',
                opacity: 0.7,
              }}
              title="Delete layer"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayersPanel;
