"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

export default function PricingPage() {
    const t = useTranslations('PRICING');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="min-h-screen bg-black text-[#E6E6E6] relative overflow-hidden font-display selection:bg-red-900/40">
            <Navbar />

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black opacity-80"></div>
            </div>

            <main className="relative z-10 pt-32 px-6 lg:px-12 flex flex-col items-center">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16 max-w-2xl"
                >
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-500 mb-4 tracking-tighter">
                        {t('TITLE')}
                    </h1>
                    <p className="text-xl text-gray-400 font-light tracking-wide">
                        {t('SUBTITLE')}
                    </p>
                </motion.div>

                {/* Billing Toggle */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 mb-16 bg-[#111] p-1.5 rounded-full border border-[#222]"
                >
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-[#222] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {t('MONTHLY')}
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-[#222] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {t('YEARLY')}
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                            {t('DISCOUNT')}
                        </span>
                    </button>
                </motion.div>

                {/* Plans Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full"
                >
                    {/* Free Plan */}
                    <motion.div variants={itemVariants} className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl opacity-50 blur group-hover:opacity-75 transition duration-500"></div>
                        <div className="relative h-full bg-[#080808] border border-[#222] rounded-2xl p-8 flex flex-col hover:border-gray-700 transition-colors duration-300">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">{t('FREE.NAME')}</h3>
                                <p className="text-gray-500 text-sm">{t('FREE.DESC')}</p>
                            </div>
                            <div className="mb-8">
                                <span className="text-4xl font-bold text-white">{t('FREE.PRICE')}</span>
                                <span className="text-gray-500 text-sm ml-2">/ month</span>
                            </div>

                            <ul className="flex-1 space-y-4 mb-8">
                                {(t.raw('FREE.FEATURES') as string[]).map((feature: string, i: number) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-400">
                                        <span className="material-symbols-outlined text-gray-600 text-[20px]">check_circle</span>
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className="w-full py-3 rounded-lg border border-[#333] text-white font-bold hover:bg-[#111] transition-all duration-300">
                                {t('FREE.BTN')}
                            </button>
                        </div>
                    </motion.div>

                    {/* Premium Plan */}
                    <motion.div variants={itemVariants} className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-900 rounded-2xl opacity-75 blur group-hover:opacity-100 transition duration-500 animate-pulse"></div>
                        <div className="relative h-full bg-[#0A0A0A] rounded-2xl p-8 flex flex-col border border-red-900/30 overflow-hidden">

                            {/* Pro Badge */}
                            <div className="absolute top-0 right-0 p-4">
                                <span className="material-symbols-outlined text-red-500 opacity-20 text-6xl">local_fire_department</span>
                            </div>

                            <div className="mb-6 relative z-10">
                                <h3 className="text-2xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-amber-500 mb-2">
                                    {t('PREMIUM.NAME')}
                                </h3>
                                <p className="text-gray-400 text-sm">{t('PREMIUM.DESC')}</p>
                            </div>

                            <div className="mb-8 relative z-10">
                                <div className="flex items-end gap-1">
                                    <span className="text-5xl font-bold text-white tracking-tight">
                                        {billingCycle === 'yearly' ? '23.99 ₼' : t('PREMIUM.PRICE')}
                                    </span>
                                    <span className="text-gray-500 text-sm mb-1">/ month</span>
                                </div>
                                {billingCycle === 'yearly' && (
                                    <p className="text-xs text-green-500 mt-2 font-mono">Billed annually (Save 72 ₼)</p>
                                )}
                            </div>

                            <ul className="flex-1 space-y-4 mb-8 relative z-10">
                                {(t.raw('PREMIUM.FEATURES') as string[]).map((feature: string, i: number) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-300">
                                        <span className="material-symbols-outlined text-red-500 text-[20px]">check_circle</span>
                                        <span className="text-sm font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className="relative z-10 w-full py-4 rounded-lg bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:scale-[1.02] transition-all duration-300 active:scale-95">
                                {t('PREMIUM.BTN')}
                            </button>
                        </div>
                    </motion.div>

                </motion.div>

                <div className="mt-16 mb-10 text-center">
                    <p className="text-gray-600 text-sm">
                        Enterprise or School? <a href="#" className="text-red-500 hover:underline underline-offset-4">Contact Sales</a> for volume licensing.
                    </p>
                </div>

            </main>
        </div>
    );
}
