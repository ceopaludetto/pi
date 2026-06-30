import { defineConfig } from "@rstest/core";

export default defineConfig({
	projects: [
		"./packages/*",
	],
	reporters: process.env.GITHUB_ACTIONS === "true"
		? [["github-actions", { annotations: true, summary: false }]]
		: ["dot"],
});
