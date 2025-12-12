'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'INFO' | 'WARNING' | 'IMPORTANT' | 'CONTEST';
    active: boolean;
    createdAt: string;
}

export default function AnnouncementsPage() {
    const params = useParams();
    const locale = params.locale || 'en';
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [filter, setFilter] = useState<string>('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/announcements/all`);
            if (res.ok) {
                const data = await res.json();
                setAnnouncements(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAnnouncements = filter === 'ALL'
        ? announcements
        : announcements.filter(a => a.type === filter);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'IMPORTANT': return 'from-red-500/20 to-red-900/20 border-red-500/30';
            case 'WARNING': return 'from-yellow-500/20 to-yellow-900/20 border-yellow-500/30';
            case 'CONTEST': return 'from-purple-500/20 to-purple-900/20 border-purple-500/30';
            default: return 'from-blue-500/20 to-blue-900/20 border-blue-500/30';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'IMPORTANT': return 'error';
            case 'WARNING': return 'warning';
            case 'CONTEST': return 'emoji_events';
            default: return 'info';
        }
    };

    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'IMPORTANT': return 'bg-red-500/20 text-red-500 border-red-500/50';
            case 'WARNING': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
            case 'CONTEST': return 'bg-purple-500/20 text-purple-500 border-purple-500/50';
            default: return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
        }
    };

    return (
        <div className="min-h-screen bg-black text-[#E6E6E6]">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-[#E80000] to-red-600 bg-clip-text text-transparent">
                        Announcements & Events
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Stay updated with the latest contests, updates, and important news
                    </p>
                </div>

                {/* Filters */}
                <div className="flex justify-center gap-3 mb-8 flex-wrap">
                    {['ALL', 'CONTEST', 'IMPORTANT', 'WARNING', 'INFO'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${filter === type
                                    ? 'bg-[#E80000] text-white shadow-lg shadow-red-500/50'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Announcements Grid */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading announcements...</div>
                ) : filteredAnnouncements.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-6xl text-gray-700 mb-4">notifications_off</span>
                        <p className="text-gray-500">No announcements found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAnnouncements.map(announcement => (
                            <div
                                key={announcement.id}
                                className={`bg-gradient-to-br ${getTypeColor(announcement.type)} border rounded-xl p-6 backdrop-blur-sm hover:scale-105 transition-transform duration-300 group relative overflow-hidden`}
                            >
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Type Badge */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getTypeBadgeColor(announcement.type)}`}>
                                            <span className="material-symbols-outlined text-sm">{getTypeIcon(announcement.type)}</span>
                                            {announcement.type}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(announcement.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#E80000] transition-colors">
                                        {announcement.title}
                                    </h3>

                                    {/* Content */}
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {announcement.content}
                                    </p>

                                    {/* Active Indicator */}
                                    {announcement.active && (
                                        <div className="mt-4 flex items-center gap-2 text-green-500 text-xs">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            Active
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
