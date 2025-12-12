import React, { useState, useEffect } from 'react';
import { COUNTRIES, getCountryFlag } from '@/utils/countries';

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/users?sortBy=rating`);
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        const body = { ...editingUser };
        if (newPassword) {
            body.password = newPassword;
        }

        try {
            const res = await fetch(`${API_URL}/api/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert('User updated successfully');
                setEditingUser(null);
                setNewPassword('');
                fetchUsers();
            } else {
                alert('Failed to update user');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleBanUser = async (userId: string, isBanned: boolean) => {
        const action = isBanned ? 'unban' : 'ban';
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            const res = await fetch(`${API_URL}/api/admin/users/${userId}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'Banned by admin' })
            });

            if (res.ok) {
                alert(`User ${action}ned successfully`);
                fetchUsers();
            } else {
                alert(`Failed to ${action} user`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteUser = async (userId: string, username: string) => {
        if (!confirm(`Are you sure you want to DELETE user "${username}"? This cannot be undone!`)) return;

        try {
            const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('User deleted successfully');
                fetchUsers();
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8 animate-in fade-in">
            <h2 className="text-2xl font-bold mb-6">Manage Users</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-sm">
                            <th className="p-3">Username</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Rating</th>
                            <th className="p-3">Country</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-3 font-bold">{u.username}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-500'}`}>
                                        {u.role || 'USER'}
                                    </span>
                                </td>
                                <td className="p-3 font-mono">{u.rating}</td>
                                <td className="p-3">
                                    {u.country ? (
                                        <span className="flex items-center gap-2">
                                            <span>{getCountryFlag(u.country)}</span>
                                            <span>{u.country}</span>
                                        </span>
                                    ) : <span className="text-gray-600">-</span>}
                                </td>
                                <td className="p-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => { setEditingUser(u); setNewPassword(''); }} className="text-blue-500 hover:text-blue-400 font-bold text-sm">Edit</button>
                                        <button
                                            onClick={() => handleBanUser(u.id, u.isBanned)}
                                            className={`font-bold text-sm ${u.isBanned ? 'text-green-500 hover:text-green-400' : 'text-yellow-500 hover:text-yellow-400'}`}
                                        >
                                            {u.isBanned ? 'Unban' : 'Ban'}
                                        </button>
                                        <button onClick={() => handleDeleteUser(u.id, u.username)} className="text-red-500 hover:text-red-400 font-bold text-sm">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div className="text-center py-4 text-gray-500">Loading users...</div>}
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in">
                        <h2 className="text-xl font-bold mb-4">Edit User: {editingUser.username}</h2>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Username</label>
                                    <input value={editingUser.username} onChange={e => setEditingUser({ ...editingUser, username: e.target.value })} className="w-full bg-black border border-white/20 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                                    <input value={editingUser.email || ''} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full bg-black border border-white/20 rounded px-3 py-2" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Country</label>
                                <select
                                    value={editingUser.country || ''}
                                    onChange={e => setEditingUser({ ...editingUser, country: e.target.value })}
                                    className="w-full bg-black border border-white/20 rounded px-3 py-2"
                                >
                                    <option value="">Select Country</option>
                                    {COUNTRIES.map(c => (
                                        <option key={c.code} value={c.name}>
                                            {c.flag} {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Role</label>
                                    <select value={editingUser.role || 'USER'} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })} className="w-full bg-black border border-white/20 rounded px-3 py-2">
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Rating</label>
                                    <input type="number" value={editingUser.rating || 0} onChange={e => setEditingUser({ ...editingUser, rating: Number(e.target.value) })} className="w-full bg-black border border-white/20 rounded px-3 py-2" />
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-4 mt-4">
                                <h3 className="font-bold text-red-500 text-sm mb-2">Security</h3>
                                <div className="mb-3">
                                    <label className="block text-xs text-gray-500 mb-1">Current Password Hash (Read-Only)</label>
                                    <input value={editingUser.password || 'No hash found'} readOnly className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-xs font-mono text-gray-500 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-sm text-white mb-1">Set New Password</label>
                                    <input
                                        type="text"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Enter new password to reset..."
                                        className="w-full bg-black border border-red-900/50 rounded px-3 py-2 text-white placeholder-gray-600 focus:border-red-500 transition-colors"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Leave empty to keep current password.</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded bg-[#E80000] hover:bg-red-700 text-white font-bold">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
