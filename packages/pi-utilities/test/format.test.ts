import { describe, expect, test } from "bun:test";

import { capitalizeFirst, formatProviderName, formatTokenCount, stripAnsi } from "../src/format";

describe("capitalizeFirst", () => {
	test("capitalizes the first letter of a lowercase string", () => {
		expect(capitalizeFirst("hello")).toBe("Hello");
	});

	test("leaves an already-capitalized string unchanged", () => {
		expect(capitalizeFirst("Hello")).toBe("Hello");
	});

	test("works with a single character", () => {
		expect(capitalizeFirst("a")).toBe("A");
		expect(capitalizeFirst("A")).toBe("A");
	});

	test("returns an empty string unchanged", () => {
		expect(capitalizeFirst("")).toBe("");
	});

	test("only changes the first character, leaving the rest as-is", () => {
		expect(capitalizeFirst("hELLO")).toBe("HELLO");
	});
});

describe("formatTokenCount", () => {
	test("returns the exact count when below 1000", () => {
		expect(formatTokenCount(0)).toBe("0");
		expect(formatTokenCount(1)).toBe("1");
		expect(formatTokenCount(999)).toBe("999");
	});

	test("formats counts of exactly 1000 as '1.0k'", () => {
		expect(formatTokenCount(1000)).toBe("1.0k");
	});

	test("formats counts in the thousands with one decimal place", () => {
		expect(formatTokenCount(1500)).toBe("1.5k");
		expect(formatTokenCount(2750)).toBe("2.8k");
		expect(formatTokenCount(10000)).toBe("10.0k");
	});

	test("formats large counts correctly", () => {
		expect(formatTokenCount(100000)).toBe("100.0k");
	});
});

describe("formatProviderName", () => {
	test("maps known provider ids to their display names", () => {
		expect(formatProviderName("anthropic")).toBe("Anthropic");
		expect(formatProviderName("openai")).toBe("OpenAI");
		expect(formatProviderName("google")).toBe("Google");
		expect(formatProviderName("openrouter")).toBe("OpenRouter");
		expect(formatProviderName("opencode-go")).toBe("Opencode Go");
	});

	test("capitalizes the first letter of unknown providers", () => {
		expect(formatProviderName("custom")).toBe("Custom");
		expect(formatProviderName("my-provider")).toBe("My-provider");
	});

	test("returns an empty string unchanged", () => {
		expect(formatProviderName("")).toBe("");
	});
});

describe("stripAnsi", () => {
	test("removes a single SGR sequence", () => {
		expect(stripAnsi("\x1B[1mbold\x1B[22m")).toBe("bold");
	});

	test("removes multiple SGR sequences", () => {
		expect(stripAnsi("\x1B[96mcyan\x1B[39m \x1B[92mgreen\x1B[39m")).toBe("cyan green");
	});

	test("removes sequences with semicolons", () => {
		expect(stripAnsi("\x1B[38;5;208morange\x1B[39m")).toBe("orange");
	});

	test("returns plain text unchanged", () => {
		expect(stripAnsi("no escapes here")).toBe("no escapes here");
	});

	test("returns an empty string unchanged", () => {
		expect(stripAnsi("")).toBe("");
	});

	test("leaves text with no trailing reset intact", () => {
		expect(stripAnsi("\x1B[1mbold without reset")).toBe("bold without reset");
	});

	test("handles multiple consecutive escape sequences", () => {
		expect(stripAnsi("\x1B[1m\x1B[31mtext\x1B[22m\x1B[39m")).toBe("text");
	});
});
