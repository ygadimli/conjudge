'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Friend {
    id: string;
    username: string;
    rating: number;
    country?: string;
}

export default function FriendsPage() {
    const { user } = useAuth();
    const [following, setFollowing] = useState<Friend[]>([]);
    const [followers, setFollowers] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchFriends();
        }
    }, [user]);

    const fetchFriends = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/friends?userId=${user?.id}`);
            if (res.ok) {
                const data = await res.json();
                setFollowing(data.following || []);
                setFollowers(data.followers || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-12">
                <h1 className="text-4xl font-black mb-8 text-[#E80000]">Friends & Community</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Following */}
                    <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500">person_add</span>
                            Following ({following.length})
                        </h2>
                        {loading ? <p>Loading...</p> : following.length === 0 ? (
                            <p className="text-gray-500">You are not following anyone yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {following.map(friend => (
                                    <div key={friend.id} className="flex justify-between items-center bg-black/50 p-4 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold border border-blue-500/50">
                                                {friend.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <Link href={`./profile/${friend.username}`} className="font-bold hover:underline">{friend.username}</Link>
                                                <p className="text-xs text-gray-500">{friend.country || 'Unknown'} • Rating: {friend.rating}</p>
                                            </div>
                                        </div>
                                        <button className="px-3 py-1 text-xs bg-white/10 rounded hover:bg-white/20">Unfollow</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Followers */}
                    <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500">group</span>
                            Followers ({followers.length})
                        </h2>
                        {loading ? <p>Loading...</p> : followers.length === 0 ? (
                            <p className="text-gray-500">No followers yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {followers.map(friend => (
                                    <div key={friend.id} className="flex justify-between items-center bg-black/50 p-4 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold border border-green-500/50">
                                                {friend.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <Link href={`./profile/${friend.username}`} className="font-bold hover:underline">{friend.username}</Link>
                                                <p className="text-xs text-gray-500">{friend.country || 'Unknown'} • Rating: {friend.rating}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
