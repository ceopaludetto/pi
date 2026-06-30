import eslint from "@antfu/eslint-config";

export default eslint(
	{
		gitignore: true,
		stylistic: {
			indent: "tab",
			quotes: "double",
			semi: true,
			overrides: {
				"style/max-len": ["error", { code: 120, tabWidth: 2 }],
				"style/arrow-parens": ["error", "always"],
				"style/brace-style": ["error", "1tbs"],
				"style/jsx-sort-props": ["warn", {
					shorthandFirst: true,
					reservedFirst: true,
					callbacksLast: true,
				}],
			},
		},
		typescript: {
			overrides: {
				"ts/consistent-type-definitions": ["error", "type"],
				"ts/consistent-type-imports": ["warn", { fixStyle: "separate-type-imports", prefer: "type-imports" }],
				"ts/explicit-member-accessibility": ["warn", { accessibility: "explicit" }],
				"ts/no-floating-promises": "off",
				"ts/no-misused-promises": "off",
				"ts/no-use-before-define": "off",
			},
		},
		formatters: {
			markdown: true,
		},
		isInEditor: false,
	},
	{
		rules: {
			"node/prefer-global/process": "off",
			"unicorn/throw-new-error": "off",

			"perfectionist/sort-imports": ["warn", {
				type: "alphabetical",
				order: "asc",
				ignoreCase: true,
				groups: [
					"side-effect",
					"type",
					"builtin",
					"external",
					"index",
					["internal", "sibling", "parent"],
					"virtual",
				],
				internalPattern: ["^~/.*"],
				customGroups: [
					{ groupName: "virtual", elementNamePattern: "^virtual\\:" },
				],
				newlinesBetween: 1,
				environment: "bun",
			}],
		},
	},
	{
		ignores: [
			// Build artifacts
			"**/dist/**/*",

			// Modules
			"**/node_modules/**/*",
		],
	},
);
