import {
	NodeApiError,
	sleep,
	type IDataObject,
	type IExecuteSingleFunctions,
	type IN8nHttpFullResponse,
	type INodeExecutionData,
	type JsonObject,
} from 'n8n-workflow';

export const API_BASE_URL = 'https://getyoutubetranscript.com/api/v1';

/**
 * Get Transcript with Mode "auto" or "generate" can answer 202 with a job
 * while the AI transcript is being made. Poll GET /transcript/jobs (free)
 * until it answers 200, for at most "Max Wait (Seconds)". A failed job
 * answers an error status, which httpRequest throws. On timeout, or with a
 * max wait of 0, the item is the job itself ({ success, data: null, job }).
 */
export async function waitForAiTranscript(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	if (response.statusCode !== 202) return items;

	const body = response.body as IDataObject;
	const job = body.job as IDataObject | undefined;
	const maxWaitSeconds = this.getNodeParameter('aiMaxWaitSeconds', 600) as number;
	if (!job?.job_id || !(maxWaitSeconds > 0)) return items;

	const timestamps = this.getNodeParameter('timestamps', false) as boolean;
	const intervalMs = Math.max(1, Number(job.poll_interval_seconds) || 5) * 1000;
	const deadline = Date.now() + maxWaitSeconds * 1000;
	let latest = body;

	while (Date.now() < deadline) {
		await sleep(Math.max(0, Math.min(intervalMs, deadline - Date.now())));
		let poll: IN8nHttpFullResponse;
		try {
			poll = (await this.helpers.httpRequestWithAuthentication.call(this, 'getYouTubeTranscriptApi', {
				method: 'GET',
				url: `${API_BASE_URL}/transcript/jobs`,
				qs: timestamps ? { id: job.job_id, timestamps: true } : { id: job.job_id },
				headers: { Accept: 'application/json' },
				json: true,
				returnFullResponse: true,
			})) as IN8nHttpFullResponse;
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject);
		}
		latest = poll.body as IDataObject;
		if (poll.statusCode !== 202) break;
	}

	return [{ json: latest }];
}
