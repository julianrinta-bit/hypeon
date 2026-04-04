'use client';

import { useState } from 'react';
import styles from './Sparkline.module.css';

export type SparklinePoint = {
  date:  string;
  value: number;
};

type SparklineProps = {
  data:   SparklinePoint[];
  width?: number;
  height?: number;
  color?: string;
};

export default function Sparkline({
  data,
  width  = 80,
  height = 24,
  color  = '#34D399',
}: SparklineProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: SparklinePoint } | null>(null);

  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} className={styles.sparkline} aria-hidden="true">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 3" />
      </svg>
    );
  }

  const padding = 2;
  const min = Math.min(...data.map(d => d.value));
  const max = Math.max(...data.map(d => d.value));
  const range = max - min || 1;

  const toX = (i: number) =>
    padding + (i / (data.length - 1)) * (width - padding * 2);

  const toY = (v: number) =>
    height - padding - ((v - min) / range) * (height - padding * 2);

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.value), ...d }));

  // Build smooth SVG path
  let pathD = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX  = (prev.x + curr.x) / 2;
    pathD += ` C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
  }

  // Fill path (close to bottom)
  const fillD =
    pathD +
    ` L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <span className={styles.wrap}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={styles.sparkline}
        aria-label="CTR trend sparkline"
        role="img"
        style={{ display: 'block' }}
      >
        {/* Gradient fill */}
        <defs>
          <linearGradient id={`spark-fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Fill */}
        <path
          d={fillD}
          fill={`url(#spark-fill-${color.replace('#', '')})`}
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover hit areas */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="6"
            fill="transparent"
            onMouseEnter={e => {
              const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement)
                .getBoundingClientRect();
              setTooltip({
                x: rect.left + p.x,
                y: rect.top + p.y,
                point: data[i],
              });
            }}
            onMouseLeave={() => setTooltip(null)}
            style={{ cursor: 'default' }}
          />
        ))}

        {/* Last dot */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="2.5"
          fill={color}
        />
      </svg>

      {tooltip && (
        <span
          className={styles.tooltip}
          style={{
            position: 'fixed',
            left: tooltip.x + 10,
            top:  tooltip.y - 28,
          }}
          aria-live="polite"
        >
          <span className={styles.tooltipDate}>{formatDate(tooltip.point.date)}</span>
          <span className={styles.tooltipValue}>{tooltip.point.value.toFixed(2)}%</span>
        </span>
      )}
    </span>
  );
}
