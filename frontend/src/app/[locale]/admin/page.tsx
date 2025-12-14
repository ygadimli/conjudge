
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';

// Sub Components
import AdminDashboard from '@/components/Admin/AdminDashboard';
import AdminProblems from '@/components/Admin/AdminProblems';
import AdminContests from '@/components/Admin/AdminContests';
import AdminUsers from '@/components/Admin/AdminUsers';
import AdminAnnouncements from '@/components/Admin/AdminAnnouncements';
import AdminSubmissions from '@/components/Admin/AdminSubmissions';

type Tab = 'DASHBOARD' | 'PROBLEMS' | 'CONTESTS' | 'USERS' | 'ANNOUNCEMENTS' | 'SUBMISSIONS';

export default function AdminPage() {
    const t = useTranslations('admin');
    const tNav = useTranslations('nav'); // For submissions key
    const { user, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'en';
    const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');

    useEffect(() => {
        if (!loading && (!user || user.role !== 'ADMIN')) {
            router.push(`/${locale}`);
        }
    }, [user, loading, router, locale]);

    if (loading || !user || user.role !== 'ADMIN') {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">{t('checkingPermissions')}</div>;
    }

    const tabs = [
        { id: 'DASHBOARD', label: t('overview') },
        { id: 'PROBLEMS', label: t('problems') },
        { id: 'CONTESTS', label: t('contests') },
        { id: 'USERS', label: t('users') },
        { id: 'ANNOUNCEMENTS', label: t('announcements') },
        { id: 'SUBMISSIONS', label: tNav('submissions') }
    ];

    return (
        <div className="min-h-screen bg-black text-[#E6E6E6]">
            <Navbar />

            <div className="max-w-7xl mx-auto py-12 px-4">
                <h1 className="text-3xl font-bold mb-8 text-[#E80000]">{t('title')}</h1>

                {/* Tabs Navigation */}
                <div className="flex gap-2 mb-8 border-b border-white/10 pb-1 overflow-x-auto hide-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`px-4 py-2 rounded-t-lg font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-[#1A1A1A] text-white border-t border-x border-white/10'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="min-h-[500px]">
                    {activeTab === 'DASHBOARD' && <AdminDashboard />}
                    {activeTab === 'PROBLEMS' && <AdminProblems />}
                    {activeTab === 'CONTESTS' && <AdminContests />}
                    {activeTab === 'USERS' && <AdminUsers />}
                    {activeTab === 'ANNOUNCEMENTS' && <AdminAnnouncements />}
                    {activeTab === 'SUBMISSIONS' && <AdminSubmissions />}
                </div>
            </div>
        </div>
    );
}
