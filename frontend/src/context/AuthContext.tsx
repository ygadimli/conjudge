'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    username: string;
    email: string;
    brainType?: string;
    rating?: number;
    role?: string;
    needsUsernameSetup?: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (username: string, email: string, password: string) => Promise<void>;
    completeProfile: (username: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in (check localStorage or cookie)
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('conjudge-token');
                if (token) {
                    // Verify token with backend
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                    const res = await fetch(`${API_URL}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setUser(data.user);
                        localStorage.setItem('conjudge-user', JSON.stringify(data.user));

                        if (data.user.needsUsernameSetup) {
                            // Extract locale from current path to preserve language
                            const currentPath = window.location.pathname;
                            const locale = currentPath.split('/')[1] || 'en';
                            router.push(`/${locale}/complete-profile`);
                        }
                    } else {
                        // Token invalid/expired
                        localStorage.removeItem('conjudge-token');
                        localStorage.removeItem('conjudge-user');
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }

            const data = await response.json();

            // Store token and user data
            localStorage.setItem('conjudge-token', data.token);
            localStorage.setItem('conjudge-user', JSON.stringify(data.user));
            setUser(data.user);

            const locale = window.location.pathname.split('/')[1] || 'en';
            if (data.user.needsUsernameSetup) {
                router.push(`/${locale}/complete-profile`);
            } else {
                router.push(`/${locale}/dashboard`);
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (username: string, email: string, password: string) => {
        try {
            setLoading(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Signup failed');
            }

            const data = await response.json();

            // Signup usually returns message, not token immediately (needs verification)
            // But if it did return token:
            if (data.token) {
                localStorage.setItem('conjudge-token', data.token);
                localStorage.setItem('conjudge-user', JSON.stringify(data.user));
                setUser(data.user);
                const locale = window.location.pathname.split('/')[1] || 'en';
                router.push(`/${locale}/dashboard`);
            } else {
                // Redirect to login or verification page
                const locale = window.location.pathname.split('/')[1] || 'en';
                router.push(`/${locale}/login?verified=false`);
            }

        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const completeProfile = async (username: string) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('conjudge-token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const response = await fetch(`${API_URL}/api/auth/complete-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            const data = await response.json();

            // Update local user data
            localStorage.setItem('conjudge-user', JSON.stringify(data.user));
            setUser(data.user);

            const locale = window.location.pathname.split('/')[1] || 'en';
            router.push(`/${locale}/dashboard`);
        } catch (error) {
            console.error('Complete profile error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('conjudge-token');
        localStorage.removeItem('conjudge-user');
        setUser(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                signup,
                completeProfile,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
