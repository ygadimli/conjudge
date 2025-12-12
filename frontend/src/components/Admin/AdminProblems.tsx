import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminProblems() {
    const { user } = useAuth();
    const [view, setView] = useState<'LIST' | 'IMPORT' | 'CREATE'>('LIST');
    const [problems, setProblems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Import from Codeforces
    const [cfUrl, setCfUrl] = useState('');
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/problems`);
            if (res.ok) {
                const data = await res.json();
                setProblems(data.problems || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleImportFromCF = async (e: React.FormEvent) => {
        e.preventDefault();
        setImporting(true);
        setImportResult('');

        try {
            const res = await fetch(`${API_URL}/api/problems/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: cfUrl,
                    createdById: user?.id
                })
            });

            const data = await res.json();

            if (res.ok) {
                setImportResult(`✅ Successfully imported: ${data.problem.title}`);
                setCfUrl('');
                fetchProblems();
            } else {
                setImportResult(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            setImportResult('❌ Network error');
        } finally {
            setImporting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this problem?')) return;
        try {
            await fetch(`${API_URL}/api/problems/${id}`, { method: 'DELETE' });
            fetchProblems();
        } catch (error) {
            console.error(error);
        }
    };

    if (view === 'IMPORT') {
        return (
            <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8 animate-in fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Import from Codeforces</h2>
                    <button onClick={() => setView('LIST')} className="text-gray-400 hover:text-white">← Back</button>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <h3 className="font-bold text-blue-400 mb-2">📌 How to Import:</h3>
                    <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                        <li>Go to Codeforces and find a problem</li>
                        <li>Copy the problem URL (e.g., https://codeforces.com/problemset/problem/1234/A)</li>
                        <li>Paste it below and click Import</li>
                        <li>The system will automatically scrape and add the problem</li>
                    </ol>
                </div>

                <form onSubmit={handleImportFromCF} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Codeforces Problem URL</label>
                        <input
                            type="url"
                            value={cfUrl}
                            onChange={(e) => setCfUrl(e.target.value)}
                            placeholder="https://codeforces.com/problemset/problem/1234/A"
                            className="w-full bg-black border border-white/20 rounded px-4 py-3 font-mono text-sm"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Example: https://codeforces.com/contest/1/problem/A
                        </p>
                    </div>

                    {importResult && (
                        <div className={`p-4 rounded-lg ${importResult.startsWith('✅') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                            {importResult}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={importing}
                        className="w-full gradient-button py-3 rounded text-white font-bold disabled:opacity-50"
                    >
                        {importing ? '⏳ Importing...' : '📥 Import Problem'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <h3 className="font-bold mb-4">Recently Imported Problems</h3>
                    <div className="space-y-2">
                        {problems.filter(p => p.externalSource === 'Codeforces').slice(0, 5).map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-white/5 p-3 rounded">
                                <div>
                                    <span className="font-bold">{p.title}</span>
                                    <span className="text-xs text-gray-500 ml-2">({p.externalId})</span>
                                </div>
                                <span className="text-xs text-blue-400">CF</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Problems</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => setView('IMPORT')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">download</span>
                        Import from CF
                    </button>
                </div>
            </div>

            <div className="mb-4 flex gap-2">
                <div className="text-sm bg-white/5 px-3 py-1 rounded">
                    Total: <span className="font-bold">{problems.length}</span>
                </div>
                <div className="text-sm bg-blue-500/10 px-3 py-1 rounded border border-blue-500/30">
                    CF: <span className="font-bold">{problems.filter(p => p.externalSource === 'Codeforces').length}</span>
                </div>
                <div className="text-sm bg-green-500/10 px-3 py-1 rounded border border-green-500/30">
                    Local: <span className="font-bold">{problems.filter(p => !p.externalSource).length}</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-sm">
                            <th className="p-3">Title</th>
                            <th className="p-3">Rating</th>
                            <th className="p-3">Source</th>
                            <th className="p-3">Category</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {problems.map(p => (
                            <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-3">
                                    <div className="font-bold">{p.title}</div>
                                    {p.externalId && (
                                        <div className="text-xs text-gray-500">{p.externalId}</div>
                                    )}
                                </td>
                                <td className="p-3 font-mono font-bold">{p.rating}</td>
                                <td className="p-3">
                                    {p.externalSource ? (
                                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30">
                                            {p.externalSource}
                                        </span>
                                    ) : (
                                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">
                                            Local
                                        </span>
                                    )}
                                </td>
                                <td className="p-3 text-sm text-gray-400">{p.category}</td>
                                <td className="p-3 text-right">
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="text-red-500 hover:text-red-400 text-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div className="text-center py-4 text-gray-500">Loading...</div>}
                {!loading && problems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No problems yet. Import from Codeforces!
                    </div>
                )}
            </div>
        </div>
    );
}
