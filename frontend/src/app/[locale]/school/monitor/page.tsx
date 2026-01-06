"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar'; // Assuming shared Navbar
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

// Mock Data Types
interface Student {
    id: string;
    name: string;
    status: 'CLEAR' | 'SUSPICIOUS' | 'CHEATING';
    lastEvent?: string;
    cameraActive: boolean;
    micActive: boolean;
    tabFocused: boolean;
    aiProbability: number; // 0-100
    submitting: boolean;
}

interface LogEvent {
    id: string;
    studentId: string;
    studentName: string;
    type: 'TAB_SWITCH' | 'FACE_MISSING' | 'MULTIPLE_FACES' | 'VOICE_DETECTED' | 'PHONE_DETECTED' | 'COPY_PASTE' | 'AI_CODE';
    timestamp: Date;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const MOCK_STUDENTS: Student[] = [
    { id: '1', name: 'Ali Hasanov', status: 'CLEAR', cameraActive: true, micActive: true, tabFocused: true, aiProbability: 5, submitting: false },
    { id: '2', name: 'Vali Mammadov', status: 'SUSPICIOUS', cameraActive: true, micActive: true, tabFocused: false, aiProbability: 45, submitting: false },
    { id: '3', name: 'Leyla Aliyeva', status: 'CLEAR', cameraActive: true, micActive: true, tabFocused: true, aiProbability: 12, submitting: true },
    { id: '4', name: 'Murad Bagirov', status: 'CHEATING', cameraActive: false, micActive: true, tabFocused: true, aiProbability: 92, submitting: false },
    { id: '5', name: 'Nigar Guliyeva', status: 'CLEAR', cameraActive: true, micActive: true, tabFocused: true, aiProbability: 2, submitting: false },
    { id: '6', name: 'Farid Orujov', status: 'CLEAR', cameraActive: true, micActive: false, tabFocused: true, aiProbability: 8, submitting: false },
    { id: '7', name: 'Gunel Rzayeva', status: 'SUSPICIOUS', cameraActive: true, micActive: true, tabFocused: true, aiProbability: 60, submitting: false },
    { id: '8', name: 'Elvin Karimov', status: 'CLEAR', cameraActive: true, micActive: true, tabFocused: true, aiProbability: 15, submitting: false },
];

export default function AntiCheatMonitor() {
    const t = useTranslations('SCHOOL');
    const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
    const [events, setEvents] = useState<LogEvent[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Real-time Socket Connection
    useEffect(() => {
        // Initialize Socket
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/school', {
            path: '/socket.io/', // Ensure standard path
        });

        // Join the exam room
        socket.emit('join-monitor', 'EXAM-2025-A7');

        // Listen for events
        socket.on('student-event', (data: any) => {
            // Map backend event to frontend type
            const newEvent: LogEvent = {
                id: Date.now().toString(),
                studentId: data.studentId,
                studentName: students.find(s => s.id === data.studentId)?.name || 'Unknown Student',
                type: data.type,
                timestamp: new Date(data.timestamp),
                severity: data.severity
            };

            setEvents(prev => [newEvent, ...prev].slice(0, 50));

            // Update Student Status based on event
            setStudents(prev => prev.map(s => {
                if (s.id === data.studentId) {
                    return {
                        ...s,
                        status: data.severity === 'CRITICAL' ? 'CHEATING' : data.severity === 'HIGH' ? 'SUSPICIOUS' : s.status,
                        lastEvent: data.type,
                        aiProbability: data.type === 'AI_CODE' ? Math.min(s.aiProbability + 30, 100) : s.aiProbability
                    };
                }
                return s;
            }));
        });

        return () => {
            socket.disconnect();
        };
    }, []); // Run once on mount

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-900/30">
            <Navbar />

            <main className="pt-24 px-6 pb-6 max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-6rem)]">

                {/* HEADS UP DISPLAY / HEADER */}
                <div className="col-span-1 lg:col-span-4 flex justify-between items-center bg-[#0F0F0F] p-4 rounded-xl border border-[#222]">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
                        <h1 className="text-xl font-bold tracking-wider uppercase text-red-500">{t('MONITOR')}</h1>
                        <span className="px-3 py-1 bg-[#1A1A1A] rounded-md text-xs text-gray-400 font-mono">ID: EXAM-2025-A7</span>
                    </div>
                    <div className="flex gap-6 text-sm">
                        <div className="flex flex-col items-center">
                            <span className="text-gray-500 text-xs uppercase">{t('ACTIVE_EXAMS')}</span>
                            <span className="font-bold text-white text-lg">1</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-gray-500 text-xs uppercase">{t('STUDENTS_ONLINE')}</span>
                            <span className="font-bold text-blue-400 text-lg">{students.length}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-gray-500 text-xs uppercase">{t('CHEATING_DETECTIONS')}</span>
                            <span className="font-bold text-red-500 text-lg">{events.filter(e => e.severity === 'CRITICAL').length}</span>
                        </div>
                    </div>
                </div>

                {/* MAIN GRID - STUDENT FEEDS */}
                <div className="col-span-1 lg:col-span-3 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {students.map(student => (
                            <StudentCard key={student.id} student={student} t={t} />
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDEBAR - LOGS & ALERTS */}
                <div className="col-span-1 bg-[#0F0F0F] rounded-xl border border-[#222] flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-[#222]">
                        <h2 className="font-bold text-gray-300 uppercase tracking-wide text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-yellow-500 text-lg">warning</span>
                            {t('ALERTS')}
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 relative">
                        <AnimatePresence>
                            {events.map((event) => (
                                <EventLogItem key={event.id} event={event} t={t} />
                            ))}
                        </AnimatePresence>
                        {events.length === 0 && (
                            <div className="text-center text-gray-600 mt-10 italic text-sm">
                                System awaiting events...
                            </div>
                        )}
                        <div ref={logsEndRef} />
                    </div>
                </div>

            </main>
        </div>
    );
}

function StudentCard({ student, t }: { student: Student, t: any }) {
    const isCheating = student.status === 'CHEATING';
    const isSuspicious = student.status === 'SUSPICIOUS';

    return (
        <div className={`relative bg-[#111] rounded-lg overflow-hidden border-2 transition-all duration-300 group
            ${isCheating ? 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]' :
                isSuspicious ? 'border-yellow-600' : 'border-[#222] hover:border-[#444]'}`}>

            {/* Mock Camera Feed Area */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                {/* Scan Line Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[10%] w-full animate-scan pointer-events-none"></div>

                {student.cameraActive ? (
                    <div className="w-full h-full relative">
                        {/* Placeholder for video stream */}
                        <div className="absolute inset-0 flex items-center justify-center text-[#333]">
                            <span className="material-symbols-outlined text-6xl opacity-20">person</span>
                        </div>
                        {/* Face Bounding Box Mock */}
                        <div className="absolute top-1/4 left-1/3 w-1/3 h-1/2 border border-blue-500/50 rounded-lg animate-pulse"></div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-red-500 gap-2">
                        <span className="material-symbols-outlined text-4xl">videocam_off</span>
                        <span className="text-xs font-mono">NO SIGNAL</span>
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute top-2 right-2 flex gap-1">
                    {!student.micActive && <span className="material-symbols-outlined text-red-500 bg-black/50 rounded p-0.5 text-sm">mic_off</span>}
                    {!student.tabFocused && <span className="material-symbols-outlined text-yellow-500 bg-black/50 rounded p-0.5 text-sm animate-bounce">tab</span>}
                </div>

                {/* Cheat Score */}
                {(student.aiProbability > 0) && (
                    <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
                        <span className="text-gray-400">AI:</span>
                        <span className={`${student.aiProbability > 50 ? 'text-red-500' : 'text-green-500'}`}>
                            {student.aiProbability}%
                        </span>
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="p-3">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-white text-sm">{student.name}</h3>
                        <p className={`text-xs font-mono mt-0.5 flex items-center gap-1
                            ${isCheating ? 'text-red-500 font-bold' : isSuspicious ? 'text-yellow-500' : 'text-green-500'}`}>
                            <span className="w-2 h-2 rounded-full bg-current"></span>
                            {t(`STATUS.${student.status}`)}
                        </p>
                    </div>
                    {/* Refresh Rate Indicator */}
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
                    </div>
                </div>

                {/* Last Event */}
                {student.lastEvent && (
                    <div className="bg-[#1A1A1A] p-2 rounded text-[10px] text-gray-400 font-mono truncate border-l-2 border-red-500">
                        Last: {student.lastEvent}
                    </div>
                )}
            </div>

        </div>
    );
}

function EventLogItem({ event, t }: { event: LogEvent, t: any }) {
    const colorClass = event.severity === 'CRITICAL' ? 'text-red-500 border-red-500/30' :
        event.severity === 'HIGH' ? 'text-orange-500 border-orange-500/30' :
            'text-gray-400 border-[#333]';

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-2 rounded border-l-2 bg-[#151515] text-xs font-mono mb-2 ${colorClass}`}
        >
            <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-white">{event.studentName}</span>
                <span className="opacity-50">{event.timestamp.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                    {event.type === 'TAB_SWITCH' ? 'tab' :
                        event.type === 'PHONE_DETECTED' ? 'smartphone' :
                            event.type === 'AI_CODE' ? 'smart_toy' : 'error'}
                </span>
                <span>{t(`EVENTS.${event.type}`) || event.type}</span>
            </div>
        </motion.div>
    );
}
