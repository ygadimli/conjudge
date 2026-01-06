'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateBattlePage({ params }: { params: { locale: string } }) {
    const t = useTranslations('battles');
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const locale = params.locale || 'en';

    const [battleType, setBattleType] = useState('1v1');
    const [duration, setDuration] = useState('30');
    const [difficulty, setDifficulty] = useState('Easy');
    const [isCreating, setIsCreating] = useState(false);

    // URL params logic removed to avoid hydration errors as requested.


    const handleCreate = async () => {
        if (!user) return;
        setIsCreating(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/battles/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: battleType,
                    duration: parseInt(duration) * 60, // Convert minutes to seconds
                    minRating: difficulty === 'Easy' ? 800 : difficulty === 'Medium' ? 1200 : 1600,
                    maxRating: difficulty === 'Easy' ? 1200 : difficulty === 'Medium' ? 1600 : 3000,
                    userId: user.id, // Explicitly send userId for backend validation
                    participantIds: [user.id]
                })
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/${locale}/battles/${data.id}`); // Backend returns the battle object directly or { battle: ... } - checking backend, it returns `battle` object directly in `create` route
            } else {
                console.error('Failed to create battle');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    if (loading) return null;

    if (!isAuthenticated) {
        if (typeof window !== 'undefined') router.push(`/${locale}/login`);
        return null;
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-sm border-b border-white/10">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
                    <Link href={`/${locale}`} className="flex items-center gap-4">
                        <svg className="h-8 w-8 text-[#E80000]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                        <h2 className="text-2xl font-bold">ConJudge</h2>
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-12">
                <h1 className="text-4xl font-black mb-8 text-center text-glow">Create New Battle</h1>

                <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-3">Battle Type</label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {['1v1', 'Team', 'Blitz', 'Mirror'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setBattleType(type)}
                                        className={`p-4 rounded-lg border text-center transition-all ${battleType === type
                                            ? 'bg-[#E80000]/20 border-[#E80000] text-[#E80000]'
                                            : 'bg-black border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        <span className="font-bold">{type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3">Duration</label>
                            <select
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full bg-black border border-white/20 rounded-lg p-3 focus:border-[#E80000] outline-none"
                            >
                                <option value="15">15 Minutes</option>
                                <option value="30">30 Minutes</option>
                                <option value="60">1 Hour</option>
                                <option value="120">2 Hours</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3">Difficulty</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full bg-black border border-white/20 rounded-lg p-3 focus:border-[#E80000] outline-none"
                            >
                                <option value="Easy">Easy (800-1200)</option>
                                <option value="Medium">Medium (1200-1600)</option>
                                <option value="Hard">Hard (1600+)</option>
                            </select>
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="gradient-button w-full py-4 rounded-lg font-bold text-lg mt-4 disabled:opacity-50"
                        >
                            {isCreating ? 'Creating Arena...' : 'Create Arena'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
