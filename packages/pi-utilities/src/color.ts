export const bold = (text: string): string => `\x1B[1m${text}\x1B[22m`;
export const cyan = (text: string): string => `\x1B[96m${text}\x1B[39m`;
export const dim = (text: string): string => `\x1B[2m${text}\x1B[22m`;
export const green = (text: string): string => `\x1B[92m${text}\x1B[39m`;
export const magenta = (text: string): string => `\x1B[95m${text}\x1B[39m`;
export const yellow = (text: string): string => `\x1B[93m${text}\x1B[39m`;

export function hyperlink(url: string, text: string): string {
	return `\x1B]8;;${url}\x1B\\${text}\x1B]8;;\x1B\\`;
}

const RAINBOW_COLORS: ReadonlyArray<(text: string) => string> = [magenta, yellow, green, cyan];

export function rainbow(text: string): string {
	return [...text]
		.map((character, index) => RAINBOW_COLORS[index % RAINBOW_COLORS.length]!(character))
		.join("");
}
