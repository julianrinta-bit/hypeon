'use client';

/**
 * RadarChart — hexagonal 6-axis radar chart for channel health scores.
 * Pure SVG, receives scores as props, matches the approved mockup exactly.
 */

interface RadarChartProps {
  /** Scores 0–100 for each axis */
  scores?: {
    content:    number;
    titles:     number;
    thumbnails: number;
    engagement: number;
    growth:     number;
    outliers:   number;
  };
  size?: number;
}

const DEFAULT_SCORES = {
  content:    78,
  titles:     45,
  thumbnails: 62,
  engagement: 85,
  growth:     51,
  outliers:   70,
};

/** Return color by score tier */
function scoreColor(score: number): string {
  if (score >= 90) return '#c8ff2e'; // S
  if (score >= 70) return '#34D399'; // A
  if (score >= 50) return '#FBBF24'; // B
  if (score >= 30) return '#FB923C'; // C
  return '#F87171';                  // D
}

/**
 * Map a 0–100 score to a point on a hex axis.
 * The hexagon has 6 vertices; axes point from center (130,130) to each vertex.
 * Center is (130,130), outer ring = 100%.
 *
 * Vertex coords (outer, 100%):
 *   top        (130, 41)
 *   top-right  (202, 83)
 *   bot-right  (202, 173)
 *   bottom     (130, 215)
 *   bot-left   (58, 173)
 *   top-left   (58, 83)
 */
function axisPoint(score: number, axis: number): [number, number] {
  const cx = 130;
  const cy = 130;
  // Vertex positions for 100%
  const vertices: [number, number][] = [
    [130, 41],   // 0: top       (content)
    [202, 83],   // 1: top-right (titles)
    [202, 173],  // 2: bot-right (thumbnails)
    [130, 215],  // 3: bottom    (engagement)
    [58,  173],  // 4: bot-left  (growth)
    [58,  83],   // 5: top-left  (outliers)
  ];
  const [vx, vy] = vertices[axis];
  const t = score / 100;
  return [
    cx + (vx - cx) * t,
    cy + (vy - cy) * t,
  ];
}

export default function RadarChart({ scores = DEFAULT_SCORES, size = 260 }: RadarChartProps) {
  const s = scores;

  const points: [number, number][] = [
    axisPoint(s.content,    0),
    axisPoint(s.titles,     1),
    axisPoint(s.thumbnails, 2),
    axisPoint(s.engagement, 3),
    axisPoint(s.growth,     4),
    axisPoint(s.outliers,   5),
  ];

  const polyPoints = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 260 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="radarGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      {/* Reference hexagons: 33% */}
      <polygon
        points="130,87 168.1,108.5 168.1,151.5 130,173 91.9,151.5 91.9,108.5"
        stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none"
      />
      {/* Reference hexagons: 66% */}
      <polygon
        points="130,64 176.2,91 176.2,169 130,196 83.8,169 83.8,91"
        stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none"
      />
      {/* Reference hexagons: 100% */}
      <polygon
        points="130,41 202,83 202,173 130,215 58,173 58,83"
        stroke="rgba(255,255,255,0.10)" strokeWidth="1" fill="none"
      />

      {/* Axis lines */}
      <line x1="130" y1="130" x2="130" y2="41"  stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <line x1="130" y1="130" x2="202" y2="83"  stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <line x1="130" y1="130" x2="202" y2="173" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <line x1="130" y1="130" x2="130" y2="215" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <line x1="130" y1="130" x2="58"  y2="173" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <line x1="130" y1="130" x2="58"  y2="83"  stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>

      {/* Filled polygon — data scores */}
      <polygon
        points={polyPoints}
        fill="rgba(200,255,46,0.12)"
        stroke="#c8ff2e"
        strokeWidth="1.5"
        filter="url(#radarGlow)"
        className="radarPolygonStroke"
        style={{
          strokeDasharray: 600,
          animation: 'drawRadar 2s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both',
        }}
      />

      {/* Score vertex dots — colored by range */}
      {points.map(([x, y], i) => {
        const scoreValues = [s.content, s.titles, s.thumbnails, s.engagement, s.growth, s.outliers];
        return (
          <circle
            key={i}
            cx={x.toFixed(1)}
            cy={y.toFixed(1)}
            r="4.5"
            fill={scoreColor(scoreValues[i])}
            stroke="var(--az-bg, #0A0A0C)"
            strokeWidth="2"
          />
        );
      })}

      {/* Axis labels */}
      <text x="130" y="33"  textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="9.5" fill="#9CA3AF" letterSpacing="0.06em" fontWeight="600">CONTENT</text>
      <text x="216" y="81"  textAnchor="start"  fontFamily="'IBM Plex Mono', monospace" fontSize="9.5" fill="#9CA3AF" letterSpacing="0.06em" fontWeight="600">TITLES</text>
      <text x="216" y="180" textAnchor="start"  fontFamily="'IBM Plex Mono', monospace" fontSize="9.5" fill="#9CA3AF" letterSpacing="0.06em" fontWeight="600">THUMBS</text>
      <text x="130" y="231" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="9.5" fill="#9CA3AF" letterSpacing="0.06em" fontWeight="600">ENGAGE</text>
      <text x="44"  y="180" textAnchor="end"    fontFamily="'IBM Plex Mono', monospace" fontSize="9.5" fill="#9CA3AF" letterSpacing="0.06em" fontWeight="600">GROWTH</text>
      <text x="44"  y="81"  textAnchor="end"    fontFamily="'IBM Plex Mono', monospace" fontSize="9.5" fill="#9CA3AF" letterSpacing="0.06em" fontWeight="600">OUTLIERS</text>
    </svg>
  );
}
