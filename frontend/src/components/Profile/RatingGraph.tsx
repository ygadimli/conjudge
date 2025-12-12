'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { RATING_TIERS } from '@/utils/rating';

interface RatingGraphProps {
    data: { date: string; rating: number; contest: string }[];
}

export default function RatingGraph({ data }: RatingGraphProps) {
    // Transform data for recharts if needed, generally it accepts array of objects

    // Define background areas for tiers
    // Define background areas for tiers

    return (
        <div className="h-[400px] w-full bg-[#0D0D0D] border border-white/10 rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#666"
                        tick={{ fill: '#666', fontSize: 12 }}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#666"
                        tick={{ fill: '#666', fontSize: 12 }}
                        tickLine={false}
                        domain={[0, 'dataMax + 200']}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />

                    {RATING_TIERS.map((tier) => (
                        <ReferenceArea
                            key={tier.name}
                            y1={tier.min}
                            y2={tier.max}
                            fill={tier.color}
                            fillOpacity={0.1}
                            stroke="none"
                        />
                    ))}

                    <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#E80000"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#E80000', stroke: '#fff', strokeWidth: 1 }}
                        activeDot={{ r: 6, fill: '#fff' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
