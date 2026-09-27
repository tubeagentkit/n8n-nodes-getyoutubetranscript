/**
 * Standalone equivalent of the query-building convention used throughout
 * GetYouTubeTranscript.node.ts (`value: '={{$value || undefined}}'`): optional
 * fields that are empty/undefined/null are dropped from the request instead
 * of being sent as blank query params. Extracted here so it can be exercised
 * by a plain Node test script without booting the n8n runtime.
 */

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export function buildQuery(params: QueryParams): Record<string, string> {
	const query: Record<string, string> = {};
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null || value === '') continue;
		query[key] = String(value);
	}
	return query;
}

export function buildUrl(baseUrl: string, path: string, params: QueryParams): string {
	const query = buildQuery(params);
	const search = new URLSearchParams(query).toString();
	return search ? `${baseUrl}${path}?${search}` : `${baseUrl}${path}`;
}
