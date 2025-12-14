
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RadarChart from '@/components/Profile/RadarChart';

interface BrainStats {
    accuracy: number;
    speed: number;
    complexity: number;
    persistence: number;
}

export default function BrainTypePage() {
    const t = useTranslations('braintype');
    const params = useParams();
    const locale = (params.locale as string) || 'en';
    const { user } = useAuth();

    // State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<{ type: string, description: string, stats: BrainStats } | null>(null);
    const [loadingStep, setLoadingStep] = useState(0);

    const loadingSteps = [
        t('loadingConnecting'),
        t('loadingScanning'),
        t('loadingAnalyzing'),
        t('loadingReflexes'),
        t('loadingFinalizing')
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
        }, 1200); // Slower, more "deliberate" analysis

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
                }, 5000);
            }
        } catch (err) {
            console.error(err);
            setIsAnalyzing(false);
            clearInterval(stepInterval);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-[#E80000] selection:text-white">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

                {/* Header Section */}
                {!result && !isAnalyzing && (
                    <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="inline-block relative mb-8 group">
                            <div className="absolute inset-0 bg-[#E80000] blur-[100px] opacity-20 rounded-full group-hover:opacity-30 transition-opacity"></div>
                            <div className="w-32 h-32 rounded-full border border-[#E80000]/30 bg-black flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(232,0,0,0.2)]">
                                <span className="material-symbols-outlined text-6xl text-[#E80000]">psychology</span>
                            </div>
                        </div>

                        <h1 className="text-6xl font-black mb-6 tracking-tight">
                            CONJUDGE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E80000] to-orange-500">BRAINTYPE</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                            {t('subtitle')}
                        </p>

                        {user ? (
                            <button
                                onClick={handleAnalyze}
                                className="group relative px-12 py-6 bg-transparent overflow-hidden rounded-xl"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#E80000] to-[#b30000] opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute inset-0 w-full h-full border border-white/20 rounded-xl"></div>
                                <span className="relative flex items-center gap-3 text-xl font-bold uppercase tracking-widest text-white">
                                    <span className="material-symbols-outlined">fingerprint</span>
                                    {t('activate')}
                                </span>
                            </button>
                        ) : (
                            <div className="inline-flex items-center gap-2 text-yellow-500 border border-yellow-500/30 bg-yellow-500/5 px-6 py-3 rounded-full">
                                <span className="material-symbols-outlined text-lg">lock</span>
                                <span className="font-bold">{t('loginRequired')}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Analysis Animation View */}
                {isAnalyzing && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-500">
                        <div className="relative w-48 h-48 mb-12">
                            <div className="absolute inset-0 border-4 border-[#E80000]/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                            <div className="absolute inset-4 border-4 border-t-[#E80000] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite]"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="material-symbols-outlined text-6xl text-[#E80000] animate-pulse">psychology</span>
                            </div>
                        </div>

                        <div className="w-full max-w-md space-y-2">
                            <div className="flex justify-between text-xs uppercase tracking-widest text-[#E80000]/70 font-mono mb-2">
                                <span>{t('systemAnalysis')}</span>
                                <span>{loadingStep * 20}%</span>
                            </div>
                            <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#E80000] transition-all duration-1000 ease-out"
                                    style={{ width: `${(loadingStep + 1) * 20}%` }}
                                ></div>
                            </div>
                            <p className="text-center text-gray-400 mt-4 font-mono text-sm animate-pulse">
                                {loadingSteps[loadingStep]}...
                            </p>
                        </div>
                    </div>
                )}

                {/* Results View */}
                {result && !isAnalyzing && (
                    <div className="grid lg:grid-cols-2 gap-16 items-center animate-in slide-in-from-bottom-10 fade-in duration-1000">

                        {/* Visualization Side */}
                        <div className="relative flex justify-center lg:justify-end order-2 lg:order-1">
                            <div className="absolute inset-0 bg-[#E80000]/5 blur-[60px] rounded-full"></div>
                            <div className="relative z-10 bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 aspect-square flex items-center justify-center shadow-2xl">
                                <RadarChart stats={result.stats} size={400} />
                            </div>
                        </div>

                        {/* Content Side */}
                        <div className="order-1 lg:order-2 space-y-8 text-center lg:text-left">
                            <div>
                                <div className="inline-block px-4 py-1 rounded-full bg-[#E80000]/10 border border-[#E80000]/30 text-[#E80000] text-xs font-bold uppercase tracking-[0.2em] mb-4">
                                    Analysis Complete
                                </div>
                                <h2 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight leading-none text-glow">
                                    {t(`types.${result.type}`)}
                                </h2>
                                <p className="text-xl text-gray-400 leading-relaxed font-light border-l-4 border-[#E80000] pl-6 ml-4 lg:ml-0 text-left">
                                    {t(`types.${result.type}_desc`)}
                                </p>
                            </div>

                            {/* Stat Cards Mini */}
                            <div className="grid grid-cols-2 gap-4 pt-8">
                                <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('accuracy')}</div>
                                    <div className="text-2xl font-bold text-white">{result.stats.accuracy}%</div>
                                </div>
                                <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('speed')}</div>
                                    <div className="text-2xl font-bold text-white">{result.stats.speed}<span className="text-sm text-gray-600">/100</span></div>
                                </div>
                                <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('logic')}</div>
                                    <div className="text-2xl font-bold text-white">{result.stats.complexity}<span className="text-sm text-gray-600">/100</span></div>
                                </div>
                                <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('resilience')}</div>
                                    <div className="text-2xl font-bold text-white">{result.stats.persistence}<span className="text-sm text-gray-600">/100</span></div>
                                </div>
                            </div>

                            <div className="pt-8">
                                <button
                                    onClick={handleAnalyze}
                                    className="text-sm font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-2 mx-auto lg:mx-0"
                                >
                                    <span className="material-symbols-outlined">refresh</span>
                                    {t('reanalyze')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
