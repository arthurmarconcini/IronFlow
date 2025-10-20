const tseslint = require('typescript-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ["eslint.config.js"],
  },
  ...tseslint.config(
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
  ),
];
