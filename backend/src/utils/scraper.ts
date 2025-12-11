import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedProblem {
    title: string;
    description: string; // HTML
    inputSpec: string; // HTML or text
    outputSpec: string; // HTML or text
    notes?: string;
    timeLimit: string;
    memoryLimit: string;
    tags: string[];
    testCases: { input: string; output: string }[];
    externalSource?: string;
    externalId?: string;
}

export const scrapeCodeforcesProblem = async (url: string): Promise<ScrapedProblem> => {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 Attempt ${attempt}/${maxRetries} to scrape: ${url}`);

            // Add a small delay between retries
            if (attempt > 1) {
                const delay = attempt * 1000; // 1s, 2s, 3s
                console.log(`⏳ Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Referer': 'https://codeforces.com/problemset',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'same-origin',
                    'Upgrade-Insecure-Requests': '1',
                    'Cache-Control': 'max-age=0'
                },
                timeout: 15000,
                validateStatus: (status) => status < 500 // Don't throw on 4xx errors
            });

            // Check if we got a 403 or other error status
            if (typeof data === 'string' && data.includes('403')) {
                throw new Error('Received 403 Forbidden from Codeforces');
            }

            const $ = cheerio.load(data as string);
            const problemStatement = $('.problem-statement');

            if (!problemStatement.length) {
                throw new Error('Problem statement not found. Invalid URL or structure.');
            }

            // Extract ID from URL (e.g., https://codeforces.com/problemset/problem/123/A or /contest/123/problem/A)
            // Regex for Codeforces problem URL
            // Match contest ID and problem index
            const match = url.match(/(?:contest|gym|problemset\/problem)\/(\d+)(?:\/problem)?\/([A-Z][0-9]*)/);
            let externalId = '';
            if (match && match[1] && match[2]) {
                externalId = `${match[1]}/${match[2]}`;
            }

            // 1. Title
            const title = problemStatement.find('.header .title').text().trim();

            // 2. Limits
            const timeLimit = problemStatement.find('.header .time-limit').text().replace('time limit per test', '').trim();
            const memoryLimit = problemStatement.find('.header .memory-limit').text().replace('memory limit per test', '').trim();

            // 3. Description (Children before 'input-specification')
            // This is tricky as CF structure varies. Usually it's the text before Input Specification.
            // We'll simplisticly grab the first child div that contains paragraphs
            let description = '';
            problemStatement.children().each((i, el) => {
                if (i === 1) { // Index 0 is header, Index 1 is usually description text
                    description = $(el).html() || '';
                }
            });

            // 4. Input/Output Specs
            const inputSpec = problemStatement.find('.input-specification').html() || '';
            const outputSpec = problemStatement.find('.output-specification').html() || '';
            const notes = problemStatement.find('.note').html() || undefined;

            // 5. Test Cases
            const testCases: { input: string; output: string }[] = [];
            const inputs = problemStatement.find('.sample-test .input pre');
            const outputs = problemStatement.find('.sample-test .output pre');

            for (let i = 0; i < inputs.length; i++) {
                // CF creates <br> inside pre sometimes for multiple lines
                const inputHtml = $(inputs[i]).html() || '';
                const outputHtml = $(outputs[i]).html() || '';

                // Convert <br> to \n for raw storage
                const input = inputHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
                const output = outputHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();

                testCases.push({ input, output });
            }

            // 6. Tags (Side bar)
            // Only works if we are fetching the contest page structure, but single problem page usually has tags on the side
            // Note: The tags are usually outside .problem-statement in the sidebar
            const tags: string[] = [];
            $('.tag-box').each((_, el) => {
                tags.push($(el).text().trim());
            });

            return {
                title,
                description,
                inputSpec,
                outputSpec,
                notes,
                timeLimit,
                memoryLimit,
                tags,
                testCases,
                externalSource: 'Codeforces',
                externalId
            };

        } catch (error: any) {
            console.error(`❌ Attempt ${attempt} failed:`, error.message);
            lastError = error;

            if (error.response) {
                console.error('Status Code:', error.response.status);
                console.error('Response Headers:', error.response.headers);
                console.error('Response Data (first 500 chars):', String(error.response.data).substring(0, 500));
            }

            // If this was the last attempt, we'll throw outside the loop
            if (attempt === maxRetries) {
                break;
            }
        }
    }

    // If we get here, all retries failed
    throw new Error(`Failed to scrape problem after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
};

