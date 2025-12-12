'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';

export default function CompleteProfilePage() {
    const { completeProfile } = useAuth();
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (username.length < 3) {
            setError('Username must be at least 3 characters long');
            setIsLoading(false);
            return;
        }

        try {
            await completeProfile(username);
        } catch (err: any) {
            setError(err.message || 'Failed to update username');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <div className="max-w-md w-full space-y-8 bg-[#0D0D0D] p-8 rounded-xl border border-white/10">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-white">
                        Complete Your Profile
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Choose a unique username to represent you on ConJudge.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-[#111] rounded-t-md rounded-b-md focus:outline-none focus:ring-[#E80000] focus:border-[#E80000] focus:z-10 sm:text-sm"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#E80000] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E80000] disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Continue to Dashboard'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
