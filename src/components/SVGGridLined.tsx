import React from 'react';

interface SVGGridLinedProps {
  width: number;
  height: number;
  darkMode?: boolean;
}

const SVGGridLined: React.FC<SVGGridLinedProps> = ({ width, height, darkMode = false }) => {
  // Add buffer so grid always fills instantly when zooming out
  const buffer = 2;
  const cols = Math.ceil(width / 20) + buffer;
  const rows = Math.ceil(height / 20) + buffer;
  return (
    <g>
      {/* Vertical lines */}
      {Array.from({ length: cols }).map((_, x) => (
        <line
          key={`vline-${x}`}
          x1={x * 20 + 10}
          y1={0}
          x2={x * 20 + 10}
          y2={height}
          stroke={darkMode ? 'var(--grid)' : '#bbb'}
          strokeWidth={1}
          opacity={darkMode ? 0.4 : 0.5}
        />
      ))}
      {/* Horizontal lines */}
      {Array.from({ length: rows }).map((_, y) => (
        <line
          key={`hline-${y}`}
          x1={0}
          y1={y * 20 + 10}
          x2={width}
          y2={y * 20 + 10}
          stroke={darkMode ? 'var(--grid)' : '#bbb'}
          strokeWidth={1}
          opacity={darkMode ? 0.4 : 0.5}
        />
      ))}
    </g>
  );
};

export default SVGGridLined;
