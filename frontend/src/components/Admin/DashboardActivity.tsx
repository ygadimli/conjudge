'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface ActivityProps {
    data: { date: string; submissions: number; users: number }[];
}

export default function DashboardActivity({ data }: ActivityProps) {
    return (
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Submissions Chart */}
            <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-500">trending_up</span>
                    Submission Activity (Last 30 Days)
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 12 }} tickFormatter={(val) => val.slice(5)} />
                            <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="submissions" stroke="#8884d8" fillOpacity={1} fill="url(#colorSub)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* User Growth Chart */}
            <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">group_add</span>
                    New Users (Last 30 Days)
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 12 }} tickFormatter={(val) => val.slice(5)} />
                            <YAxis stroke="#666" tick={{ fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
