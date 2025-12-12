import React, { useState, useEffect } from 'react';

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('INFO');
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch(`${API_URL}/api/announcements/all`);
            if (res.ok) setAnnouncements(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId
            ? `${API_URL}/api/announcements/${editingId}`
            : `${API_URL}/api/announcements`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, type })
            });

            if (res.ok) {
                alert(editingId ? 'Updated' : 'Created');
                setTitle('');
                setContent('');
                setType('INFO');
                setEditingId(null);
                fetchAnnouncements();
            } else {
                alert('Action failed');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await fetch(`${API_URL}/api/announcements/${id}`, { method: 'DELETE' });
            fetchAnnouncements();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (ann: any) => {
        setEditingId(ann.id);
        setTitle(ann.title);
        setContent(ann.content);
        setType(ann.type);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
            {/* Form */}
            <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8">
                <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Announcement' : 'Post Announcement'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black border border-white/20 rounded px-3 py-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Type</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-black border border-white/20 rounded px-3 py-2">
                            <option value="INFO">Info (Blue)</option>
                            <option value="WARNING">Warning (Yellow)</option>
                            <option value="IMPORTANT">Important (Red)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Content</label>
                        <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full h-32 bg-black border border-white/20 rounded px-3 py-2" required />
                    </div>

                    <div className="flex gap-2">
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); setTitle(''); setContent(''); }} className="px-4 py-2 bg-gray-600 rounded text-white">Cancel</button>
                        )}
                        <button type="submit" disabled={loading} className="w-full gradient-button py-2 rounded text-white font-bold">
                            {loading ? 'Processing...' : (editingId ? 'Update' : 'Post')}
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-8 overflow-y-auto max-h-[600px]">
                <h2 className="text-2xl font-bold mb-6">Active Announcements</h2>
                <div className="space-y-4">
                    {announcements.map(ann => (
                        <div key={ann.id} className="bg-black/50 p-4 rounded border border-white/10 relative group">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${ann.type === 'IMPORTANT' ? 'bg-red-500/20 text-red-500' :
                                        ann.type === 'WARNING' ? 'bg-yellow-500/20 text-yellow-500' :
                                            'bg-blue-500/20 text-blue-500'
                                    }`}>
                                    {ann.type}
                                </span>
                                <div className="text-xs text-gray-500">{new Date(ann.createdAt).toLocaleDateString()}</div>
                            </div>
                            <h3 className="font-bold text-lg mb-1">{ann.title}</h3>
                            <p className="text-sm text-gray-400">{ann.content}</p>

                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={() => handleEdit(ann)} className="text-blue-500 bg-black/80 px-2 py-1 rounded text-xs">Edit</button>
                                <button onClick={() => handleDelete(ann.id)} className="text-red-500 bg-black/80 px-2 py-1 rounded text-xs">Delete</button>
                            </div>
                        </div>
                    ))}
                    {announcements.length === 0 && <div className="text-gray-500 text-center">No announcements found.</div>}
                </div>
            </div>
        </div>
    );
}
