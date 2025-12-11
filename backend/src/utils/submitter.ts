import axios from 'axios';
import * as cheerio from 'cheerio';

interface SubmitResult {
    success: boolean;
    submissionId?: string;
    message: string;
}

export const submitToCodeforces = async (
    problemId: string, // e.g., "123/A" or "123A"
    code: string,
    languageId: string, // CF Language ID (e.g., '54' for C++17)
    jsessionId: string
): Promise<SubmitResult> => {
    try {
        const [contestId, index] = problemId.split('/'); // Assumes format "123/A"
        if (!contestId || !index) throw new Error('Invalid problem ID format');

        const client = axios.create({
            baseURL: 'https://codeforces.com',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Cookie': `JSESSIONID=${jsessionId};`
            },
            withCredentials: true
        });

        // 1. Get CSRF Token from Submit Page
        const submitPageUrl = `/contest/${contestId}/submit`;
        const { data: pageData } = await client.get(submitPageUrl);
        const $ = cheerio.load(pageData as string);
        const csrfToken = $('meta[name="X-Csrf-Token"]').attr('content');

        if (!csrfToken) {
            return { success: false, message: 'Failed to retrieve CSRF token. Session might be invalid.' };
        }

        // 2. Submit Code
        const formData = new URLSearchParams();
        formData.append('csrf_token', csrfToken);
        formData.append('ftaa', 'unknown'); // Anti-bot
        formData.append('bfaa', 'unknown'); // Anti-bot
        formData.append('action', 'submitSolutionFormSubmitted');
        formData.append('submittedProblemIndex', index);
        formData.append('programTypeId', languageId);
        formData.append('source', code);
        formData.append('tabSize', '4');
        formData.append('_tta', '111'); // Random anti-bot

        const submitResponse = await client.post(
            `/contest/${contestId}/submit?csrf_token=${csrfToken}`,
            formData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Origin': 'https://codeforces.com',
                    'Referer': `https://codeforces.com${submitPageUrl}`
                },
                maxRedirects: 0, // We expect a 302 redirect on success
                validateStatus: (status: number) => status >= 200 && status < 400
            } as any
        );

        if (submitResponse.status === 302) {
            // Redirect means likely success (or error page, but usually My Submissions)
            return { success: true, message: 'Submission queued', submissionId: 'pending' };
        }

        return { success: false, message: 'Submission failed. Check logs.' };

    } catch (error: any) {
        console.error('CF Submit Error:', error.message);
        return { success: false, message: error.message || 'Submission error' };
    }
};
