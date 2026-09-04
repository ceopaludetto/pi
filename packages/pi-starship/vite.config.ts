import { defineConfig } from "vite-plus";

// @keep-sorted
export default defineConfig({
	pack: {
		clean: true,
		dts: { sourcemap: true },
		entry: ["./src/index.ts"],
		exports: { legacy: true },
		format: ["cjs", "esm"],
		publint: true,
		sourcemap: true,
	},
});
