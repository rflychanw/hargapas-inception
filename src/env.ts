import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	DATABASE_URL: {
		schema: (value) => value || 'postgres://postgres:postgres@localhost:5432/hargapas'
	},
	OLLAMA_API_KEY: {
		schema: (value) => value || ''
	}
});

