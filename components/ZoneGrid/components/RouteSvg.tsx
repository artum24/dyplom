import { useId, useMemo } from 'react';

export const RouteSvg = ({ poly }: { poly: { x: number; y: number }[] }) => {
  const gradId = useId();

  const p0 = poly[0] ?? { x: 0, y: 0 };
  const p1 = poly[poly.length - 1] ?? p0;

  const pathLen = 100;
  const pointsAttr = useMemo(
    () => poly.map(p => `${p.x},${p.y}`).join(' '),
    [poly],
  );

  return (
    <svg className="pointer-events-none absolute inset-0" width="100%" height="100%">
      {poly.length >= 2 && (
        <g>
          <defs>
            <linearGradient
              id={gradId}
              gradientUnits="userSpaceOnUse"
              x1={p0.x} y1={p0.y}
              x2={p1.x} y2={p1.y}
            >
              <stop offset="0%" stopColor="#4facfe" />
              <stop offset="100%" stopColor="#4facfe" />
            </linearGradient>
          </defs>

          <polyline
            points={pointsAttr}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="12 8"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to={-pathLen}
              dur="4s"
              repeatCount="indefinite"
            />
          </polyline>

          <circle cx={p0.x} cy={p0.y} r={5} fill="#4facfe" />
          <circle cx={p1.x} cy={p1.y} r={6} fill="#00f2fe" />
        </g>
      )}
    </svg>
  );
};
