module.exports = {
	"env": {
		"browser": true,
		"es2021": true,
		"node": true
	},
	"extends": "eslint:recommended",
	"overrides": [
		{
			"env": {
				"node": true
			},
			"files": [
				".eslintrc.{js,cjs}"
			],
			"parserOptions": {
				"sourceType": "script"
			}
		}
	],
	"parserOptions": {
		"ecmaVersion": "latest",
		"sourceType": "module"
	},
	"rules": {
		"indent": [
			"error",
			"tab",
			{ SwitchCase: 1 }
		],
		"linebreak-style": [
			"error",
			"linux"
		],
		"quotes": [
			"error",
			"double",
			{ avoidEscape: true }
		],
		"semi": [
			"error",
			"always"
		]
	}
};
