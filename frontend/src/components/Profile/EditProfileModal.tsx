
'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { getCountryList, getCountryFlag } from '@/utils/countries';

interface EditProfileModalProps {
    user: any;
    onClose: () => void;
    onUpdate: (updatedUser: any) => void;
}

export default function EditProfileModal({ user, onClose, onUpdate }: EditProfileModalProps) {
    const t = useTranslations('profile');
    const [name, setName] = useState(user.name || '');
    const [newPassword, setNewPassword] = useState('');
    const [country, setCountry] = useState(user.country || '');
    const [bio, setBio] = useState(user.bio || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Avatar State
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState(user.profilePicture || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get sorted country list
    const countries = getCountryList();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError(t('imageSizeError'));
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            let newAvatarUrl = user.profilePicture;

            // 1. Upload Avatar if selected
            if (avatarFile) {
                const formData = new FormData();
                formData.append('userId', user.id);
                formData.append('avatar', avatarFile);

                const uploadRes = await fetch(`${API_URL}/api/users/upload-avatar`, {
                    method: 'POST',
                    body: formData
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    newAvatarUrl = uploadData.avatarUrl;
                } else {
                    throw new Error(t('uploadError'));
                }
            }

            // 2. Update Profile Text
            const res = await fetch(`${API_URL}/api/users/update/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    name,
                    newPassword: newPassword.trim() || undefined,
                    country: country || undefined,
                    bio
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Manually merge avatarUrl because update/profile might not return it if it was just uploaded in step 1
                const finalUser = { ...data.user, profilePicture: newAvatarUrl };
                onUpdate(finalUser);
                onClose();
            } else {
                const data = await res.json();
                setError(data.error || t('updateError'));
            }
        } catch (err: any) {
            setError(err.message || t('genericError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0D0D0D] border border-white/20 rounded-xl w-full max-w-md p-8 relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h2 className="text-2xl font-bold mb-6">{t('editTitle')}</h2>

                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center mb-6">
                        <div
                            className="w-24 h-24 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center overflow-hidden cursor-pointer hover:border-white transition-colors relative group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview.startsWith('http') || avatarPreview.startsWith('blob') ? avatarPreview : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${avatarPreview}`} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-4xl text-gray-500">add_a_photo</span>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs text-white">{t('changeAvatar')}</span>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <p className="text-xs text-gray-500 mt-2">{t('uploadHint')}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">{t('usernameLabel')}</label>
                        <input
                            type="text"
                            value={user.username}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded p-3 text-gray-400 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">{t('usernameHint')}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">{t('nameLabel')}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('namePlaceholder')}
                            className="w-full bg-black border border-white/20 rounded p-3 focus:border-[#E80000] outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">{t('passwordLabel')}</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder={t('passwordPlaceholder')}
                            className="w-full bg-black border border-white/20 rounded p-3 focus:border-[#E80000] outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">{t('countryLabel')}</label>
                        <div className="relative">
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                disabled={!!user.country}
                                className={`w-full bg-black border border-white/20 rounded p-3 focus:border-[#E80000] outline-none appearance-none ${user.country ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <option value="">{t('selectCountry')}</option>
                                {countries.map((c) => (
                                    <option key={c} value={c}>
                                        {getCountryFlag(c)} {c}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <span className="material-symbols-outlined">expand_more</span>
                            </div>
                        </div>
                        {user.country && <p className="text-xs text-gray-500 mt-1">{t('countryHint')}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">{t('bioLabel')}</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-black border border-white/20 rounded p-3 focus:border-[#E80000] outline-none h-24 resize-none"
                            placeholder={t('bioPlaceholder')}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full gradient-button py-3 rounded font-bold mt-4"
                    >
                        {loading ? t('saving') : t('save')}
                    </button>
                </form>
            </div>
        </div>
    );
}
