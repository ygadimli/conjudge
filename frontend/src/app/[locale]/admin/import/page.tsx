'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ImportProblemPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/problems/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('conjudge-token')}`
                },
                body: JSON.stringify({
                    url,
                    createdById: user?.id
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: `Problem "${data.problem.title}" imported successfully!` });
                setUrl('');
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to import problem' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Network error occurred' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p>Please login to access this page.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-black mb-8 text-[#E80000]">Import Problem from Codeforces</h1>

                <div className="bg-[#0D0D0D] p-8 rounded-xl border border-white/10">
                    <form onSubmit={handleImport} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Codeforces Problem URL
                            </label>
                            <input
                                type="url"
                                required
                                placeholder="https://codeforces.com/problemset/problem/123/A"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E80000] outline-none transition-colors"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Supports standard contest and problemset URLs.
                            </p>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#E80000] hover:bg-[#FF1A1A] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">cloud_download</span>
                                    Import Problem
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
