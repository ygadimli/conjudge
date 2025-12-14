import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function AdminSubmissions() {
    const t = useTranslations('admin');
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/submissions/all`);
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data.submissions); // Endpoint returns { submissions: [] }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRejudge = async (id: string) => {
        if (!confirm(t('submissions_rejudgeConfirm'))) return;
        try {
            const res = await fetch(`${API_URL}/api/submissions/${id}/rejudge`, { method: 'POST' });
            if (res.ok) {
                alert(t('submissions_rejudgeSuccess'));
                fetchSubmissions();
            } else {
                alert(t('submissions_rejudgeFail'));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('submissions_deleteConfirm'))) return;
        try {
            await fetch(`${API_URL}/api/submissions/${id}`, { method: 'DELETE' });
            fetchSubmissions();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t('submissions_title')}</h2>
                <button onClick={fetchSubmissions} className="text-sm text-blue-500 hover:text-white">{t('refresh')}</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-sm">
                            <th className="p-3">{t('tableUser')}</th>
                            <th className="p-3">{t('tableProblem')}</th>
                            <th className="p-3">{t('tableVerdict')}</th>
                            <th className="p-3">{t('tableTime')}</th>
                            <th className="p-3">{t('tableDate')}</th>
                            <th className="p-3 text-right">{t('tableActions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.map(sub => (
                            <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-3 font-mono text-sm">{sub.user?.username || t('unknown')}</td>
                                <td className="p-3 text-sm">{sub.problem?.title || t('unknown')}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${sub.status === 'AC' ? 'bg-green-500/20 text-green-500' :
                                        sub.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                                            'bg-red-500/20 text-red-500'
                                        }`}>
                                        {sub.status}
                                    </span>
                                </td>
                                <td className="p-3 text-sm font-mono">{sub.runtime}ms</td>
                                <td className="p-3 text-xs text-gray-500">{new Date(sub.createdAt).toLocaleString()}</td>
                                <td className="p-3 text-right flex justify-end gap-3">
                                    <button onClick={() => handleRejudge(sub.id)} className="text-yellow-500 hover:text-yellow-300 text-xs uppercase font-bold tracking-wider">{t('submissions_rejudgeBtn')}</button>
                                    <button onClick={() => handleDelete(sub.id)} className="text-red-500 hover:text-red-300 text-xs">✕</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div className="text-center py-4 text-gray-500">{t('submissions_loading')}</div>}
                {!loading && submissions.length === 0 && <div className="text-center py-4 text-gray-500">{t('submissions_none')}</div>}
            </div>
        </div>
    );
}
