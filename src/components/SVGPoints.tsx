import React from 'react';

type SVGPointsProps = {
  points: { x: number; y: number }[];
  color: string;
  pointMode: boolean;
};

const SVGPoints: React.FC<SVGPointsProps> = ({ points, color, pointMode }) => {
  if (!pointMode) return null;
  return (
    <g>
      {points.map((pt, i) => (
        <circle
          key={`pt-${i}`}
          cx={pt.x}
          cy={pt.y}
          r={4}
          fill={color}
          opacity={0.7}
        />
      ))}
    </g>
  );
};

export default SVGPoints;
