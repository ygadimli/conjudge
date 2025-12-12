'use client';

import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Define interfaces for Battle data
interface Participant {
    userId: string;
    score: number;
    user: {
        username: string;
        rating: number;
    }
}

interface Battle {
    id: string;
    type: string;
    status: string;
    startTime: string;
    createdAt: string;
    participants: Participant[];
}

export default function BattlesPage() {
    const t = useTranslations('battles');
    const params = useParams();
    const locale = params.locale || 'en';

    const [battles, setBattles] = useState<Battle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBattles();
    }, []);

    const fetchBattles = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/battles`);
            if (res.ok) {
                const data = await res.json();
                setBattles(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const timeAgo = (date: string | Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    const battleFormats = [
        { icon: 'swords', title: t('formatList.duel'), color: '#E80000' },
        { icon: 'groups', title: t('formatList.team'), color: '#FF1A1A' },
        { icon: 'bolt', title: t('formatList.blitz'), color: '#FF4444' },
        { icon: 'content_copy', title: t('formatList.mirror'), color: '#FF6666' },
        { icon: 'replay', title: t('formatList.replay'), color: '#FF8888' },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E80000]/10 mb-6">
                        <span className="material-symbols-outlined text-[#E80000] text-5xl">swords</span>
                    </div>
                    <h1 className="text-5xl font-black mb-6 text-glow">{t('title')}</h1>
                    <p className="text-xl text-[#E6E6E6] max-w-3xl mx-auto">{t('subtitle')}</p>
                </div>

                {/* Create Battle CTA */}
                <div className="bg-gradient-to-r from-[#E80000] to-[#FF1A1A] rounded-2xl p-8 mb-12 text-center">
                    <h2 className="text-3xl font-bold mb-4">{t('startBattleTitle')}</h2>
                    <p className="text-lg mb-6 text-white/90">{t('startBattleDesc')}</p>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-8">
                        <Link href={`/${locale}/battles/create`} className="px-8 py-4 rounded-lg bg-white text-[#E80000] font-bold hover:bg-white/90 transition-all w-full md:w-auto">
                            {t('createBattle')}
                        </Link>

                        <div className="flex bg-black/30 rounded-lg p-1 border border-white/20 w-full md:w-auto max-w-md">
                            <input
                                type="text"
                                placeholder="Enter Battle Code..."
                                className="bg-transparent px-4 py-3 outline-none text-white w-full placeholder:text-gray-500"
                                id="battle-code-input"
                            />
                            <button
                                onClick={() => {
                                    const code = (document.getElementById('battle-code-input') as HTMLInputElement).value;
                                    if (code) window.location.href = `/${locale}/battles/${code}`;
                                }}
                                className="px-6 py-3 rounded bg-white/10 hover:bg-white/20 text-white font-bold transition-all whitespace-nowrap"
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                {/* Battle Formats */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-8 text-center">{t('formats')}</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {battleFormats.map((format, index) => (
                            <Link
                                href={`/${locale}/battles/create?type=${format.title.split(' ')[0]}`} // Simple heuristic: First word as type or mapped
                                key={index}
                                className="bg-[#0D0D0D] border border-white/10 rounded-xl p-6 hover:border-[#E80000]/50 transition-all cursor-pointer group block"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-[#E80000]/10 flex items-center justify-center group-hover:bg-[#E80000]/20 transition-all">
                                        <span className="material-symbols-outlined text-[#E80000]">{format.icon}</span>
                                    </div>
                                    <h3 className="text-xl font-bold">{format.title}</h3>
                                </div>
                                <div className="h-1 bg-gradient-to-r from-[#E80000] to-transparent rounded-full"></div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8 mb-12">
                    <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-[#E80000] text-3xl">info</span>
                        <p className="text-lg text-[#E6E6E6]">{t('description')}</p>
                    </div>
                </div>

                {/* Active Battles List */}
                <div>
                    <h2 className="text-3xl font-bold mb-6">Active Lobbies & Battles</h2>
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Loading battles...</div>
                    ) : battles.length === 0 ? (
                        <div className="text-center py-10 bg-[#0D0D0D] border border-white/10 rounded-xl text-gray-400">
                            No active battles found. Start one above!
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {battles.map((battle) => (
                                <div key={battle.id} className="bg-[#0D0D0D] border border-white/10 rounded-xl p-6 hover:border-[#E80000]/30 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="material-symbols-outlined text-[#E80000]">
                                                {battle.status === 'active' ? 'swords' : 'hourglass_empty'}
                                            </span>
                                            <div>
                                                <h3 className="font-bold text-lg uppercase">{battle.type} Battle</h3>
                                                <p className="text-sm text-[#E6E6E6]/60">
                                                    Created {timeAgo(battle.createdAt)} • {battle.participants.length} Players
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className={`text-sm font-bold ${battle.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                    {battle.status.toUpperCase()}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/${locale}/battles/${battle.id}`}
                                                className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                                            >
                                                {battle.status === 'waiting' ? 'Join Lobby' : 'Spectate'}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
