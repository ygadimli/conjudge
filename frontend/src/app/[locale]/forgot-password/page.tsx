'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ForgotPasswordPage() {
    const t = useTranslations('login'); // Reusing login translations or common
    const params = useParams();
    const locale = params.locale || 'en';
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-black px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <Link href={`/${locale}`} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#E80000] text-4xl">lock_reset</span>
                        <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                    </Link>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#0D0D0D] p-8 shadow-2xl">
                    {status === 'success' ? (
                        <div className="text-center">
                            <span className="material-symbols-outlined text-green-500 text-5xl mb-4">mail</span>
                            <h3 className="text-xl font-bold text-white mb-2">Check your email</h3>
                            <p className="text-gray-400 mb-6">We sent a reset link to your email address.</p>
                            <Link href={`/${locale}/login`} className="text-[#E80000] hover:text-[#FF1A1A]">
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 text-center">
                                <p className="text-gray-400">Enter your email or username to receive a reset link.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Email or Username
                                    </label>
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full rounded-lg bg-black border border-white/20 px-4 py-3 text-white focus:border-[#E80000] focus:outline-none focus:ring-2 focus:ring-[#E80000]/50"
                                        placeholder="Enter email or username"
                                    />
                                </div>

                                {status === 'error' && (
                                    <div className="text-red-500 text-sm text-center">User not found or error occurred.</div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="gradient-button w-full rounded-lg py-3 px-4 text-base font-bold text-white transition-all disabled:opacity-50"
                                >
                                    {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                                </button>

                                <div className="text-center mt-4">
                                    <Link href={`/${locale}/login`} className="text-sm text-gray-500 hover:text-white transition-colors">
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
