
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Battle {
    id: string;
    type: string;
    status: string;
    minRating?: number;
    maxRating?: number;
    participants: any[];
    createdBy: { username: string };
    createdAt: string;
}

export default function BattlesPage() {
    const t = useTranslations('battles');
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'en';

    // State
    const [joinCode, setJoinCode] = useState('');
    const [activeTab, setActiveTab] = useState<'create' | 'join' | 'lobbies'>('join');
    const [lobbies, setLobbies] = useState<Battle[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        minRating: '',
        maxRating: '',
        country: ''
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Fetch lobbies on mount or filter change
    useEffect(() => {
        fetchLobbies();
    }, [filters]);

    const fetchLobbies = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (filters.minRating) query.append('minRating', filters.minRating);
            if (filters.maxRating) query.append('maxRating', filters.maxRating);
            if (filters.country) query.append('country', filters.country);

            const res = await fetch(`${API_URL}/api/battles/public?${query.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setLobbies(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinWithCode = async () => {
        if (!user) return router.push(`/${locale}/login`);
        if (!joinCode) return;

        try {
            const res = await fetch(`${API_URL}/api/battles/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ joinCode, userId: user.id })
            });

            const data = await res.json();
            if (res.ok) {
                router.push(`/${locale}/battles/${data.battleId}`);
            } else {
                alert(data.error || t('joinFailed'));
            }
        } catch (error) {
            alert(t('joinError'));
        }
    };

    const handleQuickMatch = async () => {
        if (!user) return router.push(`/${locale}/login`);

        try {
            const res = await fetch(`${API_URL}/api/battles/quick-match`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ userId: user.id })
            });

            const data = await res.json();
            if (res.ok) {
                router.push(`/${locale}/battles/${data.battleId}`);
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert(t('quickMatchError'));
        }
    };

    const handleCreateBattle = async (e: React.FormEvent) => {
        e.preventDefault();
        // In real implementation, use a Modal. Here we hardcode a simplistic flow.
        if (!user) return router.push(`/${locale}/login`);

        try {
            const res = await fetch(`${API_URL}/api/battles/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    type: '1v1',
                    isPrivate: true,
                    userId: user.id
                })
            });

            const data = await res.json();
            if (res.ok) {
                router.push(`/${locale}/battles/${data.id}`);
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert(t('createError'));
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E80000]/10 mb-6 animate-pulse">
                        <span className="material-symbols-outlined text-[#E80000] text-5xl">swords</span>
                    </div>
                    <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent uppercase">
                        {t('heroTitle')}
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        {t('heroDesc')}
                    </p>
                </div>

                {/* Main Actions */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
                    {/* Quick Match */}
                    <button
                        onClick={handleQuickMatch}
                        className="group relative overflow-hidden bg-gradient-to-br from-[#E80000] to-[#CC0000] rounded-2xl p-8 text-left transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(232,0,0,0.3)]"
                    >
                        <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-9xl -mr-4 -mt-4">bolt</span>
                        </div>
                        <span className="material-symbols-outlined text-4xl mb-4 text-white">bolt</span>
                        <h2 className="text-3xl font-black mb-2 uppercase">{t('quickMatch')}</h2>
                        <p className="text-white/80">{t('quickMatchDesc')}</p>
                    </button>

                    {/* Create Private Battle */}
                    <button
                        onClick={handleCreateBattle}
                        className="group relative overflow-hidden bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 text-left transition-all hover:scale-[1.02] hover:border-[#E80000]/50"
                    >
                        <div className="absolute right-0 top-0 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-symbols-outlined text-9xl -mr-4 -mt-4">add_circle</span>
                        </div>
                        <span className="material-symbols-outlined text-4xl mb-4 text-[#E80000]">add</span>
                        <h2 className="text-3xl font-black mb-2 uppercase">{t('createBattle')}</h2>
                        <p className="text-gray-400">{t('createBattleDesc')}</p>
                    </button>
                </div>

                {/* Join Code Input */}
                <div className="max-w-md mx-auto mb-20">
                    <div className="flex bg-[#1A1A1A] border border-white/20 rounded-xl p-2 focus-within:border-[#E80000] transition-colors">
                        <input
                            type="text"
                            placeholder={t('enterCodePlaceholder')}
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            maxLength={6}
                            className="flex-1 bg-transparent px-4 py-3 outline-none text-white font-mono text-lg placeholder:text-gray-600 text-center tracking-widest"
                        />
                        <button
                            onClick={handleJoinWithCode}
                            disabled={!joinCode}
                            className="bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('joinButton')}
                        </button>
                    </div>
                </div>

                {/* Public Lobbies */}
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#E80000]">public</span>
                            {t('publicLobbies')}
                        </h2>

                        {/* Filters */}
                        <div className="flex gap-4">
                            <select
                                className="bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#E80000]"
                                value={filters.minRating}
                                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                            >
                                <option value="">{t('ratingAny')}</option>
                                <option value="800">800+</option>
                                <option value="1200">1200+</option>
                                <option value="1600">1600+</option>
                                <option value="2000">2000+</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-500">{t('searching')}</div>
                    ) : lobbies.length === 0 ? (
                        <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-12 text-center text-gray-500">
                            <span className="material-symbols-outlined text-4xl mb-4 opacity-50">search_off</span>
                            <p>{t('noLobbies')}</p>
                            <p className="text-sm mt-2">{t('noLobbiesDesc')}</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {lobbies.map((battle) => (
                                <div key={battle.id} className="bg-[#0D0D0D] border border-white/10 rounded-xl p-6 flex items-center justify-between hover:border-white/30 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center font-bold text-gray-400 group-hover:bg-[#E80000]/10 group-hover:text-[#E80000] transition-colors">
                                            {battle.type}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">
                                                {t('hostedBy', { username: battle.createdBy.username })}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-base">signal_cellular_alt</span>
                                                    {battle.minRating || 0} - {battle.maxRating || '∞'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-base">timer</span>
                                                    30m
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/${locale}/battles/${battle.id}`)}
                                        className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black font-bold transition-all"
                                    >
                                        {t('join')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
