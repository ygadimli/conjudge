'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Submission {
    id: string;
    code: string;
    language: string;
    status: string;
    score: number;
    runtime: number;
    createdAt: string;
    problem: {
        id: string;
        title: string;
    };
    user: {
        username: string;
    };
}

export default function SubmissionPage() {
    const params = useParams();
    const router = useRouter();
    const { id, locale } = params;
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/submissions/${id}`);

                if (res.ok) {
                    const data = await res.json();
                    setSubmission(data.submission);
                } else {
                    setError('Submission not found');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load submission');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchSubmission();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    if (error || !submission) return <div className="min-h-screen bg-black text-white flex items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Submission Details</h1>
                    <Link
                        href={`/${locale}/problems/${submission.problem.id}`}
                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Problem
                    </Link>
                </div>

                <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-6 mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        <div>
                            <span className="text-gray-500 text-sm block mb-1">Status</span>
                            <span className={`font-bold text-lg ${submission.status === 'AC' ? 'text-green-500' : 'text-red-500'}`}>
                                {submission.status}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm block mb-1">Score</span>
                            <span className="font-bold text-lg">{submission.score}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm block mb-1">Time</span>
                            <span className="font-bold text-lg">{submission.runtime} ms</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm block mb-1">Language</span>
                            <span className="font-bold text-lg">{submission.language}</span>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Source Code</h2>
                            <button
                                onClick={() => navigator.clipboard.writeText(submission.code)}
                                className="text-xs bg-white/10 px-3 py-1.5 rounded hover:bg-white/20 transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                        <div className="bg-[#151515] rounded-lg p-4 overflow-x-auto border border-white/10">
                            <pre className="font-mono text-sm text-gray-300">
                                <code>{submission.code}</code>
                            </pre>
                        </div>
                    </div>
                </div>

                <div className="text-center text-gray-500 text-sm">
                    Submitted by <span className="text-white font-bold">{submission.user.username}</span> on {new Date(submission.createdAt).toLocaleString()}
                </div>
            </main>
        </div>
    );
}
