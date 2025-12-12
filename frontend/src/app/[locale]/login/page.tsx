'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

export default function LoginPage() {
    const t = useTranslations('login');
    const { login } = useAuth();
    const params = useParams();
    const locale = params.locale || 'en';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Check for URL query params (OAuth callback)
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const authError = searchParams.get('error');

        if (token) {
            // OAuth successful
            localStorage.setItem('conjudge-token', token);
            // Force reload/redirect to dashboard to trigger AuthContext init
            window.location.href = `/${locale}/dashboard`;
        }

        if (authError) {
            setError(t('authFailed') || 'Authentication failed');
        }
    }, [searchParams, locale, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/google`;
    };

    const handleGithubLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/github`;
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-black px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 flex justify-center">
                    <Link href={`/${locale}`} className="flex items-center gap-3">
                        <svg className="h-10 w-10 text-[#E80000]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                        <h2 className="text-2xl font-bold text-white">ConJudge</h2>
                    </Link>
                </div>

                {/* Login Card */}
                <div className="rounded-xl border border-white/10 bg-[#0D0D0D] p-8 shadow-2xl">
                    <div className="mb-6 text-center">
                        <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
                        <p className="mt-2 text-sm text-[#E6E6E6]">{t('subtitle')}</p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                                {t('email')} / Username
                            </label>
                            <input
                                id="email"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-lg bg-black border border-white/20 px-4 py-3 text-white placeholder-[#E6E6E6]/50 focus:border-[#E80000] focus:outline-none focus:ring-2 focus:ring-[#E80000]/50 transition-all"
                                placeholder="Email or Username"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                                {t('password')}
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded-lg bg-black border border-white/20 px-4 py-3 text-white placeholder-[#E6E6E6]/50 focus:border-[#E80000] focus:outline-none focus:ring-2 focus:ring-[#E80000]/50 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-[#E6E6E6] cursor-pointer">
                                <input type="checkbox" className="rounded border-white/20 bg-black text-[#E80000] focus:ring-[#E80000]" />
                                <span>{t('rememberMe')}</span>
                            </label>
                            <Link href={`/${locale}/forgot-password`} className="text-[#E80000] hover:text-[#FF1A1A] transition-colors">
                                {t('forgotPassword')}
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="gradient-button w-full rounded-lg py-3 px-4 text-base font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Loading...' : t('loginButton')}
                        </button>

                        <div className="relative flex items-center justify-center my-6">
                            <div className="absolute w-full border-t border-white/10"></div>
                            <span className="relative bg-[#0D0D0D] px-2 text-xs text-gray-400 uppercase">
                                {t('orContinueWith')}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 py-3 hover:bg-white/10 transition-colors"
                            >
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.053-3.24 2.08-2.16 2.72-5.187 2.72-7.667 0-.747-.053-1.467-.147-2.173H12.48z" />
                                </svg>
                                <span className="text-sm font-medium">{t('google')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleGithubLogin}
                                className="flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 py-3 hover:bg-white/10 transition-colors"
                            >
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.42-1.305.763-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                                <span className="text-sm font-medium">{t('github')}</span>
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-[#E6E6E6]">
                        {t('noAccount')}{' '}
                        <Link href={`/${locale}/signup`} className="font-bold text-[#E80000] hover:text-[#FF1A1A] transition-colors">
                            {t('signUpLink')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
