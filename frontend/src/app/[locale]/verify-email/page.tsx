'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                return;
            }

            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/auth/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
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

        verify();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="flex flex-col items-center justify-center pt-32 px-4 text-center">
                {status === 'verifying' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-6"></div>
                        <h1 className="text-2xl font-bold">Verifying your email...</h1>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <span className="material-symbols-outlined text-green-500 text-6xl mb-4">check_circle</span>
                        <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
                        <p className="text-gray-400">Redirecting to login...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
                        <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
                        <p className="text-gray-400">Invalid or expired token.</p>
                    </>
                )}
            </div>
        </div>
    );
}
