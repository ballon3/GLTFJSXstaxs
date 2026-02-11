import React from 'react';

interface SVGGridProps {
  width: number;
  height: number;
  zoom?: number;
  darkMode?: boolean;
}

const SVGGrid: React.FC<SVGGridProps> = ({ width, height, zoom = 1, darkMode = false }) => {
  // Add buffer so grid always fills instantly when zooming out
  const buffer = 2;
  const spacing = 20 * zoom;
  const dotRadius = 1.2 * zoom;
  const cols = Math.ceil(width / spacing) + buffer;
  const rows = Math.ceil(height / spacing) + buffer;
  return (
    <g>
      {Array.from({ length: cols }).map((_, x) =>
        Array.from({ length: rows }).map((_, y) => (
          <circle
            key={`dot-${x}-${y}`}
            cx={x * spacing + 10 * zoom}
            cy={y * spacing + 10 * zoom}
            r={dotRadius}
            fill={darkMode ? 'var(--grid)' : '#bbb'}
            opacity={darkMode ? 0.55 : 0.7}
          />
        ))
      )}
    </g>
  );
};

export default SVGGrid;
