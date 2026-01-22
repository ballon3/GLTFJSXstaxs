import React from 'react';

type TextEl = { x: number; y: number; value: string; color: string; layerId: string };

type SVGTextElementsProps = {
  textElements: TextEl[];
  layers: { id: string; visible: boolean }[];
  selectMode: boolean;
  selectedTextIndex: number | null;
  handleTextPointerDown: (e: React.PointerEvent<SVGTextElement>, i: number) => void;
};

const SVGTextElements: React.FC<SVGTextElementsProps> = ({ textElements, layers, selectMode, selectedTextIndex, handleTextPointerDown }) => {
  const visibleTexts = textElements.filter(t => {
    const layer = layers.find(l => l.id === t.layerId);
    return layer && layer.visible;
  });
  return (
    <g>
      {visibleTexts.map((t, i) => {
        const isSelected = selectMode && visibleTexts[selectedTextIndex ?? -1]?.x === t.x && visibleTexts[selectedTextIndex ?? -1]?.y === t.y;
        return (
          <text
            key={`text-${i}`}
            x={t.x}
            y={t.y}
            fill={t.color}
            fontSize={20}
            fontFamily="inherit, sans-serif"
            style={{
              userSelect: 'none',
              cursor: selectMode ? 'move' : 'text',
              filter: isSelected ? 'drop-shadow(0 0 4px #1a3a7a)' : undefined,
              pointerEvents: selectMode ? 'auto' : 'none',
            }}
            onPointerDown={e => handleTextPointerDown(e, i)}
          >
            {t.value}
          </text>
        );
      })}
    </g>
  );
};

export default SVGTextElements;
