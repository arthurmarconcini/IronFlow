const tseslint = require('typescript-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
);
