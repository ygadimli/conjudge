"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function AiStudioPage() {
    const t = useTranslations('AI_STUDIO');
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('MEDIUM');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleGenerate = async () => {
        if (!topic) return;
        setLoading(true);
        setResult(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await axios.post(`${apiUrl}/admin/generate-problem`, {
                topic,
                difficulty
            });
            setResult(response.data.problem);
        } catch (error) {
            console.dir(error);
            const msg = (error as any).response?.data?.details || (error as any).response?.data?.error || 'Generation failed';
            alert(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-[#E6E6E6] font-display selection:bg-purple-900/40">
            <Navbar />

            <div className="pt-32 px-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/20 border border-purple-500/30 text-purple-400 text-xs font-mono mb-4">
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        AI POWERED
                    </div>
                    <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        {t('TITLE')}
                    </h1>
                    <p className="text-gray-500">{t('SUBTITLE')}</p>
                </div>

                {/* Controls */}
                <div className="bg-[#111] p-6 rounded-xl border border-[#222] mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">{t('TOPIC_LABEL')}</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder={t('TOPIC_PLACEHOLDER')}
                                className="w-full bg-[#080808] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">{t('DIFFICULTY_LABEL')}</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full bg-[#080808] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            >
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                                <option value="INSANE">Insane</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !topic}
                        className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${loading
                            ? 'bg-purple-900/50 text-purple-300 cursor-wait'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-[1.01]'
                            }`}
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">sync</span>
                                {t('BTN_GENERATING')}
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">auto_awesome</span>
                                {t('BTN_GENERATE')}
                            </>
                        )}
                    </button>
                </div>

                {/* Result Preview */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#111] border border-purple-500/30 rounded-xl overflow-hidden"
                    >
                        <div className="bg-purple-900/10 p-4 border-b border-purple-500/20 flex justify-between items-center">
                            <h2 className="font-bold text-purple-400 flex items-center gap-2">
                                <span className="material-symbols-outlined">check_circle</span>
                                {t('RESULT_TITLE')}
                            </h2>
                            <span className="text-xs font-mono bg-black/50 px-2 py-1 rounded text-gray-400">
                                ID: {result.id}
                            </span>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">{result.title}</h3>
                                <div className="flex gap-2 mb-4">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold 
                                        ${result.difficulty === 1 ? 'bg-green-500/20 text-green-400' :
                                            result.difficulty === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'}`}>
                                        {difficulty}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-xs bg-[#222] text-gray-400">
                                        Rating: {result.rating}
                                    </span>
                                </div>
                                <div className="prose prose-invert max-w-none text-gray-300 text-sm bg-black/30 p-4 rounded-lg border border-[#222]">
                                    <p className="whitespace-pre-wrap">{result.description}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
