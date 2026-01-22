import React from 'react';

type Path = { d: string; color: string; layerId: string };

type SVGPathsProps = {
  paths: Path[];
  layers: { id: string; visible: boolean }[];
  selectMode: boolean;
  selectedPathIndex: number | null;
  handlePathPointerDown: (e: React.PointerEvent<SVGPathElement>, i: number) => void;
};

const SVGPaths: React.FC<SVGPathsProps> = ({ paths, layers, selectMode, selectedPathIndex, handlePathPointerDown }) => {
  const visiblePaths = paths.filter(p => {
    const layer = layers.find(l => l.id === p.layerId);
    return layer && layer.visible;
  });
  return (
    <g>
      {visiblePaths.map((p, i) => {
        const isSelected = selectMode && visiblePaths[selectedPathIndex ?? -1]?.d === p.d;
        return (
          <path
            key={i}
            d={p.d}
            stroke={p.color}
            strokeWidth={isSelected ? 4 : 2.5}
            fill="none"
            opacity={isSelected ? 1 : 0.95}
            style={{ cursor: selectMode ? 'move' : 'pointer', filter: isSelected ? 'drop-shadow(0 0 4px #1a3a7a)' : undefined }}
            onPointerDown={e => handlePathPointerDown(e, i)}
          />
        );
      })}
    </g>
  );
};

export default SVGPaths;
