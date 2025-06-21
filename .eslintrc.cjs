module.exports = {
	extends: [
		'./node_modules/rocket-boots-eslint/eslint-config.cjs',
	],
	rules: {
		// your custom rules here
		'max-lines': ['error', { max: 600, skipComments: true }],
		// 'no-console': [],
	},
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: 'module',
	},
};
