'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTier, getTierColor } from '@/utils/rating';
import Heatmap from '@/components/Profile/Heatmap';
import RatingGraph from '@/components/Profile/RatingGraph';
import EditProfileModal from '@/components/Profile/EditProfileModal';
import UserListModal from '@/components/Profile/UserListModal';
import Navbar from '@/components/Navbar';
import RatingHistoryTable from '@/components/Profile/RatingHistoryTable';
import { getCountryFlag } from '@/utils/countries';

interface UserProfile {
    id: string;
    username: string;
    name?: string;
    email?: string;
    country?: string;
    city?: string;
    bio?: string;
    rating: number;
    battleRating: number;
    maxRating: number;
    brainType?: string;
    role: string;
    isBanned: boolean;
    createdAt: string;
    lastVisit: string;
    profilePicture?: string;
    _count: {
        submissions: number;
        followedBy: number;
        following: number;
        createdProblems: number;
    };
    globalRank: number;
    countryRank: number | string;
}

export default function ProfilePage() {
    const t = useTranslations('common');
    const { user: currentUser } = useAuth();
    const params = useParams();
    const locale = params.locale || 'en';
    const username = params.username as string;

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);

    // Social State
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [showUserList, setShowUserList] = useState<'Followers' | 'Following' | null>(null);
    const [userList, setUserList] = useState<any[]>([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/users/${username}`);

                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.user);
                    setHeatmapData(data.heatmap);
                    setRecentActivity(data.recentActivity || []);
                    setFollowersCount(data.user._count.followedBy);

                    // Check follow status
                    if (currentUser && currentUser.username !== username) {
                        const followRes = await fetch(`${API_URL}/api/users/${currentUser.username}/following`);
                        if (followRes.ok) {
                            const followingList = await followRes.json();
                            setIsFollowing(followingList.some((u: any) => u.username === username));
                        }
                    }
                } else {
                    setError('User not found');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [username, currentUser]);

    const handleUpdateProfile = (updatedUser: any) => {
        setProfile(prev => prev ? { ...prev, ...updatedUser } : null);
    };

    const handleFollowToggle = async () => {
        if (!currentUser || !profile) return;

        // Optimistic update
        const newStatus = !isFollowing;
        setIsFollowing(newStatus);
        setFollowersCount(prev => newStatus ? prev + 1 : prev - 1);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            await fetch(`${API_URL}/api/users/${profile.id}/follow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id })
            });
        } catch (err) {
            console.error('Failed to toggle follow', err);
            // Revert on error
            setIsFollowing(!newStatus);
            setFollowersCount(prev => !newStatus ? prev + 1 : prev - 1);
        }
    };

    const fetchUserList = async (type: 'Followers' | 'Following') => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const endpoint = type === 'Followers' ? 'followers' : 'following';
            const res = await fetch(`${API_URL}/api/users/${username}/${endpoint}`);
            if (res.ok) {
                const data = await res.json();
                setUserList(data);
                setShowUserList(type);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Profile...</div>;
    if (error || !profile) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">{error}</div>;

    const tier = getTier(profile.rating || 0);
    const battleTier = getTier(profile.battleRating || 0);
    const graphData: any[] = [];
    const historyData: any[] = [];

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            {showEditModal && (
                <EditProfileModal
                    user={profile}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleUpdateProfile}
                />
            )}

            {showUserList && (
                <UserListModal
                    title={showUserList}
                    users={userList}
                    onClose={() => setShowUserList(null)}
                />
            )}

            <main className="mx-auto max-w-7xl px-4 py-12">
                {/* Profile Header */}
                <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${tier.color}, ${battleTier.color})` }}></div>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar */}
                        <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center bg-black overflow-hidden flex-shrink-0`} style={{ borderColor: tier.color }}>
                            {profile.profilePicture ? (
                                <img
                                    src={profile.profilePicture.startsWith('http') ? profile.profilePicture : `${process.env.NEXT_PUBLIC_API_URL}${profile.profilePicture}`}
                                    alt={profile.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-5xl font-bold text-white">{profile.username[0].toUpperCase()}</span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="text-center md:text-left flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                                <h1 className="text-4xl font-black truncate" style={{ color: tier.color }}>{profile.username}</h1>
                                <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${tier.bg} text-white flex-shrink-0`}>
                                    {tier.name}
                                </span>
                                {profile.country && (
                                    <span className="text-2xl" title={profile.country}>
                                        {getCountryFlag(profile.country)} {profile.country}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mb-1 justify-center md:justify-start">
                                <p className="text-lg text-white font-bold">{profile.name || profile.username}</p>
                                {profile.isBanned && (
                                    <span className="px-3 py-1 bg-red-500/20 text-red-500 border border-red-500/50 rounded-lg text-sm font-bold">
                                        BANNED
                                    </span>
                                )}
                            </div>
                            <p className="text-[#E6E6E6]/60 max-w-xl mx-auto md:mx-0 break-words">{profile.bio || 'No bio yet.'}</p>

                            <div className="flex items-center gap-6 mt-6 justify-center md:justify-start flex-wrap">
                                <div className="text-center">
                                    <span className="block font-bold text-xl">{profile.rating}</span>
                                    <span className="text-xs text-gray-500">Contest Rating</span>
                                </div>
                                <div className="text-center">
                                    <span className="block font-bold text-xl">{profile.battleRating}</span>
                                    <span className="text-xs text-gray-500">Battle Rating</span>
                                </div>
                                <div className="text-center">
                                    <span className="block font-bold text-xl">{profile._count.submissions}</span>
                                    <span className="text-xs text-gray-500">Solved</span>
                                </div>
                                <button onClick={() => fetchUserList('Followers')} className="text-center hover:opacity-80 transition-opacity">
                                    <span className="block font-bold text-xl">{followersCount}</span>
                                    <span className="text-xs text-gray-500">Followers</span>
                                </button>
                                <button onClick={() => fetchUserList('Following')} className="text-center hover:opacity-80 transition-opacity">
                                    <span className="block font-bold text-xl">{profile._count.following}</span>
                                    <span className="text-xs text-gray-500">Following</span>
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 min-w-[140px]">
                            {currentUser?.username === profile.username ? (
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="px-6 py-2 rounded bg-white/10 hover:bg-white/20 text-white font-bold transition-colors border border-white/20 w-full"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={handleFollowToggle}
                                    className={`px-6 py-2 rounded font-bold transition-colors w-full border ${isFollowing
                                        ? 'bg-transparent border-white/30 text-white hover:border-red-500 hover:text-red-500'
                                        : 'bg-white text-black hover:bg-gray-200 border-transparent'}`}
                                >
                                    {isFollowing ? 'Unfollow' : 'Follow'}
                                </button>
                            )}
                            <div className="text-right text-xs text-gray-500 mt-2">
                                <p>Last visit: {new Date(profile.lastVisit).toLocaleDateString()}</p>
                                <p>Registered: {new Date(profile.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Heatmap */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Heatmap */}
                        <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-6">
                            <Heatmap data={heatmapData} />

                            {/* Recent Activity List (Problem Activity) */}
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500">history</span>
                                    Recent Submissions
                                </h3>
                                <div className="flex flex-col gap-2">
                                    {recentActivity.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No recent activity.</p>
                                    ) : (
                                        recentActivity.slice(0, 3).map((sub: any) => (
                                            <Link
                                                href={`/${locale}/submission/${sub.id}`}
                                                key={sub.id}
                                                className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`w-2 h-10 rounded-full flex-shrink-0 ${sub.status === 'AC' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm truncate text-left group-hover:text-blue-400 transition-colors">{sub.problem?.title || 'Unknown Problem'}</p>
                                                        <p className="text-xs text-gray-500">{new Date(sub.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0 ml-4">
                                                    <span className={`text-sm font-bold px-2 py-1 rounded ${sub.status === 'AC' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                                        {sub.status}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Rating Graph */}
                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <h2 className="text-2xl font-bold">Rating History</h2>
                                <span className="text-sm text-gray-500">Max Rating: {profile.maxRating}</span>
                            </div>

                            {graphData.length > 0 ? (
                                <RatingGraph data={graphData} />
                            ) : (
                                <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8 text-center text-gray-500 h-64 flex items-center justify-center">
                                    No rating history available yet. Participate in contests to see your graph!
                                </div>
                            )}

                            {/* History Table */}
                            <RatingHistoryTable history={historyData} />
                        </div>
                    </div>

                    {/* Right Column: Friends & Details */}
                    <div className="space-y-8">
                        {/* Rank Info */}
                        <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-6">
                            <h3 className="font-bold mb-4">Rankings</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Global Rank</span>
                                    <span className="font-bold">#{profile.globalRank}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Country Rank</span>
                                    <span className="font-bold">#{profile.countryRank}</span>
                                </div>
                            </div>
                        </div>

                        {/* Friends/Following - Maybe a quick Access list? */}
                        {/* We already have Followers/Following buttons in header. 
                            Let's keep this as a summary or remove if redundant.
                            User requested "Friends" section.
                         */}
                    </div>
                </div>
            </main>
        </div>
    );
}
