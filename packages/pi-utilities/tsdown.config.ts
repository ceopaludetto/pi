import { defineConfig } from "tsdown";

// @keep-sorted
export default defineConfig({
	clean: true,
	dts: { sourcemap: true },
	entry: ["./src/index.ts"],
	exports: { legacy: true },
	format: ["cjs", "esm"],
	publint: true,
	sourcemap: true,
});
