'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';

export default function Navbar() {
    const { user } = useAuth();
    const params = useParams();
    const locale = params.locale || 'en';
    const t = useTranslations('nav'); // We might need to add keys if they don't exist, falling back to literals for now for "My Profile Contests Battles Ranking Braintype"

    if (!user) return null; // Only show for logged in users

    return (
        <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-sm border-b border-white/10">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
                <Link href={`/${locale}/dashboard`} className="flex items-center gap-4">
                    <svg className="h-8 w-8 text-[#E80000]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
                    </svg>
                    <h2 className="text-2xl font-bold">ConJudge</h2>
                </Link>
                <nav className="hidden md:flex items-center gap-6">
                    <Link href={`/${locale}/profile/${user.username}`} className="text-sm font-medium text-[#E6E6E6] hover:text-[#E80000] transition-colors flex items-center gap-2">
                        {user.profilePicture ? (
                            <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${user.profilePicture}`} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-[#E80000] flex items-center justify-center text-[10px] font-bold text-white">
                                {user.username[0].toUpperCase()}
                            </div>
                        )}
                        {user.username}
                    </Link>
                    <Link href={`/${locale}/problems`} className="text-sm font-medium text-[#E6E6E6] hover:text-[#E80000] transition-colors">{t('problems')}</Link>
                    <Link href={`/${locale}/contests`} className="text-sm font-medium text-[#E6E6E6] hover:text-[#E80000] transition-colors">{t('contests')}</Link>
                    <Link href={`/${locale}/battles`} className="text-sm font-medium text-[#E6E6E6] hover:text-[#E80000] transition-colors">{t('battles')}</Link>
                    <Link href={`/${locale}/rankings`} className="text-sm font-medium text-[#E6E6E6] hover:text-[#E80000] transition-colors">{t('rankings')}</Link>
                    <Link href={`/${locale}/braintype`} className="text-sm font-medium text-[#E6E6E6] hover:text-[#E80000] transition-colors">{t('braintype')}</Link>
                    {user.role === 'ADMIN' && (
                        <Link href={`/${locale}/admin`} className="text-sm font-medium text-[#E80000] hover:text-[#FF1A1A] transition-colors">{t('admin')}</Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
