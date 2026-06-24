import { describe, expect, test } from "bun:test";

import { bold, cyan, dim, green, hyperlink, magenta, rainbow, yellow } from "../src/color";

describe("bold", () => {
	test("wraps text with bold and reset codes", () => {
		expect(bold("hello")).toBe("\x1B[1mhello\x1B[22m");
	});

	test("works with empty string", () => {
		expect(bold("")).toBe("\x1B[1m\x1B[22m");
	});
});

describe("dim", () => {
	test("wraps text with dim and reset codes", () => {
		expect(dim("hello")).toBe("\x1B[2mhello\x1B[22m");
	});
});

describe("cyan", () => {
	test("wraps text with cyan and foreground-reset codes", () => {
		expect(cyan("text")).toBe("\x1B[96mtext\x1B[39m");
	});
});

describe("green", () => {
	test("wraps text with green and foreground-reset codes", () => {
		expect(green("text")).toBe("\x1B[92mtext\x1B[39m");
	});
});

describe("magenta", () => {
	test("wraps text with magenta and foreground-reset codes", () => {
		expect(magenta("text")).toBe("\x1B[95mtext\x1B[39m");
	});
});

describe("yellow", () => {
	test("wraps text with yellow and foreground-reset codes", () => {
		expect(yellow("text")).toBe("\x1B[93mtext\x1B[39m");
	});
});

describe("hyperlink", () => {
	test("wraps text with OSC 8 hyperlink sequence", () => {
		expect(hyperlink("https://example.com", "click here"))
			.toBe("\x1B]8;;https://example.com\x1B\\click here\x1B]8;;\x1B\\");
	});

	test("uses the provided display text, not the url", () => {
		const res = hyperlink("https://a.com", "label");

		expect(res).toContain("label");
		expect(res).not.toContain("https://a.com\x1B\\https://a.com");
	});
});

describe("rainbow", () => {
	test("applies magenta, yellow, green, cyan in order", () => {
		expect(rainbow("Yolo"))
			.toBe(`${magenta("Y")}${yellow("o")}${green("l")}${cyan("o")}`);
	});

	test("cycles back to the first color after four characters", () => {
		expect(rainbow("abcde"))
			.toBe(`${magenta("a")}${yellow("b")}${green("c")}${cyan("d")}${magenta("e")}`);
	});

	test("returns an empty string for empty input", () => {
		expect(rainbow("")).toBe("");
	});

	test("works with a single character", () => {
		expect(rainbow("X")).toBe(magenta("X"));
	});
});
