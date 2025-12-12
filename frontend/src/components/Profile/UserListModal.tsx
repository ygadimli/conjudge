'use client';

import { getCountryFlag } from '@/utils/countries';
import Link from 'next/link';

interface UserListModalProps {
    title: string;
    users: any[];
    onClose: () => void;
}

export default function UserListModal({ title, users, onClose }: UserListModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#0D0D0D] border border-white/20 rounded-xl w-full max-w-md p-6 relative max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {users.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No users found.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {users.map((u) => (
                            <Link
                                key={u.id}
                                href={`/profile/${u.username}`}
                                onClick={onClose}
                                className="flex items-center gap-4 p-3 hover:bg-white/5 rounded transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-white/10 overflow-hidden flex-shrink-0">
                                    {u.profilePicture ? (
                                        <img src={u.profilePicture.startsWith('http') ? u.profilePicture : `${process.env.NEXT_PUBLIC_API_URL}${u.profilePicture}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white font-bold bg-black">
                                            {u.username[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold truncate">{u.username}</span>
                                        {u.country && <span>{getCountryFlag(u.country)}</span>}
                                    </div>
                                    <p className="text-xs text-gray-500 font-mono">Rating: {u.rating}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
