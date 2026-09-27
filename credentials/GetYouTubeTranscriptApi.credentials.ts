import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class GetYouTubeTranscriptApi implements ICredentialType {
	name = 'getYouTubeTranscriptApi';

	displayName = 'GetYouTubeTranscript API';

	icon: Icon = {
		light: 'file:../nodes/GetYouTubeTranscript/getyoutubetranscript.svg',
		dark: 'file:../nodes/GetYouTubeTranscript/getyoutubetranscript.dark.svg',
	};

	documentationUrl = 'https://getyoutubetranscript.com/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Your GetYouTubeTranscript API key (starts with "sk_live_"). Get a free key with 100 credits at https://getyoutubetranscript.com - no card required.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// /resolve is a free (0-credit) endpoint, so testing the credential never spends a credit.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://getyoutubetranscript.com/api/v1',
			url: '/resolve',
			method: 'GET',
			qs: {
				handle: 'youtube',
			},
		},
	};
}
