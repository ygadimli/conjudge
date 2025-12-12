import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminContests() {
    const { user } = useAuth();
    const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
    const [contests, setContests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState(120);
    const [problemIds, setProblemIds] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/contests`);
            if (res.ok) setContests(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (c: any) => {
        setEditingId(c.id);
        setTitle(c.title);
        setDescription(c.description || '');
        // Format date for datetime-local input (YYYY-MM-DDThh:mm)
        const d = new Date(c.startTime);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        setStartTime(d.toISOString().slice(0, 16));
        setDuration(c.duration);
        setProblemIds(c.problems.map((p: any) => p.id).join(', '));
        setView('FORM');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this contest?')) return;
        try {
            await fetch(`${API_URL}/api/contests/${id}`, { method: 'DELETE' });
            fetchContests();
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setDescription('');
        setStartTime('');
        setDuration(120);
        setProblemIds('');
        setView('LIST');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            title, description,
            startTime, duration,
            problemIds: problemIds.split(',').map(s => s.trim()).filter(Boolean),
            userId: user?.id
        };

        const url = editingId ? `${API_URL}/api/contests/${editingId}` : `${API_URL}/api/contests`;
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(editingId ? 'Contest Updated' : 'Contest Created');
                fetchContests();
                resetForm();
            } else {
                const err = await res.json();
                alert('Error: ' + err.error);
            }
        } catch (error) {
            alert('Network error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (view === 'LIST') {
        return (
            <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8 animate-in fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Contests</h2>
                    <button onClick={() => { resetForm(); setView('FORM'); }} className="gradient-button px-4 py-2 rounded text-white font-bold">+ Create New</button>
                </div>
                <div className="space-y-4">
                    {contests.map(c => (
                        <div key={c.id} className="bg-black/50 p-4 rounded border border-white/10 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg">{c.title}</h3>
                                <div className="text-sm text-gray-500">
                                    Start: {new Date(c.startTime).toLocaleString()} | Dur: {c.duration}m | Probs: {c.problems.length}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(c)} className="text-blue-500 hover:text-white text-sm bg-blue-500/10 px-3 py-1 rounded">Edit</button>
                                <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-white text-sm bg-red-500/10 px-3 py-1 rounded">Delete</button>
                            </div>
                        </div>
                    ))}
                    {contests.length === 0 && <div className="text-gray-500">No contests found.</div>}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8 animate-in fade-in">
            <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">{editingId ? 'Edit Contest' : 'Create Contest'}</h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-white">Cancel</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Contest Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black border border-white/20 rounded px-3 py-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full h-24 bg-black border border-white/20 rounded px-3 py-2" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Start Time</label>
                        <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-black border border-white/20 rounded px-3 py-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                        <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-black border border-white/20 rounded px-3 py-2" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Problem IDs (comma separated)</label>
                    <input value={problemIds} onChange={e => setProblemIds(e.target.value)} className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono" />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full gradient-button py-3 rounded text-white font-bold">
                    {isSubmitting ? 'Processing...' : (editingId ? 'Update Contest' : 'Create Contest')}
                </button>
            </form>
        </div>
    );
}
