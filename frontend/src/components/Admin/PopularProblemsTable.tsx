import React from 'react';

interface PopularProps {
    data: {
        id: string;
        title: string;
        difficulty: string;
        submissions: number;
    }[];
}

export default function PopularProblemsTable({ data }: PopularProps) {
    return (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500">star</span>
                Popular Problems
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs text-gray-500 border-b border-white/10">
                            <th className="pb-2">Title</th>
                            <th className="pb-2">Diff</th>
                            <th className="pb-2 text-right">Subs</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {data.map((p, i) => (
                            <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                                <td className="py-3 font-medium truncate max-w-[120px]">{i + 1}. {p.title}</td>
                                <td className="py-3">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${p.difficulty === 'Hard' ? 'border-red-500 text-red-500' :
                                            p.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-500' :
                                                'border-green-500 text-green-500'
                                        }`}>
                                        {p.difficulty}
                                    </span>
                                </td>
                                <td className="py-3 text-right font-mono">{p.submissions}</td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr><td colSpan={3} className="py-4 text-center text-gray-500">No data</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
