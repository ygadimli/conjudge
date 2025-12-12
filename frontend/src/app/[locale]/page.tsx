'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function HomePage() {
    const t = useTranslations();
    const params = useParams();
    const locale = params.locale || 'en';
    const [announcements, setAnnouncements] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/announcements`)
            .then(res => res.ok ? res.json() : [])
            .then(data => setAnnouncements(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-black">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-sm">
                {/* Announcements Banner */}
                {announcements.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-blue-900/50 border-b border-white/10">
                        {announcements.map(ann => (
                            <div key={ann.id} className="max-w-7xl mx-auto px-4 py-2 text-center text-sm">
                                <span className={`font-bold mr-2 ${ann.type === 'IMPORTANT' ? 'text-red-400' :
                                    ann.type === 'WARNING' ? 'text-yellow-400' : 'text-blue-400'
                                    }`}>[{ann.type}]</span>
                                <span className="text-gray-200 font-bold">{ann.title}</span>
                                <span className="mx-2 text-gray-500">-</span>
                                <span className="text-gray-300">{ann.content}</span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
                    <div className="flex items-center gap-4">
                        {/* Logo SVG */}
                        <svg className="h-8 w-8 text-[#E80000]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                        <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] text-white">ConJudge</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-9">
                        <a className="text-sm font-medium leading-normal text-white hover:text-[#E80000] transition-colors" href="#features">{t('nav.features')}</a>
                        <a className="text-sm font-medium leading-normal text-white hover:text-[#E80000] transition-colors" href="#braintype">{t('nav.braintype')}</a>
                        <a className="text-sm font-medium leading-normal text-white hover:text-[#E80000] transition-colors" href="#mission">{t('nav.mission')}</a>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-24 md:py-40">
                    <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAYCUU-JOEfgE923vrleOo0gZqeSE4bQTNwVvo32lhyXt6ee6utIGvEB_SVpStbqBD7m238opWxOyq1UrojPEij0yjeTd0giqGSG2FV7klq-njP3ql74ZTonfMMv74BKFLr_evdIe93xfCVO-Brqfj6oPm_Lvjrt1uG45WXPMuNJkAjemXEp8wNYEBvL5ZDi3uCknrzeZVEhJ-FOkLWYiG_KNdGNeZMAK7K-V3OTjaODsRldMhO_1jIcGZ7WswQNENMuf7qkTqpPZWQ")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black"></div>
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="flex flex-col gap-6 max-w-4xl">
                                <h1 className="text-5xl font-black leading-tight tracking-tighter text-white sm:text-6xl md:text-8xl">
                                    {t('hero.title')} <span className="text-[#E80000] text-glow">{t('hero.evolution')}</span>
                                </h1>
                                <h2 className="text-lg font-normal leading-relaxed text-[#E6E6E6] md:text-xl">
                                    {t('hero.subtitle')}
                                </h2>
                            </div>
                            <div className="mt-10 flex flex-wrap justify-center gap-4">
                                <Link href={`/${locale}/signup`} className="gradient-button flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-base font-bold leading-normal tracking-[0.015em] text-white">
                                    <span className="truncate">{t('hero.getStarted')}</span>
                                </Link>
                                <Link href={`/${locale}/login`} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#0D0D0D] border border-white/20 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-white/10 transition-colors">
                                    <span className="truncate">{t('hero.login')}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 md:py-28 bg-[#0D0D0D]" id="features">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-12">
                            <div className="flex flex-col gap-4 text-center">
                                <h1 className="text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl">
                                    {t('features.title')}
                                </h1>
                                <p className="text-base font-normal leading-normal text-[#E6E6E6] max-w-3xl mx-auto">
                                    {t('features.subtitle')}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {/* AI Analysis */}
                                <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-black p-6">
                                    <span className="material-symbols-outlined text-[#E80000] text-4xl">code</span>
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-xl font-bold leading-tight text-white">{t('features.aiAnalysis.title')}</h2>
                                        <p className="text-sm font-normal leading-normal text-[#E6E6E6]">{t('features.aiAnalysis.description')}</p>
                                    </div>
                                </div>
                                {/* Real-Time Battles */}
                                <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-black p-6">
                                    <span className="material-symbols-outlined text-[#E80000] text-4xl">swords</span>
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-xl font-bold leading-tight text-white">{t('features.realTimeBattles.title')}</h2>
                                        <p className="text-sm font-normal leading-normal text-[#E6E6E6]">{t('features.realTimeBattles.description')}</p>
                                    </div>
                                </div>
                                {/* Dynamic Difficulty */}
                                <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-black p-6">
                                    <span className="material-symbols-outlined text-[#E80000] text-4xl">trending_up</span>
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-xl font-bold leading-tight text-white">{t('features.dynamicDifficulty.title')}</h2>
                                        <p className="text-sm font-normal leading-normal text-[#E6E6E6]">{t('features.dynamicDifficulty.description')}</p>
                                    </div>
                                </div>
                                {/* Automated Problems */}
                                <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-black p-6">
                                    <span className="material-symbols-outlined text-[#E80000] text-4xl">autorenew</span>
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-xl font-bold leading-tight text-white">{t('features.automatedProblems.title')}</h2>
                                        <p className="text-sm font-normal leading-normal text-[#E6E6E6]">{t('features.automatedProblems.description')}</p>
                                    </div>
                                </div>
                                {/* BrainType Ranking */}
                                <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-black p-6" id="braintype">
                                    <span className="material-symbols-outlined text-[#E80000] text-4xl">psychology</span>
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-xl font-bold leading-tight text-white">{t('features.brainTypeRanking.title')}</h2>
                                        <p className="text-sm font-normal leading-normal text-[#E6E6E6]">{t('features.brainTypeRanking.description')}</p>
                                    </div>
                                </div>
                                {/* Community Driven */}
                                <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-black p-6">
                                    <span className="material-symbols-outlined text-[#E80000] text-4xl">groups</span>
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-xl font-bold leading-tight text-white">{t('features.communityDriven.title')}</h2>
                                        <p className="text-sm font-normal leading-normal text-[#E6E6E6]">{t('features.communityDriven.description')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-20 md:py-28 bg-black" id="mission">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="flex flex-col gap-4">
                                <h2 className="text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl">{t('mission.title')}</h2>
                                <p className="text-base font-normal leading-relaxed text-[#E6E6E6]">{t('mission.description')}</p>
                            </div>
                            <div className="flex justify-center">
                                <svg className="w-48 h-48 text-[#E80000]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 md:py-28 bg-[#0D0D0D]">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-end gap-8 text-center">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl max-w-3xl">
                                    {t('cta.title')}
                                </h1>
                                <p className="text-base font-normal leading-normal text-[#E6E6E6] max-w-lg mx-auto">{t('cta.subtitle')}</p>
                            </div>
                            <div className="flex w-full max-w-md flex-wrap justify-center gap-4">
                                <Link href={`/${locale}/signup`} className="gradient-button flex grow cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 text-base font-bold leading-normal tracking-[0.015em] text-white">
                                    <span className="truncate">{t('cta.signUp')}</span>
                                </Link>
                                <Link href={`/${locale}/login`} className="flex grow cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-black border border-white/20 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-white/10 transition-colors">
                                    <span className="truncate">{t('cta.login')}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-black">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex flex-col items-center gap-6 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <a className="text-base font-normal leading-normal text-[#E6E6E6] hover:text-[#E80000] transition-colors min-w-40" href="#">{t('footer.terms')}</a>
                            <a className="text-base font-normal leading-normal text-[#E6E6E6] hover:text-[#E80000] transition-colors min-w-40" href="#">{t('footer.privacy')}</a>
                            <a className="text-base font-normal leading-normal text-[#E6E6E6] hover:text-[#E80000] transition-colors min-w-40" href="#">{t('footer.contact')}</a>
                        </div>
                        <p className="text-base font-normal leading-normal text-[#E6E6E6]/60">{t('footer.copyright')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
