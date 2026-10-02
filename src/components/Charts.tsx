/**
 * BFS – Bank Fraud Shield
 * Comprehensive SVG Charts for Customer & Admin Analytics
 */

import React, { useState } from 'react';

// ==========================================
// 1. ML RISK GAUGE
// ==========================================
interface MLGaugeProps {
  score: number; // 0 to 100
  size?: number;
  label?: string;
}

export const MLGauge: React.FC<MLGaugeProps> = ({ score, size = 140, label = 'ML Risk Score' }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#10b981'; // emerald
  let textColor = 'text-emerald-700';
  let riskText = 'Low Risk';

  if (score >= 70) {
    strokeColor = '#e11d48'; // rose
    textColor = 'text-rose-700';
    riskText = 'High Risk';
  } else if (score >= 35) {
    strokeColor = '#f59e0b'; // amber
    textColor = 'text-amber-700';
    riskText = 'Medium Risk';
  }

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-extrabold ${textColor}`}>{score}%</span>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{riskText}</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-semibold text-slate-700 text-center">{label}</span>
      <span className="text-[10px] text-slate-500 text-center">Logistic Regression</span>
    </div>
  );
};

// ==========================================
// 2. SPARKLINE
// ==========================================
export const ActivitySparkline: React.FC<{ data: number[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const height = 48;
  const width = 160;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 10) - 5;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="w-full">
      <svg className="w-full h-12 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon
          fill="url(#sparkGradient)"
          points={`0,${height} ${points} ${width},${height}`}
        />
        <polyline
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
};

// ==========================================
// 3. BAR VOLUME CHART
// ==========================================
export const BarVolumeChart: React.FC<{ labels: string[]; values: number[] }> = ({ labels, values }) => {
  const max = Math.max(...values, 1000);

  return (
    <div className="space-y-3 pt-2">
      {labels.map((label, idx) => {
        const val = values[idx] || 0;
        const pct = Math.min(100, Math.round((val / max) * 100));

        return (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">{label}</span>
              <span className="font-semibold text-slate-900">₹{val.toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-700"
                style={{ width: `${Math.max(4, pct)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// 4. SPENDING / TRANSACTION TREND AREA CHART
// ==========================================
interface TrendDataPoint {
  label: string;
  value: number;
  subValue?: number;
}

export const SpendingTrendChart: React.FC<{
  data: TrendDataPoint[];
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  subLabel?: string;
}> = ({
  data,
  title = 'Transaction Outflow Trend',
  subtitle = 'Expenditure pattern over recent transactions',
  primaryLabel = 'Amount (₹)'
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400">
        No transaction trend data available yet.
      </div>
    );
  }

  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const maxVal = Math.max(...data.map(d => d.value), 10000);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const getCoordinates = (index: number, val: number) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * (width - 2 * paddingX);
    const y = height - paddingY - (val / range) * (height - 2 * paddingY);
    return { x, y };
  };

  const points = data.map((d, i) => {
    const { x, y } = getCoordinates(i, d.value);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${paddingX},${height - paddingY} ${points} ${width - paddingX},${height - paddingY}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            {primaryLabel}
          </span>
        </div>
      </div>

      <div className="relative w-full pt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = height - paddingY - pct * (height - 2 * paddingY);
            const valLabel = Math.round(minVal + pct * range);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  fontSize="9"
                  fill="#94a3b8"
                  textAnchor="end"
                >
                  ₹{(valLabel / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* Area under curve */}
          <polygon
            fill="url(#areaGradient)"
            points={areaPoints}
          />

          {/* Smooth Polyline */}
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Data Points */}
          {data.map((d, i) => {
            const { x, y } = getCoordinates(i, d.value);
            const isHovered = hoverIndex === i;

            return (
              <g key={i} className="cursor-pointer">
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-200"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
                {/* X Axis Label */}
                <text
                  x={x}
                  y={height - 6}
                  fontSize="9"
                  fill="#64748b"
                  textAnchor="middle"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoverIndex !== null && data[hoverIndex] && (
          <div className="absolute top-2 right-4 bg-slate-900 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-lg pointer-events-none flex items-center gap-2">
            <span className="font-semibold text-blue-300">{data[hoverIndex].label}:</span>
            <span className="font-bold text-white">₹{data[hoverIndex].value.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 5. DONUT DISTRIBUTION CHART
// ==========================================
interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export const DonutDistributionChart: React.FC<{
  data: DonutSegment[];
  title: string;
  subtitle?: string;
  centerNumber?: string | number;
  centerText?: string;
}> = ({
  data,
  title,
  subtitle,
  centerNumber,
  centerText
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = 40;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div>
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-1">
        {/* SVG Donut */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {data.map((seg, idx) => {
              const percent = (seg.value / total);
              const strokeDasharray = `${percent * circumference} ${circumference}`;
              const strokeDashoffset = -(accumulatedPercent * circumference);
              accumulatedPercent += percent;

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              );
            })}
          </svg>

          {/* Central label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-black text-slate-900 leading-tight">
              {centerNumber !== undefined ? centerNumber : total}
            </span>
            <span className="text-[9px] font-semibold uppercase text-slate-500">
              {centerText || 'Total'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 flex-1 w-full text-xs">
          {data.map((seg, idx) => {
            const pct = Math.round((seg.value / total) * 100);
            return (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }}></span>
                  <span className="font-medium text-slate-700">{seg.label}</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <span className="text-slate-900">{seg.value}</span>
                  <span className="text-[10px] text-slate-600 w-8 text-right font-medium">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. INFLOW VS OUTFLOW DUAL BAR CHART
// ==========================================
interface InflowOutflowItem {
  period: string;
  inflow: number;
  outflow: number;
}

export const InflowOutflowChart: React.FC<{
  data: InflowOutflowItem[];
  title?: string;
  subtitle?: string;
}> = ({
  data,
  title = 'Monthly Inflow vs Outflow',
  subtitle = 'Credits received vs debits transferred'
}) => {
  const maxVal = Math.max(
    ...data.map(d => Math.max(d.inflow, d.outflow)),
    50000
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            Inflow
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-rose-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
            Outflow
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2 items-end h-40">
        {data.map((item, idx) => {
          const inPct = Math.round((item.inflow / maxVal) * 100);
          const outPct = Math.round((item.outflow / maxVal) * 100);

          return (
            <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
              <div className="w-full flex items-end justify-center gap-1 h-28">
                {/* Inflow bar */}
                <div
                  title={`Inflow: ₹${item.inflow.toLocaleString('en-IN')}`}
                  className="w-3.5 bg-emerald-500 rounded-t transition-all duration-500 group-hover:bg-emerald-600"
                  style={{ height: `${Math.max(6, inPct)}%` }}
                />
                {/* Outflow bar */}
                <div
                  title={`Outflow: ₹${item.outflow.toLocaleString('en-IN')}`}
                  className="w-3.5 bg-rose-500 rounded-t transition-all duration-500 group-hover:bg-rose-600"
                  style={{ height: `${Math.max(6, outPct)}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-slate-500 text-center truncate max-w-full">
                {item.period}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
