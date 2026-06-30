import { defineConfig, defineInlineProject } from "@rstest/core";

export default defineConfig({
	projects: [
		defineInlineProject({
			name: "Utilities",
			include: ["test/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
		}),
	],
});
