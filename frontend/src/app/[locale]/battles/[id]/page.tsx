'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import io, { Socket } from 'socket.io-client';

interface Participant {
    id: string;
    userId: string;
    score: number;
    user: {
        username: string;
        rating: number;
    };
}

interface Battle {
    id: string;
    type: string;
    status: 'waiting' | 'active' | 'finished';
    participants: Participant[];
    startTime?: string;
    rounds?: any[];
}

export default function BattleRoomPage() {
    const t = useTranslations('battles');
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locale = params.locale || 'en';
    const battleId = params.id as string;

    const [battle, setBattle] = useState<Battle | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Game State (Active)
    const [currentCode, setCurrentCode] = useState('');
    const [currentLanguage, setCurrentLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated) {
            router.push(`/${locale}/login`);
            return;
        }

        const fetchBattle = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/battles/${battleId}`);
                if (res.ok) {
                    const data = await res.json();
                    setBattle(data.battle);

                    // Connect Socket
                    const newSocket = io(API_URL);
                    setSocket(newSocket);

                    newSocket.emit('join-battle', battleId);

                    newSocket.on('battle-started', (updatedBattle) => {
                        setBattle(prev => ({ ...prev!, status: 'active', ...updatedBattle }));
                    });

                    newSocket.on('participant-joined', (participant) => {
                        setBattle(prev => {
                            if (!prev) return null;
                            // Avoid duplicates
                            if (prev.participants.find(p => p.userId === participant.userId)) return prev;
                            return { ...prev, participants: [...prev.participants, participant] };
                        });
                    });

                } else {
                    setError('Battle not found');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load battle');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBattle();

        return () => {
            if (socket) socket.disconnect();
        };
    }, [battleId, isAuthenticated, loading, router, locale]);

    const handleStartGame = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/battles/${battleId}/start`, {
                method: 'POST'
            });

            if (res.ok) {
                // Socket will handle the update via 'battle-started' event if we implemented it backend side
                // But for now, let's force a reload or local update as fallback
                const data = await res.json();
                setBattle(data.battle);
                // Reload to get problems (rounds)
                window.location.reload();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/submissions/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: currentCode,
                    language: currentLanguage,
                    input: '' // Custom input logical later
                })
            });
            const data = await res.json();
            if (data.result.error) {
                setOutput(`Error: ${data.result.error}`);
            } else {
                setOutput(data.result.output);
            }
        } catch (err) {
            setOutput('Execution failed');
        } finally {
            setIsRunning(false);
        }
    };

    if (loading || isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Arena...</div>;
    if (error || !battle) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">{error}</div>;

    // --- LOBBY VIEW ---
    if (battle.status === 'waiting') {
        return (
            <div className="min-h-screen bg-black text-white p-8">
                <header className="flex justify-between items-center mb-12">
                    <Link href={`/${locale}/battles`} className="text-gray-400 hover:text-white">← Back to Battles</Link>
                    <h1 className="text-2xl font-bold">Lobby: {battle.id.slice(0, 8)}</h1>
                </header>

                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                    <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#E80000]">group</span>
                            Participants ({battle.participants.length})
                        </h2>
                        <div className="space-y-4">
                            {battle.participants.map(p => (
                                <div key={p.id} className="flex items-center gap-4 p-4 bg-black/50 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E80000] to-[#FF1A1A] flex items-center justify-center font-bold">
                                        {p.user.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold">{p.user.username}</p>
                                        <p className="text-xs text-gray-500">Rating: {p.user.rating}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Invite Section */}
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Invite Players</h3>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-sm font-mono text-gray-300 truncate">
                                    {typeof window !== 'undefined' ? window.location.href : `.../battles/${battle.id}`}
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Link copied!');
                                    }}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
                                >
                                    Copy Link
                                </button>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-sm text-gray-500">Battle Code:</span>
                                <code className="bg-black/50 px-2 py-1 rounded text-[#E80000] font-bold">{battle.id}</code>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center items-center gap-6 p-8 border border-dashed border-white/20 rounded-xl">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold mb-2">Waiting for host...</h3>
                            <p className="text-gray-400">The battle will start soon.</p>
                        </div>

                        <div className="animate-pulse w-full max-w-xs bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#E80000] w-1/3 h-full animate-[shimmer_2s_infinite]"></div>
                        </div>

                        {/* Only host should see this ideally, but for now visible to all for testing */}
                        <button
                            onClick={handleStartGame}
                            className="gradient-button px-8 py-4 rounded-lg font-bold text-lg hover:scale-105 transition-transform"
                        >
                            Start Battle Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- ACTIVE GAME VIEW ---
    const activeProblem = battle.rounds && battle.rounds.length > 0 ? battle.rounds[0].problem : { title: 'Loading...', difficulty: 800, description: 'Problem loading...' };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0D0D0D]">
                <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded text-xs font-bold uppercase tracking-wider animate-pulse">Live Battle</span>
                    <span className="font-mono text-xl font-bold">00:29:59</span>
                </div>
                <h1 className="font-bold">{activeProblem.title}</h1>
                <button className="px-4 py-2 bg-white/10 rounded hover:bg-white/20 text-sm">Leave Battle</button>
            </header>

            <div className="flex-1 grid grid-cols-12 overflow-hidden">
                {/* Problem Description */}
                <div className="col-span-4 border-r border-white/10 p-6 overflow-y-auto bg-black">
                    <h2 className="text-2xl font-bold mb-4">{activeProblem.title}</h2>
                    <div className="flex gap-2 mb-6">
                        <span className="px-2 py-1 bg-white/10 rounded text-xs">Rating: {activeProblem.difficulty || activeProblem.rating}</span>
                        <span className="px-2 py-1 bg-white/10 rounded text-xs">Time: 1s</span>
                    </div>
                    <div className="prose prose-invert max-w-none">
                        <p>{activeProblem.description}</p>
                        {/* Placeholder for complex description */}
                    </div>
                </div>

                {/* Editor */}
                <div className="col-span-5 flex flex-col bg-[#1A1A1A] border-r border-white/10">
                    <div className="h-10 bg-[#0D0D0D] border-b border-white/10 flex items-center justify-between px-4">
                        <select
                            value={currentLanguage}
                            onChange={(e) => setCurrentLanguage(e.target.value)}
                            className="bg-transparent text-sm outline-none"
                        >
                            <option value="python">Python 3</option>
                            <option value="cpp">C++ 17</option>
                            <option value="javascript">JavaScript</option>
                        </select>
                        <button
                            onClick={handleRunCode}
                            disabled={isRunning}
                            className="text-xs flex items-center gap-1 text-[#E80000] hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">play_arrow</span>
                            Run Code
                        </button>
                    </div>
                    <textarea
                        value={currentCode}
                        onChange={(e) => setCurrentCode(e.target.value)}
                        className="flex-1 bg-[#1A1A1A] p-4 font-mono text-sm outline-none resize-none text-[#E6E6E6]"
                        placeholder="# Write your solution here..."
                        spellCheck={false}
                    />
                    <div className="h-40 bg-black border-t border-white/10 p-4 font-mono text-xs overflow-y-auto">
                        <p className="text-gray-500 mb-2">Output:</p>
                        <pre className="text-white whitespace-pre-wrap">{output || 'Run your code to see output...'}</pre>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="col-span-3 bg-[#0D0D0D] p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-yellow-500">leaderboard</span>
                        Live Standings
                    </h3>
                    <div className="space-y-2">
                        {battle.participants.sort((a, b) => b.score - a.score).map((p, i) => (
                            <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded">
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 text-center font-bold ${i === 0 ? 'text-yellow-500' : 'text-gray-500'}`}>{i + 1}</span>
                                    <span>{p.user.username}</span>
                                </div>
                                <span className="font-mono font-bold">{p.score}</span>
                            </div>
                        ))}
                    </div>

                    <button className="gradient-button w-full py-3 rounded font-bold mt-8">Submit Solution</button>
                </div>
            </div>
        </div>
    );
}
