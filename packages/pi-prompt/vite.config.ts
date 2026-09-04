import { fileURLToPath } from "node:url";

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
	resolve: {
		alias: {
			"~": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	test: {
		include: ["test/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
	},
});
