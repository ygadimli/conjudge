import React, { useState, useEffect } from 'react';
import DashboardStats from '@/components/Admin/DashboardStats';
import DashboardActivity from '@/components/Admin/DashboardActivity';
import ServerHealthWidget from '@/components/Admin/ServerHealthWidget';
import PopularProblemsTable from '@/components/Admin/PopularProblemsTable';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [activity, setActivity] = useState<any[]>([]);
    const [health, setHealth] = useState<any>(null);
    const [popular, setPopular] = useState<any[]>([]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [s, a, h, p] = await Promise.all([
                    fetch(`${API_URL}/api/admin/stats`),
                    fetch(`${API_URL}/api/admin/activity`),
                    fetch(`${API_URL}/api/admin/health`),
                    fetch(`${API_URL}/api/admin/popular-problems`)
                ]);

                if (s.ok) setStats(await s.json());
                if (a.ok) setActivity(await a.json());
                if (h.ok) setHealth(await h.json());
                if (p.ok) setPopular(await p.json());
            } catch (error) {
                console.error('Dashboard load failed', error);
            }
        };
        fetchData();
        // Poll health every 30s
        const interval = setInterval(() => {
            fetch(`${API_URL}/api/admin/health`).then(r => {
                if (r.ok) r.json().then(setHealth);
            });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Top Stats */}
            <DashboardStats stats={stats} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Charts (Takes up 2 cols) */}
                <div className="lg:col-span-2">
                    <DashboardActivity data={activity} />
                </div>

                {/* Side Widgets (Takes up 1 col) */}
                <div className="space-y-8">
                    <ServerHealthWidget data={health} />
                    <PopularProblemsTable data={popular} />
                </div>
            </div>
        </div>
    );
}
