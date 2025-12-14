
'use client';

import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Contest {
    id: string;
    title: string;
    description: string;
    startTime: string;
    duration: number; // minutes
    status: string;
}

export default function ContestsPage() {
    const t = useTranslations('contests'); // Custom namespace
    const params = useParams();
    const router = useRouter();
    const locale = (params.locale as string) || 'en';

    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/contests`);
            if (res.ok) {
                const data = await res.json();
                setContests(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const now = new Date();

    const upcomingContests = contests.filter(c => new Date(c.startTime) > now || c.status === 'RUNNING');
    const pastContests = contests.filter(c => new Date(c.startTime) <= now && c.status !== 'RUNNING');

    const displayedContests = activeTab === 'UPCOMING' ? upcomingContests : pastContests;

    const formatTime = (iso: string) => {
        return new Date(iso).toLocaleString(locale);
    };

    const getDuration = (mins: number) => {
        const hrs = Math.floor(mins / 60);
        const m = mins % 60;
        return `${hrs}h ${m}m`;
    };

    const handleAction = (contest: Contest) => {
        // If past, maybe link to standings. If active, link to contest arena.
        if (activeTab === 'PAST') {
            // router.push(`/${locale}/contests/${contest.id}/standings`); // Future feature
        } else {
            // router.push(`/${locale}/contests/${contest.id}`); // Future feature
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-black text-glow">{t('title')}</h1>
                    {/* Tabs */}
                    <div className="flex bg-[#0D0D0D] border border-white/10 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('UPCOMING')}
                            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'UPCOMING' ? 'bg-[#E80000] text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {t('upcoming')}
                        </button>
                        <button
                            onClick={() => setActiveTab('PAST')}
                            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'PAST' ? 'bg-[#E80000] text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {t('past')}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading...</div>
                ) : displayedContests.length === 0 ? (
                    <div className="text-center py-20 bg-[#0D0D0D] border border-white/10 rounded-xl">
                        <p className="text-xl font-bold mb-2">No contests found</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {displayedContests.map(contest => (
                            <div key={contest.id} className="bg-[#0D0D0D] border border-white/10 rounded-xl p-6 hover:border-[#E80000]/50 transition-all group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-2xl font-bold group-hover:text-[#E80000] transition-colors">
                                                {contest.title}
                                            </h3>
                                            {contest.status === 'RUNNING' && (
                                                <span className="bg-green-500/10 text-green-500 text-xs px-2 py-0.5 rounded border border-green-500/20">
                                                    {t('running').toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-6 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-base">calendar_today</span>
                                                {formatTime(contest.startTime)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-base">schedule</span>
                                                {getDuration(contest.duration)}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleAction(contest)} className="px-8 py-3 rounded-lg gradient-button font-bold text-white shadow-lg shadow-red-900/20">
                                        {activeTab === 'UPCOMING' ? t('enter') : t('viewStandings')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
