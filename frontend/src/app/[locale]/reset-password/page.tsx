
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const t = useTranslations('resetPasswordPage');
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert(t('mismatch'));
            return;
        }

        setStatus('loading');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            if (res.ok) {
                setStatus('success');
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        }
    };

    if (!token) return <div className="text-white text-center mt-20">Invalid Token</div>;

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-black px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <span className="material-symbols-outlined text-[#E80000] text-4xl mr-2">key</span>
                    <h2 className="text-2xl font-bold text-white">{t('title')}</h2>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#0D0D0D] p-8 shadow-2xl">
                    {status === 'success' ? (
                        <div className="text-center">
                            <span className="material-symbols-outlined text-green-500 text-5xl mb-4">check_circle</span>
                            <h3 className="text-xl font-bold text-white mb-2">{t('success')}</h3>
                            <p className="text-gray-400 mb-6">{t('successDesc')}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    {t('newPassword')}
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full rounded-lg bg-black border border-white/20 px-4 py-3 text-white focus:border-[#E80000] focus:outline-none focus:ring-2 focus:ring-[#E80000]/50"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    {t('confirmPassword')}
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full rounded-lg bg-black border border-white/20 px-4 py-3 text-white focus:border-[#E80000] focus:outline-none focus:ring-2 focus:ring-[#E80000]/50"
                                    placeholder="••••••••"
                                />
                            </div>

                            {status === 'error' && (
                                <div className="text-red-500 text-sm text-center">{t('error')}</div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="gradient-button w-full rounded-lg py-3 px-4 text-base font-bold text-white transition-all disabled:opacity-50"
                            >
                                {status === 'loading' ? t('resetting') : t('setNewPassword')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
