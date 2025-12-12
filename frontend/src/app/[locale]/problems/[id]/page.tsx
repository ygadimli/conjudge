'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

// Supported languages and their templates
const LANGUAGES = [
    { id: 'python', name: 'Python', extension: 'py' },
    { id: 'cpp', name: 'C++', extension: 'cpp' },
    { id: 'javascript', name: 'JavaScript', extension: 'js' }
];

const TEMPLATES: Record<string, Record<string, string>> = {
    'python': {
        'default': 'import sys\n\ndef solve():\n    # Read input from stdin\n    # lines = sys.stdin.readlines()\n    pass\n\nif __name__ == "__main__":\n    solve()',
        'Two Sum': 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your code here\n        pass\n\n# Helper to read input and call Solution\nimport sys\n# ... boilerplate handling ...',
        'Sum of Numbers': 'import sys\n\ndef solve():\n    try:\n        line = sys.stdin.read()\n        if not line: return\n        n = int(line.strip())\n        # Your logic here to calculate sum\n        # Be careful with large inputs!\n        print(n * (n + 1) // 2)\n    except Exception: pass\n\nif __name__ == "__main__":\n    solve()'
    },
    'cpp': {
        'default': '#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nint main() {\n    // Optimize I/O operations\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    // Your code here\n    \n    return 0;\n}',
        'Sum of Numbers': '#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        cout << (n * (n + 1)) / 2 << endl;\n    }\n    return 0;\n}'
    }
};

interface Problem {
    id: string;
    title: string;
    description: string;
    rating: number; // Numeric rating
    difficulty: number; // Legacy 1-3
    category: string;
    timeLimit: number;
    memoryLimit: number;
}

export default function ProblemPage() {
    const params = useParams();
    const { user, loading: authLoading } = useAuth(); // User can be null
    const router = useRouter();
    const id = params.id as string;
    const locale = params.locale || 'en';

    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');

    // Submission History State
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

    // Console State
    const [consoleOpen, setConsoleOpen] = useState(true);
    const [consoleTab, setConsoleTab] = useState<'output' | 'result'>('output');
    const [customInput, setCustomInput] = useState('');
    const [output, setOutput] = useState('');
    const [submissionResult, setSubmissionResult] = useState<any>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/problems/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProblem(data.problem);

                    // Set default template
                    const templateGroup = TEMPLATES[language] || TEMPLATES['python'];
                    const template = templateGroup[data.problem.title] || templateGroup['default'];
                    setCode(template);
                } else {
                    // Handle 404
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProblem();
    }, [id, language]);

    // Fetch user's submissions for this problem
    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!user || !id) return;

            setLoadingSubmissions(true);
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/submissions/user/${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    // Backend returns { submissions: [...] }
                    const allSubmissions = data.submissions || [];
                    // Filter submissions for current problem
                    const problemSubmissions = allSubmissions.filter((sub: any) => sub.problemId === id);
                    setSubmissions(problemSubmissions);
                }
            } catch (error) {
                console.error('Error fetching submissions:', error);
            } finally {
                setLoadingSubmissions(false);
            }
        };

        if (activeTab === 'submissions') {
            fetchSubmissions();
        }
    }, [user, id, activeTab]);

    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        if (problem) {
            const templateGroup = TEMPLATES[newLang] || TEMPLATES['python'];
            const template = templateGroup[problem.title] || templateGroup['default'];
            setCode(template);
        }
    };

    const handleRun = async () => {
        setConsoleOpen(true);
        setConsoleTab('output');
        setIsRunning(true);
        setOutput('Running...');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/submissions/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language,
                    input: customInput
                })
            });

            const data = await res.json();
            if (data.result) {
                if (data.result.error) {
                    setOutput(`Error:\n${data.result.error}`);
                } else {
                    setOutput(data.result.output || 'No output');
                }
            } else {
                setOutput('Execution failed');
            }
        } catch (error) {
            setOutput('Network error');
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            // Prompt login
            alert("Please login to submit");
            return;
        }

        setConsoleOpen(true);
        setConsoleTab('result');
        setIsSubmitting(true);
        setSubmissionResult(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/submissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    problemId: id,
                    code,
                    language
                })
            });

            if (res.status === 401 || res.status === 500) {
                const err = await res.json();
                if (err.error && err.error.includes("Foreign key constraint")) {
                    alert("Your session seems invalid (Database might have been reset). Please logout and Signup again.");
                }
            }

            const data = await res.json();
            setSubmissionResult(data.submission);
        } catch (error) {
            console.error(error);
            setSubmissionResult({ status: 'Error', error: 'Network Error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
    if (!problem) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Problem not found</div>;

    const getDifficultyColor = (rating: number) => {
        if (rating < 1200) return 'text-gray-400';
        if (rating < 1400) return 'text-green-500';
        if (rating < 1600) return 'text-cyan-500';
        if (rating < 1900) return 'text-blue-500';
        if (rating < 2100) return 'text-purple-500';
        return 'text-red-500';
    };

    return (
        <div className="h-screen flex flex-col bg-black text-[#E6E6E6] overflow-hidden">
            {/* Enhanced Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-gradient-to-r from-[#0D0D0D] to-black backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Link href={`/${locale}/problems`} className="text-gray-400 hover:text-[#E80000] transition-colors group">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">arrow_back</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="font-bold text-lg">{problem.title}</h1>
                        <span className={`text-xs px-3 py-1 rounded-full border font-bold shadow-lg ${getDifficultyColor(problem.rating)} bg-black/50`}>
                            {problem.rating}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-[#1A1A1A] border border-white/20 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#E80000] focus:ring-2 focus:ring-[#E80000]/20 transition-all cursor-pointer hover:bg-[#252525]"
                    >
                        {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-all font-medium border border-white/10 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-base">{isRunning ? 'hourglass_empty' : 'play_arrow'}</span>
                        {isRunning ? 'Running...' : 'Run'}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg text-sm transition-all font-bold shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-base">{isSubmitting ? 'sync' : 'cloud_upload'}</span>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Description */}
                <div className="w-1/2 border-r border-white/10 flex flex-col">
                    <div className="flex border-b border-white/10">
                        <button
                            className={`px-4 py-2 text-sm border-b-2 transition-colors ${activeTab === 'description' ? 'border-[#E80000] text-white' : 'border-transparent text-gray-500'}`}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={`px-4 py-2 text-sm border-b-2 transition-colors ${activeTab === 'submissions' ? 'border-[#E80000] text-white' : 'border-transparent text-gray-500'}`}
                            onClick={() => setActiveTab('submissions')}
                        >
                            Submissions
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {activeTab === 'description' ? (
                            <div className="max-w-none space-y-6">
                                {/* Constraints */}
                                <div className="flex gap-6 p-4 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-500">schedule</span>
                                        <div>
                                            <div className="text-xs text-gray-500">Time Limit</div>
                                            <div className="font-mono font-bold">{problem.timeLimit}ms</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-purple-500">memory</span>
                                        <div>
                                            <div className="text-xs text-gray-500">Memory Limit</div>
                                            <div className="font-mono font-bold">{problem.memoryLimit}MB</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#E80000]">description</span>
                                        Problem Statement
                                    </h2>
                                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap bg-[#0D0D0D] p-6 rounded-xl border border-white/5">
                                        {problem.description}
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="space-y-3">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-yellow-500">label</span>
                                        Tags
                                    </h3>
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="text-xs bg-gradient-to-r from-[#E80000]/20 to-red-900/20 border border-[#E80000]/30 px-3 py-1.5 rounded-full text-[#E80000] font-medium capitalize">
                                            {problem.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {!user ? (
                                    <div className="text-center py-20">
                                        <span className="material-symbols-outlined text-6xl text-gray-700 mb-4">lock</span>
                                        <p className="text-gray-500">Please login to view your submissions</p>
                                    </div>
                                ) : loadingSubmissions ? (
                                    <div className="text-center py-20 text-gray-500">Loading submissions...</div>
                                ) : submissions.length === 0 ? (
                                    <div className="text-center py-20">
                                        <span className="material-symbols-outlined text-6xl text-gray-700 mb-4">code_off</span>
                                        <p className="text-gray-500">No submissions yet. Submit your solution to see history!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#E80000]">history</span>
                                            Your Submissions ({submissions.length})
                                        </h2>
                                        {submissions.map((sub: any) => (
                                            <div
                                                key={sub.id}
                                                className="bg-[#0D0D0D] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        {/* Status Badge */}
                                                        <div className={`px-3 py-1 rounded-lg font-bold text-sm ${sub.status === 'AC'
                                                            ? 'bg-green-500/20 text-green-500 border border-green-500/50'
                                                            : sub.status === 'WA'
                                                                ? 'bg-red-500/20 text-red-500 border border-red-500/50'
                                                                : sub.status === 'TLE'
                                                                    ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                                                                    : 'bg-gray-500/20 text-gray-500 border border-gray-500/50'
                                                            }`}>
                                                            {sub.status}
                                                        </div>

                                                        {/* Score */}
                                                        {sub.score !== undefined && (
                                                            <div className="text-yellow-500 font-bold">
                                                                {sub.score}/100
                                                            </div>
                                                        )}

                                                        {/* Runtime & Memory */}
                                                        <div className="flex gap-4 text-sm text-gray-400">
                                                            <span>⏱️ {sub.runtime || 0}ms</span>
                                                            <span>💾 {sub.memory || 0}KB</span>
                                                        </div>

                                                        {/* Language */}
                                                        <div className="text-sm text-gray-400 capitalize">
                                                            {sub.language}
                                                        </div>

                                                        {/* Timestamp */}
                                                        <div className="text-xs text-gray-500 ml-auto">
                                                            {new Date(sub.createdAt).toLocaleString()}
                                                        </div>
                                                    </div>

                                                    {/* View Code Button */}
                                                    <button
                                                        onClick={() => setSelectedSubmission(sub)}
                                                        className="ml-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">code</span>
                                                        View Code
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Submission Detail Modal */}
                {selectedSubmission && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedSubmission(null)}>
                        <div className="bg-[#0D0D0D] border border-white/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-bold">Submission Details</h2>
                                    <span className={`px-3 py-1 rounded-lg font-bold text-sm ${selectedSubmission.status === 'AC'
                                        ? 'bg-green-500/20 text-green-500 border border-green-500/50'
                                        : 'bg-red-500/20 text-red-500 border border-red-500/50'
                                        }`}>
                                        {selectedSubmission.status}
                                    </span>
                                </div>
                                <button onClick={() => setSelectedSubmission(null)} className="text-gray-500 hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                                {/* Stats */}
                                <div className="grid grid-cols-4 gap-4 mb-6">
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <div className="text-xs text-gray-500 mb-1">Score</div>
                                        <div className="text-xl font-bold text-yellow-500">{selectedSubmission.score || 0}/100</div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <div className="text-xs text-gray-500 mb-1">Runtime</div>
                                        <div className="text-xl font-bold">{selectedSubmission.runtime || 0}ms</div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <div className="text-xs text-gray-500 mb-1">Memory</div>
                                        <div className="text-xl font-bold">{selectedSubmission.memory || 0}KB</div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <div className="text-xs text-gray-500 mb-1">Language</div>
                                        <div className="text-xl font-bold capitalize">{selectedSubmission.language}</div>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {selectedSubmission.error && (
                                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                                        <div className="text-red-500 font-bold text-sm mb-2">Error:</div>
                                        <pre className="text-red-400 text-xs whitespace-pre-wrap">{selectedSubmission.error}</pre>
                                    </div>
                                )}

                                {/* Code */}
                                <div>
                                    <div className="text-sm font-bold mb-2 text-gray-400">Submitted Code:</div>
                                    <div className="bg-[#1e1e1e] rounded-lg p-4 border border-white/10">
                                        <pre className="text-[#d4d4d4] font-mono text-sm overflow-x-auto">{selectedSubmission.code}</pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Right Panel: Editor & Console */}
                <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
                    {/* Editor */}
                    <div className="flex-1 relative">
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full bg-[#1e1e1e] text-[#d4d4d4] p-4 pl-14 font-mono text-sm resize-none outline-none leading-6"
                            spellCheck="false"
                            style={{ tabSize: 4 }}
                        ></textarea>
                        {/* Line Numbers */}
                        <div className="absolute top-0 left-0 p-4 pr-2 text-gray-600 font-mono text-sm leading-6 select-none pointer-events-none">
                            {code.split('\n').map((_, i) => (
                                <div key={i} className="text-right">{i + 1}</div>
                            ))}
                        </div>
                    </div>

                    {/* Enhanced Console */}
                    <div className="bg-[#0D0D0D] border-t border-white/10">
                        <button
                            onClick={() => setConsoleOpen(!consoleOpen)}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-400 hover:bg-white/5 transition-colors font-medium"
                        >
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">terminal</span>
                                <span>Console</span>
                            </div>
                            <span className="material-symbols-outlined text-base">
                                {consoleOpen ? 'expand_more' : 'expand_less'}
                            </span>
                        </button>

                        {consoleOpen && (
                            <div className="h-56 flex flex-col border-t border-white/5">
                                {/* Tabs */}
                                <div className="flex border-b border-white/5 bg-black/40">
                                    <button
                                        className={`px-4 py-2 text-xs font-medium transition-all flex items-center gap-1.5 ${consoleTab === 'output'
                                            ? 'text-white bg-[#E80000]/10 border-b-2 border-[#E80000]'
                                            : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                        onClick={() => setConsoleTab('output')}
                                    >
                                        <span className="material-symbols-outlined text-sm">code</span>
                                        Output
                                    </button>
                                    <button
                                        className={`px-4 py-2 text-xs font-medium transition-all flex items-center gap-1.5 ${consoleTab === 'result'
                                            ? 'text-white bg-[#E80000]/10 border-b-2 border-[#E80000]'
                                            : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                        onClick={() => setConsoleTab('result')}
                                    >
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Test Result
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs bg-black/20">
                                    {consoleTab === 'output' ? (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-gray-500 mb-2 text-xs font-bold uppercase tracking-wider">Custom Input</label>
                                                <textarea
                                                    value={customInput}
                                                    onChange={(e) => setCustomInput(e.target.value)}
                                                    className="w-full h-16 bg-[#1e1e1e] border border-white/10 rounded-lg p-3 text-white resize-none focus:border-[#E80000] focus:ring-2 focus:ring-[#E80000]/20 transition-all"
                                                    placeholder="Enter test input here..."
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label className="block text-gray-500 mb-2 text-xs font-bold uppercase tracking-wider">Standard Output</label>
                                                <div className="bg-[#1e1e1e] border border-white/10 rounded-lg p-3 min-h-[60px] max-h-32 overflow-y-auto">
                                                    <pre className="text-white whitespace-pre-wrap text-xs">{output || 'Run your code to see output...'}</pre>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {isSubmitting ? (
                                                <div className="flex items-center gap-3 text-gray-400 py-4">
                                                    <span className="material-symbols-outlined animate-spin">sync</span>
                                                    <span>Evaluating your submission...</span>
                                                </div>
                                            ) : submissionResult ? (
                                                <div className={`p-5 rounded-xl border-2 ${submissionResult.status === 'AC'
                                                    ? 'bg-gradient-to-br from-green-900/30 to-green-900/10 border-green-500/50'
                                                    : 'bg-gradient-to-br from-red-900/30 to-red-900/10 border-red-500/50'
                                                    }`}>
                                                    {/* Status */}
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className={`material-symbols-outlined text-3xl ${submissionResult.status === 'AC' ? 'text-green-500' : 'text-red-500'
                                                            }`}>
                                                            {submissionResult.status === 'AC' ? 'check_circle' : 'cancel'}
                                                        </span>
                                                        <div>
                                                            <div className={`font-bold text-lg ${submissionResult.status === 'AC' ? 'text-green-500' : 'text-red-500'
                                                                }`}>
                                                                {submissionResult.status === 'AC' ? 'Accepted' : submissionResult.status}
                                                            </div>
                                                            {submissionResult.score !== undefined && (
                                                                <div className="text-yellow-500 font-bold text-sm">
                                                                    Score: {submissionResult.score}/100
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Stats */}
                                                    <div className="grid grid-cols-2 gap-4 text-gray-300 text-xs">
                                                        <div className="bg-black/30 p-3 rounded-lg">
                                                            <div className="text-gray-500 mb-1">Runtime</div>
                                                            <div className="font-bold text-base">{submissionResult.runtime || 0}ms</div>
                                                        </div>
                                                        <div className="bg-black/30 p-3 rounded-lg">
                                                            <div className="text-gray-500 mb-1">Memory</div>
                                                            <div className="font-bold text-base">{submissionResult.memory || 0}KB</div>
                                                        </div>
                                                    </div>

                                                    {/* Error */}
                                                    {submissionResult.error && (
                                                        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                                            <div className="text-red-500 font-bold text-xs mb-1">Error Details:</div>
                                                            <pre className="text-red-400 whitespace-pre-wrap text-xs">{submissionResult.error}</pre>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-10 text-gray-500">
                                                    <span className="material-symbols-outlined text-5xl mb-3 opacity-50">pending_actions</span>
                                                    <p>Submit your code to see test results</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
