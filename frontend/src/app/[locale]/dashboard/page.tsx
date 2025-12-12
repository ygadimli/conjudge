'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getTier } from '@/utils/rating';
import Navbar from '@/components/Navbar';

interface DashboardData {
    user: {
        username: string;
        rating: number;
        battleRating: number;
        brainType: string | null;
        name: string | null;
        country: string | null;
    };
    solvedCount: number;
    battlesCount: number;
    recentActivity: Array<{
        id: string;
        status: string;
        createdAt: string;
        problem: {
            title: string;
            difficulty: number;
        };
    }>;
    stats: Array<{
        name: string;
        count: number;
        percentage: number;
    }>;
}

export default function DashboardPage() {
    const t = useTranslations('dashboard');
    const { user, isAuthenticated, loading } = useAuth();
    const params = useParams();
    const router = useRouter();
    const locale = params.locale || 'en';

    const [data, setData] = useState<DashboardData | null>(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push(`/${locale}/login`);
        }
    }, [isAuthenticated, loading, locale, router]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/dashboard/${user.id}`);
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setFetching(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    // Cast user to any to avoid "Property 'battleRating' does not exist on type 'User'"
    // This is because the User type in AuthContext might strictly be the Prisma generated type which might likely not have 'battleRating' if the client generation is stale, OR it's just Typescript being strict about the context type definition.
    // However, our API fetches it.
    const displayUser: any = data?.user || user;
    const contestTier = getTier(displayUser.rating || 0);
    const battleTier = getTier(displayUser.battleRating || 1200);

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            {/* Main */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                {/* Welcome */}
                <div className="mb-12">
                    <h1 className="text-4xl font-black mb-2">{t('welcome')}, {user.username}!</h1>
                    <p className="text-[#E6E6E6]/60">Your coding journey continues</p>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    {/* Contest Rating */}
                    <div className={`${contestTier.bg} rounded-xl p-6 relative overflow-hidden group`}>
                        <div className="relative z-10 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-3xl">emoji_events</span>
                                <p className="text-sm font-bold opacity-80">{t('rating')}</p>
                            </div>
                            <p className="text-4xl font-black mb-1">{displayUser.rating || 0}</p>
                            <p className="text-xs uppercase font-bold opacity-70">{contestTier.name}</p>
                        </div>
                    </div>

                    {/* Battle Rating */}
                    <div className={`${battleTier.bg} rounded-xl p-6 relative overflow-hidden group`}>
                        <div className="relative z-10 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-3xl">swords</span>
                                <p className="text-sm font-bold opacity-80">{t('battleRating')}</p>
                            </div>
                            <p className="text-4xl font-black mb-1">{displayUser.battleRating || 1200}</p>
                            <p className="text-xs uppercase font-bold opacity-70">{battleTier.name}</p>
                        </div>
                    </div>

                    {/* Solved */}
                    <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-6">
                        <span className="material-symbols-outlined text-[#E80000] text-4xl mb-2">check_circle</span>
                        <p className="text-sm text-[#E6E6E6]/60 mb-1">{t('solved')}</p>
                        <p className="text-3xl font-black">{data?.solvedCount || 0}</p>
                    </div>

                    {/* BrainType */}
                    <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-6">
                        <span className="material-symbols-outlined text-[#E80000] text-4xl mb-2">psychology</span>
                        <p className="text-sm text-[#E6E6E6]/60 mb-1">{t('brainType')}</p>
                        <p className="text-lg font-black">{displayUser.brainType || 'Unknown'}</p>
                    </div>
                </div>

                {/* Recent Activity & Stats */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {/* Recent Activity */}
                    <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">{t('recentActivity')}</h2>
                            <Link href={`/${locale}/problems`} className="text-sm text-[#E80000] hover:text-[#FF1A1A]">{t('viewAll')}</Link>
                        </div>
                        <div className="space-y-4">
                            {data?.recentActivity && data.recentActivity.length > 0 ? (
                                data.recentActivity.map((sub: any) => (
                                    <div key={sub.id} className="flex items-center gap-4 p-4 bg-black/50 rounded-lg hover:bg-black/70 transition-all">
                                        <span className={`material-symbols-outlined ${sub.status === 'AC' ? 'text-green-500' : 'text-red-500'}`}>
                                            {sub.status === 'AC' ? 'check_circle' : 'cancel'}
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-medium">{sub.problem.title}</p>
                                            <p className="text-sm text-[#E6E6E6]/60">{new Date(sub.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`text-sm font-mono font-bold ${sub.status === 'AC' ? 'text-green-500' : 'text-red-500'}`}>
                                            {sub.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-[#E6E6E6]/40">
                                    <span className="material-symbols-outlined text-4xl mb-2">history</span>
                                    <p>No recent activity</p>
                                    <Link href={`/${locale}/problems`} className="text-[#E80000] text-sm mt-2 inline-block">Start Solving</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-6">
                        <h2 className="text-2xl font-bold mb-6">{t('statistics')}</h2>
                        <div className="space-y-4">
                            {data?.stats && data.stats.length > 0 ? (
                                data.stats.map((stat: any, i: number) => (
                                    <div key={i}>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm">{stat.name}</span>
                                            <span className="text-sm text-[#E80000]">{stat.percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-[#E80000] to-[#FF1A1A]" style={{ width: `${stat.percentage}%` }}></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-[#E6E6E6]/40">
                                    <span className="material-symbols-outlined text-4xl mb-2">bar_chart</span>
                                    <p>No statistics available yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Link href={`/${locale}/problems`} className="bg-gradient-to-br from-[#E80000] to-[#FF1A1A] rounded-xl p-8 text-center hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-6xl mb-4 inline-block">code</span>
                        <h3 className="text-2xl font-bold">Solve Problems</h3>
                    </Link>

                    <Link href={`/${locale}/battles`} className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8 text-center hover:border-[#E80000]/50 transition-all">
                        <span className="material-symbols-outlined text-[#E80000] text-6xl mb-4 inline-block">swords</span>
                        <h3 className="text-2xl font-bold">Join Battle</h3>
                    </Link>

                    <Link href={`/${locale}/braintype`} className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8 text-center hover:border-[#E80000]/50 transition-all">
                        <span className="material-symbols-outlined text-[#E80000] text-6xl mb-4 inline-block">psychology</span>
                        <h3 className="text-2xl font-bold">View BrainType</h3>
                    </Link>
                </div>
            </main>
        </div>
    );
}
