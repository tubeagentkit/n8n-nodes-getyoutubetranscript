import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class GetYouTubeTranscript implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GetYouTubeTranscript',
		name: 'getYouTubeTranscript',
		icon: {
			light: 'file:getyoutubetranscript.svg',
			dark: 'file:getyoutubetranscript.dark.svg',
		},
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Get YouTube transcripts, search, channel, and playlist data via the GetYouTubeTranscript API',
		defaults: {
			name: 'GetYouTubeTranscript',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'getYouTubeTranscriptApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://getyoutubetranscript.com/api/v1',
			headers: {
				Accept: 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Channel', value: 'channel' },
					{ name: 'Playlist', value: 'playlist' },
					{ name: 'Search', value: 'search' },
					{ name: 'Transcript', value: 'transcript' },
				],
				default: 'transcript',
			},

			// ---------------------------------------------------------------
			// Operation - Account
			// ---------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['account'] },
				},
				options: [
					{
						name: 'Get Credits',
						value: 'getCredits',
						action: 'Get credits',
						description: 'Check the remaining credit balance and plan for this key (free)',
						routing: {
							request: {
								method: 'GET',
								url: '/credits',
							},
						},
					},
				],
				default: 'getCredits',
			},

			// ---------------------------------------------------------------
			// Operation - Transcript
			// ---------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['transcript'] },
				},
				options: [
					{
						name: 'Get Transcript',
						value: 'getTranscript',
						action: 'Get transcript',
						description: 'Get the transcript of a YouTube video (1 credit)',
						routing: {
							request: {
								method: 'GET',
								url: '/transcript',
							},
						},
					},
				],
				default: 'getTranscript',
			},

			// ---------------------------------------------------------------
			// Operation - Search
			// ---------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['search'] },
				},
				options: [
					{
						name: 'Search YouTube',
						value: 'searchYoutube',
						action: 'Search videos or channels',
						description: 'Search YouTube for videos or channels (1 credit)',
						routing: {
							request: {
								method: 'GET',
								url: '/search',
							},
						},
					},
				],
				default: 'searchYoutube',
			},

			// ---------------------------------------------------------------
			// Operation - Channel
			// ---------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['channel'] },
				},
				options: [
					{
						name: 'Get Channel Latest Videos',
						value: 'getChannelLatestVideos',
						action: 'Get channel latest videos',
						description: "Get a channel's metadata and latest uploads (free)",
						routing: {
							request: {
								method: 'GET',
								url: '/channel/latest',
							},
						},
					},
					{
						name: 'List Channel Videos',
						value: 'listChannelVideos',
						action: 'List channel videos',
						description: 'List every video a channel has uploaded, paginated (1 credit)',
						routing: {
							request: {
								method: 'GET',
								url: '/channel/videos',
							},
						},
					},
					{
						name: 'Resolve Channel',
						value: 'resolveChannel',
						action: 'Resolve channel',
						description: 'Resolve a channel handle or URL to a channel ID (free)',
						routing: {
							request: {
								method: 'GET',
								url: '/resolve',
							},
						},
					},
					{
						name: 'Search Channel Videos',
						value: 'searchChannelVideos',
						action: 'Search channel videos',
						description: "Search within a channel's videos (1 credit)",
						routing: {
							request: {
								method: 'GET',
								url: '/channel/search',
							},
						},
					},
				],
				default: 'getChannelLatestVideos',
			},

			// ---------------------------------------------------------------
			// Operation - Playlist
			// ---------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['playlist'] },
				},
				options: [
					{
						name: 'List Playlist Videos',
						value: 'listPlaylistVideos',
						action: 'List playlist videos',
						description: 'List every video in a playlist, paginated (1 credit)',
						routing: {
							request: {
								method: 'GET',
								url: '/playlist',
							},
						},
					},
				],
				default: 'listPlaylistVideos',
			},

			// ---------------------------------------------------------------
			// Fields - Get Transcript
			// ---------------------------------------------------------------
			{
				displayName: 'Video',
				name: 'v',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
				description: 'YouTube video URL (full or short) or an 11-character video ID',
				displayOptions: {
					show: { resource: ['transcript'], operation: ['getTranscript'] },
				},
				routing: {
					send: { type: 'query', property: 'v' },
				},
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: '',
				placeholder: 'en',
				description: 'Caption language code, e.g. "en", "es". Defaults to "en" if left empty.',
				displayOptions: {
					show: { resource: ['transcript'], operation: ['getTranscript'] },
				},
				routing: {
					send: { type: 'query', property: 'language', value: '={{$value || undefined}}' },
				},
			},

			// ---------------------------------------------------------------
			// Fields - Search YouTube
			// ---------------------------------------------------------------
			{
				displayName: 'Query',
				name: 'q',
				type: 'string',
				default: '',
				placeholder: 'lofi beats',
				description: 'Search query. Required unless "Page Token" is set.',
				displayOptions: {
					show: { resource: ['search'], operation: ['searchYoutube'] },
				},
				routing: {
					send: { type: 'query', property: 'q', value: '={{$value || undefined}}' },
				},
			},
			{
				displayName: 'Page Token',
				name: 'pageCursor',
				type: 'string',
				default: '',
				description: 'Opaque continuation value from a previous response\'s "pagination.next_page_token", used to fetch the next page instead of a fresh "Query"',
				displayOptions: {
					show: { resource: ['search'], operation: ['searchYoutube'] },
				},
				routing: {
					send: { type: 'query', property: 'page_token', value: '={{$value || undefined}}' },
				},
			},
			{
				displayName: 'Options',
				name: 'searchOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: { resource: ['search'], operation: ['searchYoutube'] },
				},
				options: [
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'Video', value: 'video' },
							{ name: 'Channel', value: 'channel' },
						],
						default: 'video',
						description: 'Restrict results to videos or channels - does not mix both',
						routing: {
							send: { type: 'query', property: 'type', value: '={{$value || undefined}}' },
						},
					},
					{
						displayName: 'Country',
						name: 'country',
						type: 'string',
						default: '',
						placeholder: 'us',
						description: 'Two-letter region code, e.g. "us"',
						routing: {
							send: { type: 'query', property: 'country', value: '={{$value || undefined}}' },
						},
					},
					{
						displayName: 'Language',
						name: 'language',
						type: 'string',
						default: '',
						placeholder: 'en',
						description: 'Result language hint, e.g. "en"',
						routing: {
							send: { type: 'query', property: 'language', value: '={{$value || undefined}}' },
						},
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: { minValue: 1 },
						default: 50,
						description: 'Max number of results to return',
						routing: {
							send: { type: 'query', property: 'limit', value: '={{$value || undefined}}' },
						},
					},
				],
			},

			// ---------------------------------------------------------------
			// Fields - Resolve Channel
			// ---------------------------------------------------------------
			{
				displayName: 'Handle',
				name: 'handle',
				type: 'string',
				required: true,
				default: '',
				placeholder: '@mkbhd',
				description: 'Channel @handle, channel URL, or UC... channel ID.',
				displayOptions: {
					show: { resource: ['channel'], operation: ['resolveChannel'] },
				},
				routing: {
					send: { type: 'query', property: 'handle' },
				},
			},

			// ---------------------------------------------------------------
			// Fields - Get Channel Latest Videos
			// ---------------------------------------------------------------
			{
				displayName: 'Channel',
				name: 'channel',
				type: 'string',
				required: true,
				default: '',
				placeholder: '@mkbhd',
				description: 'Channel @handle, channel URL, or UC... channel ID.',
				displayOptions: {
					show: { resource: ['channel'], operation: ['getChannelLatestVideos'] },
				},
				routing: {
					send: { type: 'query', property: 'channel' },
				},
			},

			// ---------------------------------------------------------------
			// Fields - Search Channel Videos
			// ---------------------------------------------------------------
			{
				displayName: 'Channel',
				name: 'channel',
				type: 'string',
				default: '',
				placeholder: '@mkbhd',
				description:
					'Channel @handle, URL, or UC... channel ID. Required (together with "Query") unless "Continuation" is set.',
				displayOptions: {
					show: { resource: ['channel'], operation: ['searchChannelVideos'] },
				},
				routing: {
					send: { type: 'query', property: 'channel', value: '={{$value || undefined}}' },
				},
			},
			{
				displayName: 'Query',
				name: 'q',
				type: 'string',
				default: '',
				placeholder: 'iphone review',
				description:
					'Query to search within the channel. Required (together with "Channel") unless "Continuation" is set.',
				displayOptions: {
					show: { resource: ['channel'], operation: ['searchChannelVideos'] },
				},
				routing: {
					send: { type: 'query', property: 'q', value: '={{$value || undefined}}' },
				},
			},
			{
				displayName: 'Continuation',
				name: 'continuation',
				type: 'string',
				default: '',
				description: 'Opaque continuation token from a previous response\'s "continuation_token", used to fetch the next page instead of a fresh search',
				displayOptions: {
					show: { resource: ['channel'], operation: ['searchChannelVideos'] },
				},
				routing: {
					send: { type: 'query', property: 'continuation', value: '={{$value || undefined}}' },
				},
			},

			// ---------------------------------------------------------------
			// Fields - List Channel Videos
			// ---------------------------------------------------------------
			{
				displayName: 'Channel',
				name: 'channel',
				type: 'string',
				default: '',
				placeholder: '@mkbhd',
				description:
					'Channel @handle, URL, or UC... channel ID. Required unless "Continuation" is set.',
				displayOptions: {
					show: { resource: ['channel'], operation: ['listChannelVideos'] },
				},
				routing: {
					send: { type: 'query', property: 'channel', value: '={{$value || undefined}}' },
				},
			},
			{
				displayName: 'Continuation',
				name: 'continuation',
				type: 'string',
				default: '',
				description: 'Opaque continuation token from a previous response\'s "continuation_token", used to fetch the next page instead of the first page',
				displayOptions: {
					show: { resource: ['channel'], operation: ['listChannelVideos'] },
				},
				routing: {
					send: { type: 'query', property: 'continuation', value: '={{$value || undefined}}' },
				},
			},

			// ---------------------------------------------------------------
			// Fields - List Playlist Videos
			// ---------------------------------------------------------------
			{
				displayName: 'Playlist',
				name: 'list',
				type: 'string',
				default: '',
				placeholder: 'PLillGF-RfqbYE6Ik_EuXA2iZFcE082B3s',
				description: 'Playlist ID or URL. Required unless "Continuation" is set.',
				displayOptions: {
					show: { resource: ['playlist'], operation: ['listPlaylistVideos'] },
				},
				routing: {
					send: { type: 'query', property: 'list', value: '={{$value || undefined}}' },
				},
			},
			{
				displayName: 'Continuation',
				name: 'continuation',
				type: 'string',
				default: '',
				description: 'Opaque continuation token from a previous response\'s "continuation_token", used to fetch the next page instead of the first page',
				displayOptions: {
					show: { resource: ['playlist'], operation: ['listPlaylistVideos'] },
				},
				routing: {
					send: { type: 'query', property: 'continuation', value: '={{$value || undefined}}' },
				},
			},
		],
	};
}
