import React from 'react';
import { useTranslations } from 'next-intl';

interface RadarChartProps {
    stats: {
        accuracy: number;
        speed: number;
        complexity: number;
        persistence: number;
    };
    size?: number;
}

export default function RadarChart({ stats, size = 300 }: RadarChartProps) {
    const t = useTranslations('braintype');
    const center = size / 2;
    const radius = size * 0.4;
    const max = 100;

    // ...

    const points = [
        { value: stats.accuracy, angle: -90, label: t('accuracy') },
        { value: stats.speed, angle: 0, label: t('speed') },
        { value: stats.complexity, angle: 90, label: t('logic') },
        { value: stats.persistence, angle: 180, label: t('resilience') }
    ];

    const getCoordinates = (value: number, angle: number) => {
        const rad = (angle * Math.PI) / 180;
        // Normalize value to radius
        const distance = (value / max) * radius;
        return {
            x: center + distance * Math.cos(rad),
            y: center + distance * Math.sin(rad)
        };
    };

    // Generate polygon string
    const polyPoints = points.map(p => {
        const coord = getCoordinates(p.value, p.angle);
        return `${coord.x},${coord.y}`;
    }).join(' ');

    // Generate grid lines (web)
    const levels = [0.25, 0.5, 0.75, 1];

    return (
        <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="overflow-visible">
                {/* Background Web */}
                {levels.map((level, i) => {
                    const levelPoints = points.map(p => {
                        const coord = getCoordinates(100 * level, p.angle);
                        return `${coord.x},${coord.y}`;
                    }).join(' ');
                    return (
                        <polygon
                            key={i}
                            points={levelPoints}
                            fill="none"
                            stroke="#333"
                            strokeWidth="1"
                            className="opacity-50"
                        />
                    );
                })}

                {/* Axes Lines */}
                {points.map((p, i) => {
                    const start = getCoordinates(0, p.angle);
                    const end = getCoordinates(100, p.angle);
                    return (
                        <line
                            key={i}
                            x1={start.x}
                            y1={start.y}
                            x2={end.x}
                            y2={end.y}
                            stroke="#333"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data Polygon */}
                <polygon
                    points={polyPoints}
                    fill="rgba(232, 0, 0, 0.2)"
                    stroke="#E80000"
                    strokeWidth="2"
                    className="drop-shadow-[0_0_10px_rgba(232,0,0,0.5)] transition-all duration-1000 ease-out"
                />

                {/* Data Points */}
                {points.map((p, i) => {
                    const coord = getCoordinates(p.value, p.angle);
                    return (
                        <circle
                            key={i}
                            cx={coord.x}
                            cy={coord.y}
                            r="4"
                            fill="#E80000"
                            className="transition-all duration-1000 ease-out"
                        />
                    );
                })}

                {/* Labels */}
                {points.map((p, i) => {
                    // Push labels out a bit
                    const labelDist = radius + 25;
                    const rad = (p.angle * Math.PI) / 180;
                    const lx = center + labelDist * Math.cos(rad);
                    const ly = center + labelDist * Math.sin(rad);

                    return (
                        <text
                            key={i}
                            x={lx}
                            y={ly}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-gray-400 text-xs font-bold uppercase tracking-wider"
                        >
                            {p.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}
