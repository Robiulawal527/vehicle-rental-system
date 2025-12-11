// Basic TypeScript bootstrap and feature flag config

type Role = "admin" | "customer";

export interface AppConfig {
	projectName: string;
	version: string;
	features: {
		enableClaudeHaiku45ForAllClients: boolean;
	};
}

// Read from env with safe default
const enableClaudeEnv = process.env.ENABLE_CLAUDE_HAIKU_4_5;
const enableClaude = enableClaudeEnv
	? enableClaudeEnv.toLowerCase() === "true"
	: true; // default enabled for all clients

export const config: AppConfig = {
	projectName: "Vehicle Rental System",
	version: "1.0.0",
	features: {
		enableClaudeHaiku45ForAllClients: enableClaude,
	},
};

// Example utility demonstrating usage of the feature flag
export function isClaudeEnabledForClient(_clientId: string, _role: Role): boolean {
	// Since requirement says "for all clients", we return the global flag
	return config.features.enableClaudeHaiku45ForAllClients;
}

// Small demo runner when invoked directly (node ts-node or compiled)
if (require.main === module) {
	// eslint-disable-next-line no-console
	console.log("Claude Haiku 4.5 enabled:", config.features.enableClaudeHaiku45ForAllClients);
}

