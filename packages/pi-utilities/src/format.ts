const ESCAPE_CHARACTER = "\x1B";
const ANSI_SGR_PATTERN = new RegExp(`${ESCAPE_CHARACTER}\\[[0-9;]*m`, "g");

// @keep-sorted
const PROVIDER_NAME_OVERRIDES: Record<string, string> = {
	"amazon": "Amazon",
	"anthropic": "Anthropic",
	"azure": "Azure",
	"cloudflare": "Cloudflare",
	"google": "Google",
	"mistral": "Mistral",
	"openai": "OpenAI",
	"opencode-go": "Opencode Go",
	"opencode": "Opencode",
	"openrouter": "OpenRouter",
};

export function capitalizeFirst(text: string): string {
	if (!text)
		return text;

	return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatProviderName(provider: string): string {
	if (!provider)
		return provider;

	const override = PROVIDER_NAME_OVERRIDES[provider];
	if (override)
		return override;

	return provider.charAt(0).toUpperCase() + provider.slice(1);
}

export function formatTokenCount(count: number): string {
	if (count < 1000)
		return `${count}`;

	return `${(count / 1000).toFixed(1)}k`;
}

export function stripAnsi(text: string): string {
	return text.replace(ANSI_SGR_PATTERN, "");
}
