/* eslint-disable no-console, @n8n/community-nodes/no-restricted-globals -- standalone
   CLI script, not part of the published node bundle: console output and
   process.env/exit are the point here. */

/**
 * Standalone live test against the real GetYouTubeTranscript API.
 *
 * Confirms request construction (correct paths, optional params dropped when
 * empty) and response parsing (expected shape on success) for four
 * operations, without needing the n8n runtime.
 *
 * Requires GYT_API_KEY in the environment. Run with:
 *   GYT_API_KEY=sk_live_... npm run test:live
 *
 * Budget note: this hits three free endpoints (/resolve, /channel/latest,
 * /credits) and one paid endpoint (/transcript, 1 credit) - see README
 * "Development" section.
 */

import { buildUrl } from './buildRequest';

const BASE_URL = 'https://getyoutubetranscript.com/api/v1';

const API_KEY = process.env.GYT_API_KEY;

if (!API_KEY) {
	console.error('Set GYT_API_KEY in the environment before running this script.');
	process.exit(1);
}

interface CallResult {
	status: number;
	body: Record<string, unknown>;
	url: string;
}

function getPath(obj: Record<string, unknown>, path: string[]): unknown {
	let current: unknown = obj;
	for (const key of path) {
		if (typeof current !== 'object' || current === null) return undefined;
		current = (current as Record<string, unknown>)[key];
	}
	return current;
}

async function call(
	path: string,
	params: Record<string, string | number | undefined>,
): Promise<CallResult> {
	const url = buildUrl(BASE_URL, path, params);
	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${API_KEY}` },
	});
	const body = (await res.json()) as Record<string, unknown>;
	return { status: res.status, body, url };
}

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail?: unknown): void {
	if (condition) {
		passed += 1;
		console.log(`  PASS - ${label}`);
	} else {
		failed += 1;
		console.log(`  FAIL - ${label}`);
		if (detail !== undefined) console.log('         ', detail);
	}
}

async function main() {
	// --- Pure request-construction checks (no network) ---
	console.log('Request construction (offline):');
	const withEmpty = buildUrl(BASE_URL, '/transcript', { v: 'jNQXAC9IVRw', language: '' });
	check(
		'empty optional "language" is omitted from the URL',
		!withEmpty.includes('language='),
		withEmpty,
	);
	check('required "v" is present', withEmpty.includes('v=jNQXAC9IVRw'), withEmpty);

	const withToken = buildUrl(BASE_URL, '/search', { q: undefined, page_token: 'abc123' });
	check('unset "q" is omitted when page_token is used', !withToken.includes('q='), withToken);
	check('"page_token" is present', withToken.includes('page_token=abc123'), withToken);

	// --- Live checks ---
	console.log('\nOperation: Resolve Channel (/resolve, free)');
	{
		const { status, body, url } = await call('/resolve', { handle: 'youtube' });
		console.log(`  GET ${url}`);
		check('HTTP 200', status === 200, { status, body });
		check('success: true', body.success === true, body);
		check('data.channel_id is a string', typeof getPath(body, ['data', 'channel_id']) === 'string', body);
	}

	console.log('\nOperation: Get Channel Latest Videos (/channel/latest, free)');
	{
		const { status, body, url } = await call('/channel/latest', { channel: 'youtube' });
		console.log(`  GET ${url}`);
		check('HTTP 200', status === 200, { status, body });
		check('success: true', body.success === true, body);
		const data = getPath(body, ['data']);
		check('data is an object', typeof data === 'object' && data !== null, body);
	}

	console.log('\nOperation: Get Credits (/credits, free)');
	{
		const { status, body, url } = await call('/credits', {});
		console.log(`  GET ${url}`);
		check('HTTP 200', status === 200, { status, body });
		check('success: true', body.success === true, body);
		check(
			'data.plan_credits_left is a number',
			typeof getPath(body, ['data', 'plan_credits_left']) === 'number',
			body,
		);
		check(
			'data.plan is a known plan value',
			['free', 'monthly', 'yearly'].includes(getPath(body, ['data', 'plan']) as string),
			body,
		);
	}

	console.log('\nOperation: Get Transcript (/transcript, 1 credit)');
	{
		const { status, body, url } = await call('/transcript', { v: 'jNQXAC9IVRw', language: '' });
		console.log(`  GET ${url}`);
		check('HTTP 200', status === 200, { status, body });
		check('success: true', body.success === true, body);
		const transcript = getPath(body, ['data', 'transcript']);
		check(
			'data.transcript is a non-empty string',
			typeof transcript === 'string' && transcript.length > 0,
			body,
		);
		check('data.video_id matches request', getPath(body, ['data', 'video_id']) === 'jNQXAC9IVRw', body);
	}

	console.log(`\n${passed} passed, ${failed} failed`);
	if (failed > 0) process.exit(1);
}

main().catch((error: unknown) => {
	console.error('Unexpected error while running live tests:', error);
	process.exit(1);
});
