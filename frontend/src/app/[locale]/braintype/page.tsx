'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface BrainStats {
    accuracy: number;
    speed: number;
    complexity: number;
    persistence: number;
}

export default function BrainTypePage() {
    const t = useTranslations('braintype');
    const params = useParams();
    const router = useRouter(); // Missing import fix
    const locale = params.locale || 'en';
    const { user } = useAuth();

    // State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<{ type: string, description: string, stats: BrainStats } | null>(null);
    const [loadingStep, setLoadingStep] = useState(0);

    const loadingSteps = [
        "Connecting to Neural Network...",
        "Scanning Submission Patterns...",
        "Analyzing Code Efficiency...",
        "Measuring Cognitive Reflexes...",
        "Finalizing Brain Type Profile..."
    ];

    const handleAnalyze = async () => {
        if (!user) return;

        setIsAnalyzing(true);
        setLoadingStep(0);

        // Simulate AI steps for UX
        const stepInterval = setInterval(() => {
            setLoadingStep(prev => {
                if (prev >= 4) {
                    clearInterval(stepInterval);
                    return 4;
                }
                return prev + 1;
            });
        }, 800);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/braintype/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });

            if (res.ok) {
                const data = await res.json();
                // Wait for animation to finish minimal cycles
                setTimeout(() => {
                    clearInterval(stepInterval);
                    setResult({
                        type: data.brainType,
                        description: data.description,
                        stats: data.stats
                    });
                    setIsAnalyzing(false);
                }, 4000);
            }
        } catch (err) {
            console.error(err);
            setIsAnalyzing(false);
            clearInterval(stepInterval);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#E80000]/10 mb-6 relative ${isAnalyzing ? 'animate-pulse' : ''}`}>
                        <span className="material-symbols-outlined text-[#E80000] text-6xl">psychology</span>
                        {isAnalyzing && (
                            <div className="absolute inset-0 rounded-full border-2 border-[#E80000] animate-ping opacity-20"></div>
                        )}
                    </div>

                    {!result && !isAnalyzing && (
                        <>
                            <h1 className="text-5xl font-black mb-6 text-glow">{t('title')}</h1>
                            <p className="text-xl text-[#E6E6E6] max-w-3xl mx-auto mb-8">{t('subtitle')}</p>

                            {user ? (
                                <button
                                    onClick={handleAnalyze}
                                    className="px-10 py-5 bg-[#E80000] hover:bg-[#ff0000] text-white font-bold rounded-xl text-xl shadow-[0_0_30px_rgba(232,0,0,0.4)] hover:shadow-[0_0_50px_rgba(232,0,0,0.6)] transition-all transform hover:-translate-y-1"
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="material-symbols-outlined">auto_awesome</span>
                                        ACTIVATE AI ANALYSIS
                                    </span>
                                </button>
                            ) : (
                                <div className="text-yellow-500 font-bold border border-yellow-500/30 bg-yellow-500/10 p-4 rounded-lg inline-block">
                                    Please login to analyze your Brain Type.
                                </div>
                            )}
                        </>
                    )}

                    {isAnalyzing && (
                        <div className="max-w-md mx-auto">
                            <h2 className="text-2xl font-bold mb-4 text-[#E80000] animate-pulse">AI PROCESSING</h2>
                            <div className="bg-[#111] p-4 rounded-lg font-mono text-green-400 text-left h-32 flex flex-col justify-end border border-green-500/30 shadow-[0_0_15px_rgba(0,255,0,0.1)]">
                                {loadingSteps.slice(0, loadingStep + 1).map((step, i) => (
                                    <div key={i} className="animate-in slide-in-from-left-4 fade-in duration-300">
                                        {`> ${step}`}
                                    </div>
                                ))}
                                <span className="animate-pulse">_</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results View */}
                {result && !isAnalyzing && (
                    <div className="animate-in fade-in zoom-in duration-500">
                        {/* Type Header */}
                        <div className="text-center mb-12">
                            <span className="text-[#E80000] font-mono text-sm tracking-[0.3em] uppercase mb-2 block">Analysis Complete</span>
                            <h2 className="text-6xl font-black text-white mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                {result.type}
                            </h2>
                            <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                                "{result.description}"
                            </p>
                        </div>

                        {/* Detailed Stats Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                            {/* Accuracy */}
                            <div className="bg-[#0D0D0D] border border-white/10 p-6 rounded-xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Accuracy</h3>
                                <div className="text-4xl font-black text-white mb-2">{result.stats.accuracy}%</div>
                                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${result.stats.accuracy}%` }}></div>
                                </div>
                            </div>

                            {/* Speed */}
                            <div className="bg-[#0D0D0D] border border-white/10 p-6 rounded-xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Cognitive Speed</h3>
                                <div className="text-4xl font-black text-white mb-2">{result.stats.speed}/100</div>
                                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-yellow-500 h-full rounded-full transition-all duration-1000" style={{ width: `${result.stats.speed}%` }}></div>
                                </div>
                            </div>

                            {/* Complexity */}
                            <div className="bg-[#0D0D0D] border border-white/10 p-6 rounded-xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Logic Depth</h3>
                                <div className="text-4xl font-black text-white mb-2">{result.stats.complexity}/100</div>
                                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: `${result.stats.complexity}%` }}></div>
                                </div>
                            </div>

                            {/* Persistence */}
                            <div className="bg-[#0D0D0D] border border-white/10 p-6 rounded-xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Resilience</h3>
                                <div className="text-4xl font-black text-white mb-2">{result.stats.persistence}/100</div>
                                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-red-500 h-full rounded-full transition-all duration-1000" style={{ width: `${result.stats.persistence}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <Link href={`/${locale}/dashboard`} className="text-gray-500 hover:text-white transition-colors underline underline-offset-4">
                                Return to Dashboard
                            </Link>
                        </div>
                    </div>
                )}


            </main>
        </div>
    );
}
