'use client';

import { useTranslations } from 'next-intl';

interface RatingChange {
    contest: string;
    oldRating: number;
    newRating: number;
    rank: number;
    date: string;
}

interface RatingHistoryTableProps {
    history: RatingChange[];
}

export default function RatingHistoryTable({ history }: RatingHistoryTableProps) {
    const t = useTranslations('common');

    return (
        <div className="bg-[#0D0D0D] border border-white/10 rounded-xl overflow-hidden mt-8">
            <h3 className="font-bold p-6 pb-2 text-xl">Rating History</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 font-bold text-sm text-[#E6E6E6]">Contest</th>
                            <th className="px-6 py-4 font-bold text-sm text-[#E6E6E6]">Date</th>
                            <th className="px-6 py-4 font-bold text-sm text-[#E6E6E6]">Rank</th>
                            <th className="px-6 py-4 font-bold text-sm text-[#E6E6E6] text-right">Δ change</th>
                            <th className="px-6 py-4 font-bold text-sm text-[#E6E6E6] text-right">New Rating</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {history.map((entry, i) => {
                            const change = entry.newRating - entry.oldRating;
                            const isPositive = change >= 0;

                            return (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium">{entry.contest}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{entry.date}</td>
                                    <td className="px-6 py-4 text-sm">{entry.rank}</td>
                                    <td className={`px-6 py-4 text-right font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                        {isPositive ? '+' : ''}{change}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold">{entry.newRating}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {history.length === 0 && (
                <div className="text-center py-8 text-gray-500">No rating history available.</div>
            )}
        </div>
    );
}
