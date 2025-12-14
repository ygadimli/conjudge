
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { COUNTRIES, getCountryFlag } from '@/utils/countries';

export default function AdminUsers() {
    const t = useTranslations('admin');
    const tCommon = useTranslations('common');
    const tProfile = useTranslations('profile'); // For field names like username, email, etc.

    const [users, setUsers] = useState<any[]>([]);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

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
                alert(t('userUpdatedSuccess'));
                setEditingUser(null);
                setNewPassword('');
                fetchUsers();
            } else {
                alert(t('userUpdateFail'));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleBanUser = async (userId: string, isBanned: boolean) => {
        const action = isBanned ? 'unban' : 'ban';
        // Note: passing 'unban'/'ban' to translation for context "Are you sure you want to unban this user?"
        // Ideally should have separate keys, but t('banConfirm', { action: t(action) }) works if t(action) exists.
        // Actually, t('ban') and t('unban') exist as button labels ("Ban", "Unban").
        // 'banConfirm': "Are you sure you want to {action} this user?"
        // This might produce "Are you sure you want to Ban this user?". Lowercase might be better.
        // I will use distinct logic or just keys.
        // I'll stick to t('banConfirm', { action: action === 'ban' ? t('ban').toLowerCase() : t('unban').toLowerCase() })
        // But some languages don't lowercase nicely.
        // Let's use separate Confirm keys if possible or just use the action verb.
        // Simplest: use English verb for now or just generic "Are you sure?"
        // But I added 'banConfirm'. I'll pass generic 'action' or the translated verb.
        // Given 'banConfirm' is "Are you sure you want to {action} this user?", 'action' should be localized verb.
        // For now I'll use t(action) (which returns "Ban" or "Unban").
        if (!confirm(t('banConfirm', { action: t(action) }))) return;

        try {
            const res = await fetch(`${API_URL}/api/admin/users/${userId}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: t('banReason') })
            });

            if (res.ok) {
                alert(action === 'ban' ? t('banSuccess') : t('unbanSuccess'));
                fetchUsers();
            } else {
                alert(action === 'ban' ? t('banFail') : t('unbanFail'));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteUser = async (userId: string, username: string) => {
        if (!confirm(t('deleteUserConfirm', { username }))) return;

        try {
            const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert(t('deleteUserSuccess'));
                fetchUsers();
            } else {
                alert(t('deleteUserFail'));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredUsers = users.filter((user: any) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t('manageUsers')} ({filteredUsers.length})</h2>
                <div className="relative w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">search</span>
                    <input
                        type="text"
                        placeholder={t('searchUser')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black border border-white/20 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-white/40 placeholder-gray-600"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-sm">
                            <th className="p-3">{tProfile('username')}</th>
                            <th className="p-3">{t('role')}</th>
                            <th className="p-3">{tCommon('rating')}</th>
                            <th className="p-3">{tCommon('country')}</th>
                            <th className="p-3 text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-3">
                                    <div className="font-bold">{u.username}</div>
                                    <div className="text-xs text-gray-500">{u.email}</div>
                                </td>
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
                                        <button onClick={() => { setEditingUser(u); setNewPassword(''); }} className="text-blue-500 hover:text-blue-400 font-bold text-sm">{t('editUser')}</button>
                                        <button
                                            onClick={() => handleBanUser(u.id, u.isBanned)}
                                            className={`font-bold text-sm ${u.isBanned ? 'text-green-500 hover:text-green-400' : 'text-yellow-500 hover:text-yellow-400'}`}
                                        >
                                            {u.isBanned ? t('unban') : t('ban')}
                                        </button>
                                        <button onClick={() => handleDeleteUser(u.id, u.username)} className="text-red-500 hover:text-red-400 font-bold text-sm">{t('deleteUser')}</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div className="text-center py-4 text-gray-500">{t('loadingUsers')}</div>}
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in">
                        <h2 className="text-xl font-bold mb-4">{t('editUser')}: {editingUser.username}</h2>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">{tProfile('username')}</label>
                                    <input value={editingUser.username} onChange={e => setEditingUser({ ...editingUser, username: e.target.value })} className="w-full bg-black border border-white/20 rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">{t('login.email') || 'Email'}</label>
                                    <input value={editingUser.email || ''} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full bg-black border border-white/20 rounded px-3 py-2" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">{tCommon('country')}</label>
                                <select
                                    value={editingUser.country || ''}
                                    onChange={e => setEditingUser({ ...editingUser, country: e.target.value })}
                                    className="w-full bg-black border border-white/20 rounded px-3 py-2"
                                >
                                    <option value="">{t('selectCountry')}</option>
                                    {COUNTRIES.map(c => (
                                        <option key={c.code} value={c.name}>
                                            {c.flag} {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">{t('role')}</label>
                                    <select value={editingUser.role || 'USER'} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })} className="w-full bg-black border border-white/20 rounded px-3 py-2">
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">{tCommon('rating')}</label>
                                    <input type="number" value={editingUser.rating || 0} onChange={e => setEditingUser({ ...editingUser, rating: Number(e.target.value) })} className="w-full bg-black border border-white/20 rounded px-3 py-2" />
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-4 mt-4">
                                <h3 className="font-bold text-red-500 text-sm mb-2">{t('securitySection')}</h3>
                                <div>
                                    <label className="block text-sm text-white mb-1">{tProfile('newPassword')}</label>
                                    <input
                                        type="text"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder={t('newPasswordPlaceholder')}
                                        className="w-full bg-black border border-red-900/50 rounded px-3 py-2 text-white placeholder-gray-600 focus:border-red-500 transition-colors"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{t('passwordHint')}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20">{t('cancel')}</button>
                                <button type="submit" className="px-4 py-2 rounded bg-[#E80000] hover:bg-red-700 text-white font-bold">{t('save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
