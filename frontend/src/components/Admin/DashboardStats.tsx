import React from 'react';

interface StatsProps {
    stats: {
        users: number;
        problems: number;
        submissions: number;
        contests: number;
    } | null;
}

export default function DashboardStats({ stats }: StatsProps) {
    if (!stats) return <div className="text-gray-500">Loading stats...</div>;

    const cards = [
        { label: 'Total Users', value: stats.users, icon: 'group', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Total Problems', value: stats.problems, icon: 'code', color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Submissions', value: stats.submissions, icon: 'send', color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Contests', value: stats.contests, icon: 'emoji_events', color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, idx) => (
                <div key={idx} className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${card.bg}`}>
                        <span className={`material-symbols-outlined ${card.color}`}>{card.icon}</span>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">{card.label}</p>
                        <p className="text-2xl font-bold">{card.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
