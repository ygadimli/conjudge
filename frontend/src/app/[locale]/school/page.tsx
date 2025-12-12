'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function SchoolPage() {
    const t = useTranslations('school');
    const params = useParams();
    const locale = params.locale || 'en';

    const features = [
        { icon: 'domain', key: 'domain' },
        { icon: 'school', key: 'teacherPanel' },
        { icon: 'analytics', key: 'analytics' },
        { icon: 'emoji_events', key: 'contests' },
        { icon: 'shield', key: 'antiCheat' },
        { icon: 'assignment', key: 'homework' },
        { icon: 'leaderboard', key: 'scoreboard' },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-sm border-b border-white/10">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
                    <Link href={`/${locale}`} className="flex items-center gap-4">
                        <svg className="h-8 w-8 text-[#E80000]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                        <h2 className="text-2xl font-bold">ConJudge</h2>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href={`/${locale}/dashboard`} className="text-sm font-medium text-[#E6E6E6] hover:text-[#E80000] transition-colors">Dashboard</Link>
                        <Link href={`/${locale}/problems`} className="text-sm font-medium text-[#E6E6E6] hover:text-[#E80000] transition-colors">Problems</Link>
                        <Link href={`/${locale}/battles`} className="text-sm font-medium text-[#E6E6E6] hover:text-[#E80000] transition-colors">Battles</Link>
                        <Link href={`/${locale}/braintype`} className="text-sm font-medium text-[#E6E6E6] hover:text-[#E80000] transition-colors">BrainType</Link>
                    </nav>
                </div>
            </header>

            {/* Main */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E80000]/10 mb-6">
                        <span className="material-symbols-outlined text-[#E80000] text-5xl">school</span>
                    </div>
                    <h1 className="text-5xl font-black mb-6 text-glow">{t('title')}</h1>
                    <p className="text-xl text-[#E6E6E6] max-w-3xl mx-auto mb-4">{t('subtitle')}</p>
                    <p className="text-lg text-[#E6E6E6]/80 max-w-3xl mx-auto">{t('description')}</p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {features.map((feature) => (
                        <div key={feature.key} className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8 hover:border-[#E80000]/50 transition-all group">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-[#E80000]/10 flex items-center justify-center mb-4 group-hover:bg-[#E80000]/20 transition-all">
                                    <span className="material-symbols-outlined text-[#E80000] text-3xl">{feature.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-[#E80000] transition-colors">
                                    {t(`features.${feature.key}`)}
                                </h3>
                                <div className="h-1 w-16 bg-gradient-to-r from-[#E80000] to-transparent rounded-full"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Conclusion */}
                <div className="bg-gradient-to-br from-[#E80000] to-[#FF1A1A] rounded-2xl p-8 mb-12 text-center">
                    <span className="material-symbols-outlined text-white text-5xl mb-4 inline-block">rocket_launch</span>
                    <p className="text-xl text-white mb-6">{t('conclusion')}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="px-8 py-4 rounded-lg bg-white text-[#E80000] font-bold hover:bg-white/90 transition-all">
                            {t('createSchool')}
                        </button>
                        <button className="px-8 py-4 rounded-lg bg-black/30 text-white font-bold hover:bg-black/50 transition-all border border-white/20">
                            {t('manageSchool')}
                        </button>
                    </div>
                </div>

                {/* Pricing Example */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8 text-center">
                        <h3 className="text-2xl font-bold mb-4">Starter</h3>
                        <p className="text-4xl font-black text-[#E80000] mb-4">$99<span className="text-lg text-[#E6E6E6]/60">/mo</span></p>
                        <ul className="space-y-2 text-left text-[#E6E6E6]/80 mb-6">
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#E80000] text-sm">check</span> Up to 100 students</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#E80000] text-sm">check</span> Basic analytics</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#E80000] text-sm">check</span> 50 problems/month</li>
                        </ul>
                        <button className="w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 font-bold transition-all">Get Started</button>
                    </div>

                    <div className="bg-gradient-to-br from-[#E80000] to-[#FF1A1A] border-2 border-[#E80000] rounded-xl p-8 text-center transform scale-105">
                        <h3 className="text-2xl font-bold mb-4">Pro</h3>
                        <p className="text-4xl font-black text-white mb-4">$299<span className="text-lg text-white/80">/mo</span></p>
                        <ul className="space-y-2 text-left text-white/90 mb-6">
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">check</span> Up to 500 students</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">check</span> Advanced analytics</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">check</span> Unlimited problems</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">check</span> AI Problem Generator</li>
                        </ul>
                        <button className="w-full py-3 rounded-lg bg-white text-[#E80000] font-bold hover:bg-white/90 transition-all">Get Started</button>
                    </div>

                    <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8 text-center">
                        <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
                        <p className="text-4xl font-black text-[#E80000] mb-4">Custom</p>
                        <ul className="space-y-2 text-left text-[#E6E6E6]/80 mb-6">
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#E80000] text-sm">check</span> Unlimited students</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#E80000] text-sm">check</span> Full analytics suite</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#E80000] text-sm">check</span> White-label option</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#E80000] text-sm">check</span> Dedicated support</li>
                        </ul>
                        <button className="w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 font-bold transition-all">Contact Us</button>
                    </div>
                </div>
            </main>
        </div>
    );
}
