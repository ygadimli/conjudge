import React from 'react';
import { useTranslations } from 'next-intl';

interface HealthProps {
    data: {
        uptime: number;
        memory: {
            total: number;
            used: number;
        };
        status: string;
    } | null;
}

export default function ServerHealthWidget({ data }: HealthProps) {
    const t = useTranslations('admin');

    if (!data) return <div className="animate-pulse bg-[#1A1A1A] h-32 rounded-xl"></div>;

    const uptimeHours = (data.uptime / 3600).toFixed(1);
    const memUsedMB = (data.memory.used / 1024 / 1024).toFixed(0);
    const memTotalMB = (data.memory.total / 1024 / 1024).toFixed(0);
    const memPercent = Math.round((data.memory.used / data.memory.total) * 100);

    return (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500">dns</span>
                {t('systemHealth')}
            </h3>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{t('memoryUsage')}</span>
                        <span>{memPercent}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${memPercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{memUsedMB} MB / {memTotalMB} MB</p>
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                    <span className="text-gray-400 text-sm">{t('uptime')}</span>
                    <span className="font-mono">{uptimeHours}h</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">{t('status')}</span>
                    <span className="text-green-500 font-bold text-sm bg-green-500/10 px-2 py-1 rounded">
                        {data.status}
                    </span>
                </div>
            </div>
        </div>
    );
}
