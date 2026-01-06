'use client';

import { useState, useEffect, memo } from 'react';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import BrainTypeRadar from '@/components/Profile/RadarChart';

// --- Types ---
interface BrainStats {
    accuracy: number;
    speed: number;
    complexity: number;
    persistence: number;
}

interface SourceStats {
    name: string;
    success: boolean;
    details?: string;
    rating?: number;
    solved?: number;
    error?: string;
}

// --- Independent Components to prevent re-renders ---

const StatBar = memo(({ label, percent, color = "bg-[#E80000]" }: { label: string, percent: number, color?: string }) => (
    <div className="mb-2">
        <div className="flex justify-between text-xs uppercase font-bold text-gray-500 mb-1">
            <span>{label}</span>
            <span>{Math.round(percent)}%</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div style={{ width: `${percent}%` }} className={`h-full ${color} rounded-full`}></div>
        </div>
    </div>
));
StatBar.displayName = 'StatBar';

const ConnectionRow = memo(({
    label,
    value,
    onChange,
    placeholder,
    required = false,
    icon
}: {
    label: string,
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
    required?: boolean,
    icon?: React.ReactNode
}) => {
    const isConnected = value.trim().length > 0;
    return (
        <div className="flex items-center gap-4 bg-[#111] p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all group">
            <div className="w-8 h-8 flex items-center justify-center rounded bg-gray-900 text-gray-400 group-hover:text-white transition-colors">
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
                    {isConnected ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                            <span className="material-symbols-outlined text-sm">edit_square</span> Ready
                        </span>
                    ) : (
                        <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                            {required ? 'Required' : 'Optional'}
                        </span>
                    )}
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-white font-mono text-sm outline-none placeholder-gray-700"
                />
            </div>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gray-800'}`}></div>
        </div>
    );
});
ConnectionRow.displayName = 'ConnectionRow';

// --- Input Section Component ---
const InputSection = memo(({ onAnalyze }: { onAnalyze: (handles: { cf: string, at: string, cses: string, eolymp: string }) => void }) => {
    const [handles, setHandles] = useState({ cf: '', at: '', cses: '', eolymp: '' });

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-1 overflow-hidden shadow-2xl">
                <div className="bg-[#111] px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#E80000]">link</span>
                        Connect Profiles
                    </h2>
                    <span className="text-xs text-gray-500 font-mono">SECURE • PUBLIC DATA ONLY</span>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-400 mb-6 font-mono">
                        Link your competitive accounts to generate a comprehensive Multi-Platform Intelligence Profile.
                    </p>

                    <div className="space-y-3">
                        <ConnectionRow
                            label="Codeforces"
                            value={handles.cf}
                            onChange={(v) => setHandles({ ...handles, cf: v })}
                            placeholder="Enter handle (e.g. tourist)"
                            icon={<div className="flex gap-[1px] items-end h-[14px]"><div className="w-1 h-2 bg-[#FFC107] rounded-sm" /><div className="w-1 h-3 bg-[#2196F3] rounded-sm" /><div className="w-1 h-2 bg-[#F44336] rounded-sm" /></div>}
                        />
                        <ConnectionRow
                            label="AtCoder"
                            value={handles.at}
                            onChange={(v) => setHandles({ ...handles, at: v })}
                            placeholder="Enter handle"
                            icon={<span className="font-bold text-white text-xs">At</span>}
                        />
                        <ConnectionRow
                            label="CSES"
                            value={handles.cses}
                            onChange={(v) => setHandles({ ...handles, cses: v })}
                            placeholder="User ID or Handle"
                            icon={<span className="font-bold text-orange-500 text-[10px]">CSES</span>}
                        />
                        <ConnectionRow
                            label="E-olymp"
                            value={handles.eolymp}
                            onChange={(v) => setHandles({ ...handles, eolymp: v })}
                            placeholder="Username"
                            icon={<span className="font-bold text-green-500 text-[10px]">EO</span>}
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="material-symbols-outlined text-sm">info</span>
                            <span>At least one platform required</span>
                        </div>
                        <button
                            onClick={() => onAnalyze(handles)}
                            disabled={!handles.cf && !handles.at && !handles.cses && !handles.eolymp}
                            className="bg-[#E80000] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-base">psychology</span>
                            Analyze Brain Type
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});
InputSection.displayName = 'InputSection';

// --- Main Page ---
export default function BrainTypePage() {
    const t = useTranslations('braintype');
    const { user } = useAuth();

    // State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<{
        type: string;
        secondaryType?: string;
        description: string;
        stats: BrainStats;
        sources: SourceStats[]
    } | null>(null);

    // Loading Logic
    const [loadingStep, setLoadingStep] = useState(0);
    const loadingMessages = [
        "Fetching Codeforces data",
        "Processing AtCoder performance",
        "Evaluating problem-solving patterns",
        "Building intelligence profile"
    ];

    useEffect(() => {
        if (isAnalyzing) {
            const interval = setInterval(() => {
                setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
            }, 1000); // Faster feedback
            return () => clearInterval(interval);
        }
    }, [isAnalyzing]);

    const handleAnalyze = async (handles: { cf: string, at: string, cses: string, eolymp: string }) => {
        setIsAnalyzing(true);
        setLoadingStep(0);
        setResult(null);

        // Minimum animation time
        const minTimePromise = new Promise(resolve => setTimeout(resolve, 3500));

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/braintype/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    ...handles
                })
            });

            if (res.ok) {
                const data = await res.json();
                await minTimePromise;
                setResult({
                    type: data.brainType,
                    secondaryType: data.secondaryType || "The Contest Warrior",
                    description: data.description,
                    stats: data.stats,
                    sources: data.sources || []
                });
            } else {
                console.error("Analysis failed");
                await minTimePromise;
            }
        } catch (error) {
            console.error("Error analyzing:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Helper: Parse tags from backend details string for bars
    const getTagData = (details: string | undefined) => {
        if (!details) return [];
        // Expected format: "Top Tags: DP(5), Math(3)..."
        const match = details.match(/Top Tags: (.+)/);
        if (!match) return [];

        return match[1].split(',').map(tagStr => {
            const [name, countStr] = tagStr.trim().split('(');
            const count = parseInt(countStr?.replace(')', '') || '0');
            return { name, count, percent: Math.min(100, count * 5) }; // Mock percent scaling
        });
    };

    return (
        <div className="min-h-screen bg-[#050505] text-[#E6E6E6] font-sans selection:bg-[#E80000] selection:text-white pb-20">
            <Navbar />

            {/* 2. TOP SUB-HEADER (Breadcrumb style) */}
            <div className="border-b border-white/5 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-gray-500">
                    <span className="hover:text-white cursor-pointer transition-colors">CONJUDGE</span>
                    <span>/</span>
                    <span className="text-[#E80000] font-bold">Brain Type Analyzer</span>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">

                {/* 4. LOADING STATE */}
                {isAnalyzing ? (
                    <div className="max-w-2xl mx-auto py-20">
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-8">
                            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                                <div className="animate-spin w-6 h-6 border-2 border-[#E80000] border-t-transparent rounded-full"></div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Analyzing competitive behavior...</h2>
                            </div>
                            <div className="space-y-4 font-mono text-sm">
                                {loadingMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex items-center gap-3 transition-all duration-500 ${idx <= loadingStep ? 'opacity-100' : 'opacity-30'}`}>
                                        <span className={`material-symbols-outlined text-base ${idx < loadingStep ? 'text-green-500' : (idx === loadingStep ? 'text-[#E80000] animate-pulse' : 'text-gray-600')}`}>
                                            {idx < loadingStep ? 'check_circle' : (idx === loadingStep ? 'radio_button_checked' : 'radio_button_unchecked')}
                                        </span>
                                        <span className={idx === loadingStep ? 'text-white' : 'text-gray-500'}>{msg}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : !result ? (
                    /* 3. INPUT SECTION */
                    <InputSection onAnalyze={handleAnalyze} />
                ) : (
                    /* 5. ANALYSIS RESULT */
                    <div className="space-y-12 animate-in fade-in duration-1000">
                        {/* HEADER */}
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
                                <div>
                                    <div className="text-xs font-bold text-[#E80000] tracking-widest uppercase mb-2">Brain Identity Summary</div>
                                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase leading-none tracking-tight">
                                        {t(`types.${result.type}`, { defaultValue: result.type })}
                                    </h1>
                                </div>
                                <div className="text-right space-y-2">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Confidence Level</div>
                                    <div className="flex items-center gap-2 justify-end">
                                        <div className="flex gap-1">
                                            {[...Array(8)].map((_, i) => <div key={i} className="w-2 h-4 bg-[#E80000] rounded-sm"></div>)}
                                            {[...Array(2)].map((_, i) => <div key={i} className="w-2 h-4 bg-[#222] rounded-sm"></div>)}
                                        </div>
                                        <span className="text-xl font-bold text-[#E80000]">82%</span>
                                    </div>
                                    <div className="text-[10px] text-gray-600 font-mono uppercase">
                                        Profiles: {result.sources.filter(s => s.success).map(s => s.name).join(' · ')}
                                    </div>
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                <div className="space-y-8">
                                    <div className="bg-[#111] border-l-4 border-white p-6 rounded-r-xl">
                                        <p className="text-xl text-gray-300 font-light leading-relaxed">
                                            "{t(`types.${result.type}_desc`, { defaultValue: result.description })}"
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-[#111]">
                                                <span className="material-symbols-outlined text-[#E80000]">military_tech</span>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Secondary Type</div>
                                                <div className="text-lg font-bold text-white">{t(`types.${result.secondaryType || "The Contest Warrior"}`, { defaultValue: result.secondaryType })}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center relative">
                                    <div className="absolute inset-0 bg-[#E80000]/10 blur-[80px] rounded-full pointer-events-none"></div>
                                    <div className="relative z-10 scale-90">
                                        <BrainTypeRadar stats={result.stats} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 6. PLATFORM ANALYSIS CARDS */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-8 border-l-4 border-[#E80000] pl-4 uppercase tracking-wider">Platform Analysis</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                {result.sources.map((source, index) => (
                                    <div key={index} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all group relative overflow-hidden">
                                        {/* Card Header */}
                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div>
                                                <h4 className="font-bold text-lg text-white">{source.name} Analysis</h4>
                                                <div className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-wider">
                                                    {source.success ? '✔ Profile found' : '✖ Not found'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dynamic Content based on source */}
                                        {source.success && (
                                            <div className="space-y-6 relative z-10">
                                                {/* Stats Row */}
                                                <div className="flex gap-4">
                                                    <div>
                                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Rating</div>
                                                        <div className="text-xl font-bold text-white">{source.rating ?? 'N/A'}</div>
                                                    </div>
                                                    {source.solved !== undefined && (
                                                        <div>
                                                            <div className="text-[10px] text-gray-500 uppercase font-bold">Solved</div>
                                                            <div className="text-xl font-bold text-white">{source.solved}</div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Visual Bars (Data-driven) */}
                                                <div className="mt-4">
                                                    {source.name === 'Codeforces' && (
                                                        <>
                                                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-3">Top Tags Distribution</div>
                                                            {getTagData(source.details).length > 0 ? (
                                                                getTagData(source.details).map((tag, i) => (
                                                                    <StatBar key={i} label={tag.name} percent={tag.percent} color="bg-[#FFC107]" />
                                                                ))
                                                            ) : (
                                                                <div className="text-xs text-gray-600 font-mono italic">
                                                                    Not enough public submission data or tags hidden.
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                    {source.name === 'AtCoder' && (
                                                        <>
                                                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-3">Performance Metrics</div>
                                                            {/* Use real rating as a "progress" bar relative to max 3000 */}
                                                            <StatBar label="Rating Progress" percent={Math.min(100, ((source.rating || 0) / 3000) * 100)} color="bg-white" />
                                                            <div className="text-xs text-gray-400 mt-2 font-mono">
                                                                {source.details?.split(',').find(s => s.trim().startsWith('Contests')) || 'Contests: N/A'}
                                                            </div>
                                                        </>
                                                    )}

                                                    {source.name === 'CSES' && (
                                                        <>
                                                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-3">Problem Set Progress</div>
                                                            {/* Approx 300 problems in CSES */}
                                                            <StatBar label="Completion" percent={Math.min(100, ((source.solved || 0) / 300) * 100)} color="bg-orange-500" />
                                                            <div className="text-xs text-gray-400 mt-2 font-mono">
                                                                {source.details?.split(',').find(s => s.trim().startsWith('Dominant')) || 'Diverse problem solving'}
                                                            </div>
                                                        </>
                                                    )}

                                                    {source.name === 'E-olymp' && (
                                                        <>
                                                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-3">Activity</div>
                                                            <StatBar label="Solved Ratio" percent={Math.min(100, ((source.solved || 0) / 1000) * 100)} color="bg-green-500" />
                                                            <div className="text-xs text-gray-400 mt-2 font-mono">
                                                                {source.details?.split(',').find(s => s.trim().startsWith('Style')) || 'Mixed Styles'}
                                                            </div>
                                                        </>
                                                    )}

                                                    {source.name === 'ConJudge' && (
                                                        <>
                                                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-3">Internal Performance</div>
                                                            <StatBar label="Accuracy" percent={result.stats.accuracy} color="bg-[#E80000]" />
                                                            <StatBar label="Speed" percent={result.stats.speed} color="bg-[#E80000]" />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {!source.success && (
                                            <div className="text-sm text-red-500 italic p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                                                {source.error || 'Profile could not be accessed. check spelling or privacy settings.'}
                                            </div>
                                        )}

                                        {/* Card background blob */}
                                        <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-20 pointer-events-none 
                                            ${source.name === 'Codeforces' ? 'bg-[#FFC107]' : ''}
                                            ${source.name === 'AtCoder' ? 'bg-white' : ''}
                                            ${source.name === 'CSES' ? 'bg-orange-500' : ''}
                                            ${source.name === 'E-olymp' ? 'bg-green-500' : ''}
                                            ${source.name === 'ConJudge' ? 'bg-[#E80000]' : ''}
                                        `}></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 9. SECONDARY FEATURES ACCORDION (Interactive Placeholders) */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Extended Analysis</span>
                                <div className="h-px bg-white/10 flex-1"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-[#111] border border-white/5 rounded-xl opacity-60 cursor-not-allowed group hover:border-white/10 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-gray-400 text-sm flex items-center gap-2 group-hover:text-gray-300">
                                            <span className="material-symbols-outlined text-lg">analytics</span> Raw Features
                                        </span>
                                        <span className="material-symbols-outlined text-gray-600">lock</span>
                                    </div>
                                    <p className="text-[10px] text-gray-600 font-mono">Detailed vector map of extraction logic.</p>
                                </div>

                                <div className="p-4 bg-[#111] border border-white/5 rounded-xl opacity-60 cursor-not-allowed group hover:border-white/10 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-gray-400 text-sm flex items-center gap-2 group-hover:text-gray-300">
                                            <span className="material-symbols-outlined text-lg">history</span> History
                                        </span>
                                        <span className="material-symbols-outlined text-gray-600">lock</span>
                                    </div>
                                    <p className="text-[10px] text-gray-600 font-mono">Timeline of your brain type evolution.</p>
                                </div>

                                <div className="p-4 bg-[#111] border border-white/5 rounded-xl opacity-60 cursor-not-allowed group hover:border-white/10 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-gray-400 text-sm flex items-center gap-2 group-hover:text-gray-300">
                                            <span className="material-symbols-outlined text-lg">compare_arrows</span> Compare
                                        </span>
                                        <span className="material-symbols-outlined text-gray-600">lock</span>
                                    </div>
                                    <p className="text-[10px] text-gray-600 font-mono">VS Mode against other coders.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={() => setResult(null)}
                                className="group text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5"
                            >
                                <span className="material-symbols-outlined group-hover:-rotate-180 transition-transform duration-500">refresh</span>
                                {t('reanalyze')}
                            </button>
                        </div>

                        {/* 10. FOOTER */}
                        <div className="border-t border-white/5 pt-8 text-center">
                            <p className="text-xs text-gray-600 flex items-center justify-center gap-2 font-mono">
                                <span className="material-symbols-outlined text-sm">info</span>
                                Analysis is based on publicly available data from provided profiles.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
