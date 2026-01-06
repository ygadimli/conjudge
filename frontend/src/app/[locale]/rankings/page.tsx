
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { getTier } from '@/utils/rating';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

// ... imports

interface RankingUser {
    id: string;
    username: string;
    rating: number;
    battleRating: number;
    solved: number;
    country: string | null;
    profilePicture?: string;
    submissionsCount?: number;
}

export default function RankingsPage() {
    const t = useTranslations('common');
    const tRank = useTranslations('rankings');
    const params = useParams();
    const router = useRouter();
    const locale = (params.locale as string) || 'en';

    const { user: currentUser } = useAuth();
    const [filter, setFilter] = useState<'contest' | 'battle'>('contest');
    const [countryFilter, setCountryFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [favoritesOnly, setFavoritesOnly] = useState(false);
    const [rankings, setRankings] = useState<RankingUser[]>([]);
    const [loading, setLoading] = useState(true);

    // User Rank Bar State
    const [myRankData, setMyRankData] = useState<{ rank: number, score: number } | null>(null);

    // Initial load
    useEffect(() => {
        fetchRankings();
    }, [filter]); // Reload when tab changes

    // Fetch current user's rank/score
    useEffect(() => {
        if (currentUser) {
            fetchMyRank();
        }
    }, [currentUser, filter]);

    const fetchMyRank = async () => {
        if (!currentUser) return;
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/users/${currentUser.username}`);
            if (res.ok) {
                const data = await res.json();
                const score = filter === 'contest' ? data.user.rating : data.user.battleRating;
                setMyRankData({
                    rank: data.user.globalRank,
                    score: score
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRankings = async () => {
        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const queryParams: any = {
                sortBy: filter === 'contest' ? 'rating' : 'battleRating',
            };

            if (countryFilter !== 'All') queryParams.country = countryFilter;
            if (search) queryParams.search = search;
            if (favoritesOnly && currentUser) {
                queryParams.favoritesOnly = 'true';
                queryParams.userId = currentUser.id;
            }

            const query = new URLSearchParams(queryParams);
            const res = await fetch(`${API_URL}/api/users?${query.toString()}`);

            if (res.ok) {
                const data = await res.json();
                setRankings(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = () => {
        fetchRankings();
    };

    const handleRowClick = (username: string) => {
        router.push(`/${locale}/profile/${username}`);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* User Score/Rank Bar - Sticky/Top */}
                {currentUser && myRankData && (
                    <div className="bg-[#1e2a3b] border-l-4 border-blue-500 rounded-md shadow-lg mb-8 p-4 flex items-center justify-between animate-in slide-in-from-top-4">
                        <div className="flex gap-12">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-400">speed</span>
                                <span className="text-gray-300 font-medium tracking-wide">Your Score :</span>
                                <span className="text-white font-bold text-lg">{myRankData.score}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-yellow-400">emoji_events</span>
                                <span className="text-gray-300 font-medium tracking-wide">Your Rank :</span>
                                <span className="text-white font-bold text-lg">{myRankData.rank}</span>
                            </div>
                        </div>
                    </div>
                )}

                <h1 className="text-4xl font-black mb-8">{tRank('title')}</h1>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilter('contest')}
                        className={`px-6 py-2 rounded-t-lg font-bold transition-colors border-b-2 ${filter === 'contest' ? 'bg-white/5 border-[#E80000] text-white' : 'border-transparent text-gray-500 hover:text-white'}`}
                    >
                        {t('rating')}
                    </button>
                    <button
                        onClick={() => setFilter('battle')}
                        className={`px-6 py-2 rounded-t-lg font-bold transition-colors border-b-2 ${filter === 'battle' ? 'bg-white/5 border-[#E80000] text-white' : 'border-transparent text-gray-500 hover:text-white'}`}
                    >
                        {t('battleRating')}
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="bg-[#151515] rounded-lg p-2 mb-8 flex flex-col md:flex-row items-center gap-4 shadow-sm border border-white/10">

                    {/* Search Left */}
                    <div className="flex-1 w-full relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                        <input
                            type="text"
                            placeholder={tRank('search')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                            className="bg-transparent text-white pl-10 pr-4 py-2 outline-none w-full placeholder-gray-600"
                        />
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-8 bg-white/10 mx-2"></div>

                    {/* Right Filters */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap hidden lg:block">{tRank('filters')}</span>

                        <div className="relative flex-1 md:flex-none">
                            <select
                                className="bg-[#0D0D0D] text-white pl-3 pr-8 py-2 rounded border border-white/20 outline-none focus:border-[#E80000] appearance-none cursor-pointer w-full md:w-48 text-sm"
                                value={countryFilter}
                                onChange={(e) => setCountryFilter(e.target.value)}
                            >
                                <option value="All">{t('country')}: All</option>
                                <option value="Azerbaijan">🇦🇿 Azerbaijan</option>
                                <option value="Turkey">🇹🇷 Turkey</option>
                                <option value="USA">🇺🇸 USA</option>
                                <option value="Russia">🇷🇺 Russia</option>
                                <option value="India">🇮🇳 India</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </div>
                        </div>

                        <button
                            onClick={handleApplyFilters}
                            className="px-6 py-2 bg-white text-black font-bold uppercase text-sm rounded hover:bg-gray-200 transition-colors"
                        >
                            Apply
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-[#0D0D0D] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#151515] border-b border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                <th className="p-4 w-16 text-center">#</th>
                                <th className="p-4 w-16"></th>
                                <th className="p-4 w-48">{t('country')}</th>
                                <th className="p-4">{tRank('username')}</th>
                                <th className="p-4 w-40">{tRank('rank')}</th>
                                <th className="p-4 text-right w-32">{filter === 'contest' ? t('rating') : t('battleRating')}</th>
                                <th className="p-4 text-right w-32">{t('solved')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500 animate-pulse">Loading...</td>
                                </tr>
                            ) : rankings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">No users found</td>
                                </tr>
                            ) : (
                                rankings.map((user, index) => {
                                    const rating = filter === 'contest' ? user.rating : user.battleRating;
                                    const tier = getTier(rating);

                                    return (
                                        <tr
                                            key={user.id}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                                            onClick={() => handleRowClick(user.username)}
                                        >
                                            <td className="p-4 font-mono text-gray-500 text-center">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                            </td>
                                            <td className="p-4">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800">
                                                    {user.profilePicture ? (
                                                        <img
                                                            src={user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.NEXT_PUBLIC_API_URL}${user.profilePicture}`}
                                                            alt={user.username}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-white/10">
                                                            {user.username[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-300">
                                                {user.country || '-'}
                                            </td>
                                            <td className="p-4 font-bold text-base group-hover:underline decoration-white/20 underline-offset-4" style={{ color: tier.color }}>
                                                {user.username}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tier.bg} text-white shadow-sm whitespace-nowrap min-w-[80px] text-center`}>
                                                        {tier.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-bold text-base font-mono text-white">
                                                {rating}
                                            </td>
                                            <td className="p-4 text-right text-gray-400 font-mono text-sm">
                                                {user.submissionsCount || user.solved || 0}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
