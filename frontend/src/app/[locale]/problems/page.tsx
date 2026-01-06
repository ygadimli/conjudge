'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Problem {
    id: string;
    title: string;
    difficulty: number;
    rating: number;
    category: string;
    solveCount: number;
    attemptCount: number;
    status?: 'AC' | 'WA' | 'TLE' | null;
}

const CATEGORIES = ['All', 'DP', 'Graph', 'Math', 'Strings', 'Greedy', 'Data Structures'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard', 'Insane'];

const Switch = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (c: boolean) => void }) => (
    <button
        onClick={() => onCheckedChange(!checked)}
        className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-[#E80000]' : 'bg-white/20'}`}
    >
        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
);

export default function ProblemsPage({ params }: { params: { locale: string } }) {
    const t = useTranslations('problems');
    const { user } = useAuth();
    const locale = params?.locale || 'en';

    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');
    const [showSolved, setShowSolved] = useState(true);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/problems`);
                if (res.ok) {
                    const data = await res.json();
                    setProblems(data.problems || []);
                }
            } catch (error) {
                console.error('Error fetching problems:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProblems();
    }, []);

    const filteredProblems = problems.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === 'All' ||
            (selectedDifficulty === 'Easy' && p.rating < 1200) ||
            (selectedDifficulty === 'Medium' && p.rating >= 1200 && p.rating < 1600) ||
            (selectedDifficulty === 'Hard' && p.rating >= 1600 && p.rating < 2000) ||
            (selectedDifficulty === 'Insane' && p.rating >= 2000);
        const matchesSolved = showSolved || p.status !== 'AC';

        return matchesSearch && matchesCategory && matchesDifficulty && matchesSolved;
    });

    const getDifficultyColor = (rating: number) => {
        if (rating < 1200) return 'text-gray-400';
        if (rating < 1400) return 'text-green-500';
        if (rating < 1600) return 'text-cyan-500';
        if (rating < 1900) return 'text-blue-500';
        if (rating < 2100) return 'text-purple-500';
        return 'text-[#E80000]';
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-black text-white font-display">
            <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#0D0D0D]/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-3xl text-[#E80000]">grid_view</span>
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase">{t('title')}</h1>
                </div>
                {user?.role === 'ADMIN' && (
                    <div className="flex gap-4">
                        <Link href={`/${locale}/admin/ai-studio`} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            AI Studio
                        </Link>
                        <Link href={`/${locale}/admin/problems/create`} className="flex items-center gap-2 px-4 py-2 bg-[#E80000] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors">
                            <span className="material-symbols-outlined text-sm">add</span>
                            Create
                        </Link>
                    </div>
                )}
            </header>

            <main className="flex">
                <aside className="w-80 border-r border-white/10 min-h-[calc(100vh-80px)] p-6 space-y-8 bg-[#0D0D0D]">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('search')}</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-500">search</span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search problems..."
                                className="w-full bg-black border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-[#E80000] focus:ring-1 focus:ring-[#E80000] outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('showSolved')}</span>
                        <Switch checked={showSolved} onCheckedChange={setShowSolved} />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('difficulty')}</label>
                        <div className="space-y-1">
                            {DIFFICULTIES.map(diff => (
                                <button
                                    key={diff}
                                    onClick={() => setSelectedDifficulty(diff)}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${selectedDifficulty === diff ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {diff}
                                    {selectedDifficulty === diff && <span className="material-symbols-outlined text-sm">check</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('category')}</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedCategory === cat ? 'bg-[#E80000]/10 border-[#E80000] text-[#E80000]' : 'border-white/10 text-gray-500 hover:border-white/30'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                <div className="flex-1 p-8">
                    <div className="bg-[#0D0D0D] border border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-black/50 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest w-20">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">{t('problem')}</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-widest w-32">{t('difficulty')}</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-widest w-32">{t('acceptance')}</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-widest w-32">{t('status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredProblems.map((problem) => (
                                        <motion.tr
                                            key={problem.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                                        >
                                            <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                                {problem.id.slice(0, 4)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link href={`/${locale}/problems/${problem.id}`} className="flex flex-col group-hover:translate-x-1 transition-transform">
                                                    <span className="font-bold text-white group-hover:text-[#E80000] transition-colors">{problem.title}</span>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">{problem.category}</span>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-xs font-black ${getDifficultyColor(problem.rating)}`}>{problem.rating}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-bold text-gray-300">
                                                        {problem.attemptCount > 0 ? Math.round((problem.solveCount / problem.attemptCount) * 100) : 0}%
                                                    </span>
                                                    <span className="text-[9px] text-gray-600">{problem.solveCount}/{problem.attemptCount}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {problem.status === 'AC' ? (
                                                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                                ) : problem.status ? (
                                                    <span className="material-symbols-outlined text-red-500 text-lg">cancel</span>
                                                ) : (
                                                    <span className="text-gray-700">-</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                        {filteredProblems.length === 0 && (
                            <div className="py-20 text-center text-gray-500 flex flex-col items-center">
                                <span className="material-symbols-outlined text-5xl mb-4 opacity-50">search_off</span>
                                <p className="text-sm font-bold uppercase tracking-widest">{t('noProblemsFound')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
