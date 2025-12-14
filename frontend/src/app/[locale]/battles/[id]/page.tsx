
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import io from 'socket.io-client';

// Define types
interface User {
    id: string;
    username: string;
    rating: number;
    battleRating: number;
    country: string;
}

interface Participant {
    id: string;
    userId: string;
    score: number;
    rank: number;
    user: User;
    status: string;
    ratingChange: number;
    newRating?: number;
}

interface Problem {
    id: string;
    title: string;
    description: string;
    testCases: string;
    timeLimit: number;
    memoryLimit: number;
}

interface Round {
    id: string;
    order: number;
    problem: Problem;
    problemRating: number;
}

interface Battle {
    id: string;
    status: 'waiting' | 'active' | 'finished';
    type: string;
    isPrivate: boolean;
    joinCode?: string;
    participants: Participant[];
    rounds: Round[];
    startTime?: string;
    endTime?: string;
    duration: number;
    createdById: string;
}

export default function BattleDetail() {
    const t = useTranslations('battles'); // uses updated keys
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const locale = (params.locale as string) || 'en';

    const [battle, setBattle] = useState<Battle | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState(0); // Index of active problem
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<any>(null); // Last run result

    const socketRef = useRef<any>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Fetch Battle
    const fetchBattle = async () => {
        try {
            const res = await fetch(`${API_URL}/api/battles/${id}`);
            if (res.ok) {
                const data = await res.json();
                setBattle(data);

                // If active, sync timer
                if (data.status === 'active' && data.startTime) {
                    const end = new Date(data.startTime).getTime() + (data.duration * 1000);
                    const now = new Date().getTime();
                    setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)));
                }
            } else {
                router.push(`/${locale}/battles`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBattle();

        // Socket logic
        socketRef.current = io(API_URL);
        socketRef.current.emit('join-battle', id);

        socketRef.current.on('battle-updated', (updatedBattle: Battle) => {
            fetchBattle();
        });

        socketRef.current.on('battle-started', () => {
            fetchBattle();
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [id]);

    // Timer Logic
    useEffect(() => {
        if (!timeLeft || timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev && prev <= 1) {
                    clearInterval(interval);
                    if (battle?.createdById === user?.id) handleFinish();
                    return 0;
                }
                return prev ? prev - 1 : 0;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    // Format Logic
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = async () => {
        try {
            const res = await fetch(`${API_URL}/api/battles/${id}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id })
            });
            if (res.ok) fetchBattle();
        } catch (e) {
            alert('Failed to start');
        }
    };

    const handleFinish = async () => {
        await fetch(`${API_URL}/api/battles/${id}/finish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        fetchBattle();
    };

    const handleSubmit = async () => {
        if (!battle || !user) return;
        setSubmitting(true);
        setSubmissionResult(null);

        try {
            const problemId = battle.rounds[activeTab].problem.id;
            const res = await fetch(`${API_URL}/api/submissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    problemId,
                    code,
                    language: 'cpp', // Hardcoded for simplified UI as requested
                    battleId: id // Important context for backend
                })
            });

            const data = await res.json();
            setSubmissionResult(data);
            // If AC, refetch battle to update score (assuming backend updates it)
            if (data.status === 'AC') {
                setTimeout(fetchBattle, 1000);
            }
        } catch (e) {
            alert('Error submitting');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black text-white p-10">{t('loading')}</div>;
    if (!battle) return null;

    // --- LOBBY VIEW ---
    if (battle.status === 'waiting') {
        const isCreator = user?.id === battle.createdById;
        const myParticipant = battle.participants.find(p => p.userId === user?.id);

        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="max-w-4xl mx-auto py-20 px-4">
                    <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 text-center">
                        <span className="material-symbols-outlined text-6xl text-[#E80000] mb-4">swords</span>
                        <h1 className="text-4xl font-black mb-2 upppercase">{battle.type} {t('lobby')}</h1>

                        {battle.isPrivate && (
                            <div className="bg-black/50 border border-white/20 rounded-lg p-4 inline-block my-6">
                                <p className="text-sm text-gray-500 mb-1">{t('joinCode')}</p>
                                <p className="text-4xl font-mono font-bold tracking-widest text-green-400">{battle.joinCode}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-8 my-10 max-w-2xl mx-auto">
                            {/* Needed Slots */}
                            <div className="bg-black/30 p-6 rounded-xl border border-white/10">
                                <h3 className="text-gray-400 mb-4">P1 ({t('host')})</h3>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-10 h-10 bg-[#E80000] rounded-full flex items-center justify-center font-bold">
                                        {battle.participants[0]?.user.username[0].toUpperCase()}
                                    </div>
                                    <span className="font-bold text-xl">{battle.participants[0]?.user.username}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">{t('rate')}: {battle.participants[0]?.user.battleRating || 1200}</p>
                            </div>

                            <div className="bg-black/30 p-6 rounded-xl border border-dashed border-white/20">
                                <h3 className="text-gray-400 mb-4">P2 ({t('opponent')})</h3>
                                {battle.participants[1] ? (
                                    <>
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                                                {battle.participants[1].user.username[0].toUpperCase()}
                                            </div>
                                            <span className="font-bold text-xl">{battle.participants[1].user.username}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">{t('rate')}: {battle.participants[1].user.battleRating || 1200}</p>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center py-2 animate-pulse">
                                        <span className="material-symbols-outlined text-3xl mb-2 text-gray-600">person_add</span>
                                        <span className="text-gray-500 font-mono">{t('waiting')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isCreator && (
                            <button
                                onClick={handleStart}
                                disabled={battle.participants.length < 2}
                                className="px-12 py-4 bg-[#E80000] hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(232,0,0,0.4)] hover:shadow-[0_0_40px_rgba(232,0,0,0.6)]"
                            >
                                {t('startBattle')}
                            </button>
                        )}
                        {!isCreator && !myParticipant && (
                            <button className="px-8 py-3 bg-white text-black font-bold rounded-lg" disabled>
                                {t('joinMainMenu')}
                            </button>
                        )}
                        {!isCreator && myParticipant && (
                            <p className="text-green-400 animate-pulse font-bold text-lg">{t('waitingForHost')}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- FINISHED VIEW ---
    if (battle.status === 'finished') {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="max-w-3xl w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-10 text-center">
                    <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">{t('finished')}</h1>

                    <div className="space-y-4">
                        {battle.participants.map((p, idx) => (
                            <div key={p.id} className={`p-6 rounded-xl border flex items-center justify-between ${idx === 0 ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-white/5 border-white/10'}`}>
                                <div className="flex items-center gap-4">
                                    <span className={`text-4xl font-black ${idx === 0 ? 'text-yellow-500' : 'text-gray-500'}`}>#{idx + 1}</span>
                                    <div className="text-left">
                                        <p className="font-bold text-2xl">{p.user.username}</p>
                                        <p className="text-sm text-gray-400">{p.user.country || 'Unknown'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-mono font-bold">{p.score} pts</p>
                                    <div className={`text-sm font-bold flex items-center justify-end gap-1 ${p.ratingChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {p.ratingChange >= 0 ? '+' : ''}{p.ratingChange} Elo
                                        <span className="text-gray-500 font-normal">({p.newRating})</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={() => router.push(`/${locale}/battles`)} className="mt-10 px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200">
                        {t('backToArena')}
                    </button>
                </div>
            </div>
        );
    }

    // --- ACTIVE BATTLE VIEW ---
    return (
        <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="h-16 bg-[#0D0D0D] border-b border-white/10 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div onClick={() => router.push(`/${locale}/battles`)} className="cursor-pointer hover:bg-white/10 p-2 rounded">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </div>
                    <span className="font-bold text-lg text-gray-200">BATTLE #{battle.id.slice(0, 4)}</span>
                </div>

                {/* Timer */}
                <div className={`font-mono text-3xl font-black tracking-widest ${timeLeft && timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                </div>

                <div className="flex items-center gap-4">
                    {/* My Score */}
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">{t('myScore')}</span>
                        <span className="font-bold text-green-400 text-xl">
                            {battle.participants.find(p => p.userId === user?.id)?.score || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Split */}
            <div className="flex flex-1 overflow-hidden">
                {/* LEFT: Problems */}
                <div className="w-1/2 flex flex-col border-r border-white/10">
                    {/* Tabs */}
                    <div className="flex overflow-x-auto border-b border-white/10 bg-[#141414]">
                        {battle.rounds.map((round, idx) => (
                            <button
                                key={round.id}
                                onClick={() => setActiveTab(idx)}
                                className={`px-6 py-3 font-bold text-sm transition-colors border-r border-white/5 ${activeTab === idx ? 'bg-[#E80000] text-white' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                {t('problem')} {String.fromCharCode(65 + idx)}
                            </button>
                        ))}
                    </div>

                    {/* Problem Description */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-black">{battle.rounds[activeTab]?.problem.title}</h2>
                            <span className="px-3 py-1 bg-white/10 rounded text-sm font-mono">
                                {battle.rounds[activeTab]?.problemRating} {t('rate')}
                            </span>
                        </div>

                        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                            {/* In a real app, parse Markdown here */}
                            <p>{battle.rounds[activeTab]?.problem.description}</p>

                            <h3 className="text-white mt-6 mb-2 font-bold">{t('input')}</h3>
                            <pre className="bg-black/50 p-4 rounded border border-white/10 font-mono text-sm">stdin</pre>

                            <h3 className="text-white mt-6 mb-2 font-bold">{t('output')}</h3>
                            <pre className="bg-black/50 p-4 rounded border border-white/10 font-mono text-sm">stdout</pre>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Editor & Standings */}
                <div className="w-1/2 flex flex-col bg-[#0D0D0D]">
                    {/* Editor Area */}
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#141414] border-b border-white/10">
                            <span className="text-xs font-bold text-gray-500">{t('codeEditor')} (C++)</span>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-1.5 rounded text-sm font-bold transition-colors disabled:opacity-50"
                            >
                                {submitting ? t('testing') : t('submit')}
                            </button>
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="flex-1 bg-[#0D0D0D] p-4 font-mono text-sm resize-none focus:outline-none text-gray-300 leading-6"
                            placeholder="// Write your solution here..."
                            spellCheck={false}
                        />
                        {/* Output Console */}
                        {submissionResult && (
                            <div className={`h-32 border-t border-white/10 p-4 font-mono text-sm overflow-y-auto ${submissionResult.status === 'AC' ? 'bg-green-900/10 text-green-400' : 'bg-red-900/10 text-red-400'}`}>
                                <div className="font-bold mb-1">{submissionResult.status === 'AC' ? t('accepted') : submissionResult.status}</div>
                                <div className="text-gray-400 text-xs">Runtime: {submissionResult.runtime}ms | Memory: {submissionResult.memory}KB</div>
                                {submissionResult.message && <div className="mt-2 text-white/70">{submissionResult.message}</div>}
                            </div>
                        )}
                    </div>

                    {/* Bottom Standings */}
                    <div className="h-48 border-t-2 border-white/10 bg-[#111] overflow-y-auto">
                        <div className="sticky top-0 bg-[#111] px-4 py-2 border-b border-white/5 font-bold text-xs text-gray-500 flex justify-between z-10">
                            <span>{t('liveStandings')}</span>
                            <span>{battle.participants.length} {t('players')}</span>
                        </div>
                        <table className="w-full text-left text-sm">
                            <tbody>
                                {battle.participants.sort((a, b) => b.score - a.score).map((p, idx) => (
                                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-3 w-12 font-mono text-gray-500">#{idx + 1}</td>
                                        <td className="p-3 font-bold flex items-center gap-2">
                                            {p.user.country && <span className="text-xs opacity-70">[{p.user.country}]</span>}
                                            {p.user.username}
                                            {p.userId === user?.id && <span className="text-[10px] bg-white/20 px-1 rounded ml-2">{t('you')}</span>}
                                        </td>
                                        <td className="p-3 text-right font-mono font-bold text-[#E80000]">{p.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
