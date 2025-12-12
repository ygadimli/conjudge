'use client';

import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Problem {
    id: string;
    title: string;
    rating: number;
    category: string;
    tags: string[];
    createdAt: string;
}

export default function ProblemsPage() {
    const t = useTranslations('problems');
    const params = useParams();
    const locale = params.locale || 'en';

    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [minRating, setMinRating] = useState('');
    const [maxRating, setMaxRating] = useState('');
    const [tag, setTag] = useState('');

    const fetchProblems = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (search) query.append('search', search);
            if (minRating) query.append('minRating', minRating);
            if (maxRating) query.append('maxRating', maxRating);
            if (tag) query.append('tag', tag);

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/problems?${query.toString()}`);
            if (res.ok) {
                const data = await res.json();
                // Ensure tags is array if string comes from simplified backend
                const processed = data.problems.map((p: any) => ({
                    ...p,
                    tags: typeof p.tags === 'string' ? p.tags.split(',') : p.tags
                }));
                setProblems(processed);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce or just generic fetch on change
    useEffect(() => {
        const timeout = setTimeout(fetchProblems, 500);
        return () => clearTimeout(timeout);
    }, [search, minRating, maxRating, tag]);

    const getRatingColor = (rating: number) => {
        if (rating < 1200) return 'text-gray-400';
        if (rating < 1400) return 'text-green-500';
        if (rating < 1600) return 'text-cyan-500';
        if (rating < 1900) return 'text-blue-500';
        if (rating < 2100) return 'text-purple-500';
        if (rating < 2400) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <div className="min-h-screen bg-black text-[#E6E6E6]">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    <div className="md:w-1/4 space-y-6">
                        <h2 className="text-xl font-bold border-b border-white/10 pb-2">Filter Problems</h2>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Search</label>
                            <input
                                type="text"
                                placeholder="Problem name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-[#0D0D0D] border border-white/10 rounded px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Rating Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minRating}
                                    onChange={(e) => setMinRating(e.target.value)}
                                    className="w-1/2 bg-[#0D0D0D] border border-white/10 rounded px-3 py-2 text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxRating}
                                    onChange={(e) => setMaxRating(e.target.value)}
                                    className="w-1/2 bg-[#0D0D0D] border border-white/10 rounded px-3 py-2 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Tag</label>
                            <input
                                type="text"
                                placeholder="e.g. math"
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                className="w-full bg-[#0D0D0D] border border-white/10 rounded px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <div className="md:w-3/4">
                        <h1 className="text-3xl font-black mb-6">Problemset</h1>

                        {loading ? (
                            <div className="text-center py-20 text-gray-500">Loading problems...</div>
                        ) : problems.length === 0 ? (
                            <div className="text-center py-20 bg-[#0D0D0D] border border-white/10 rounded-xl">
                                <p className="text-xl font-bold mb-2">No problems found</p>
                                <p className="text-gray-500">Try adjusting your filters.</p>
                            </div>
                        ) : (
                            <div className="bg-[#0D0D0D] border border-white/10 rounded-xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 border-b border-white/10">
                                        <tr>
                                            <th className="p-4 font-medium text-gray-400">#</th>
                                            <th className="p-4 font-medium text-gray-400">Name</th>
                                            <th className="p-4 font-medium text-gray-400">Tags</th>
                                            <th className="p-4 font-medium text-gray-400">Rating</th>
                                            <th className="p-4 font-medium text-gray-400">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {problems.map((prob) => (
                                            <tr key={prob.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-gray-500 font-mono text-xs">{prob.id.substring(0, 4)}</td>
                                                <td className="p-4 font-medium">
                                                    <Link href={`/${locale}/problems/${prob.id}`} className="hover:text-[#E80000] transition-colors">
                                                        {prob.title}
                                                    </Link>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {prob.tags.map((t, i) => (
                                                            <span key={i} className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className={`p-4 font-bold ${getRatingColor(prob.rating)}`}>
                                                    {prob.rating}
                                                </td>
                                                <td className="p-4">
                                                    <Link href={`/${locale}/problems/${prob.id}`} className="text-[#E80000] hover:underline text-sm font-medium">
                                                        Solve
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
