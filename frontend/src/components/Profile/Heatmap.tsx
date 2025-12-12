'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useRef } from 'react';

interface HeatmapProps {
    data: Record<string, number>; // date "YYYY-MM-DD" -> count
}

export default function Heatmap({ data }: HeatmapProps) {
    const t = useTranslations('common');
    const [dates, setDates] = useState<{ date: string; count: number }[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Generate dates for the last 365 days
        const today = new Date();
        const generatedDates: { date: string; count: number }[] = [];
        for (let i = 364; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            generatedDates.push({ date: dateStr, count: data[dateStr] || 0 });
        }
        setDates(generatedDates);
    }, [data]);

    const getColor = (count: number) => {
        if (!count) return 'bg-[#161b22]'; // Empty
        if (count >= 5) return 'bg-[#39d353] shadow-[0_0_8px_#39d353]'; // High (Neon)
        if (count >= 3) return 'bg-[#26a641]';  // Medium
        if (count >= 1) return 'bg-[#006d32]';  // Low (but visible)
        return 'bg-[#0e4429]';                  // Very Low (fallback)
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (dates.length === 0) return <div>Loading...</div>;

    return (
        <div className="w-full relative group">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#E80000]">calendar_month</span>
                    Activity Log
                </h3>
                <div className="flex gap-2">
                    <button onClick={() => scroll('left')} className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button onClick={() => scroll('right')} className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* Simplified rendering: Blocks of weeks */}
                {Array.from({ length: 52 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                            const dateIndex = weekIndex * 7 + dayIndex;
                            if (dateIndex >= dates.length) return null;
                            const item = dates[dateIndex];

                            return (
                                <div
                                    key={dayIndex}
                                    className={`w-3 h-3 rounded-sm ${getColor(item.count)} transition-all relative group/cell cursor-pointer`}
                                    title={`${item.count} submissions on ${item.date}`}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black border border-white/20 rounded text-xs whitespace-nowrap hidden group-hover/cell:block z-10 pointer-events-none">
                                        {item.count} submissions on {item.date}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-[#161b22]"></div>
                <div className="w-3 h-3 rounded-sm bg-[#0e4429]"></div>
                <div className="w-3 h-3 rounded-sm bg-[#006d32]"></div>
                <div className="w-3 h-3 rounded-sm bg-[#26a641]"></div>
                <div className="w-3 h-3 rounded-sm bg-[#39d353]"></div>
                <span>More</span>
            </div>
        </div>
    );
}
