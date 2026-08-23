// @ts-check
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist', 'coverage', '.husky', 'node_modules'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      jsxA11y.flatConfigs.recommended,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
    ],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
      'import-x/resolver': {
        typescript: true,
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Content files (career.ts, projects/*) are plain data modules with no JSX — react's
      // "must import React"-era rules don't apply, and jsx-a11y is irrelevant there too. Handled
      // per-directory below instead of disabling globally.

      // Allow a justified escape hatch: `any` still requires an inline comment explaining why
      // (PLAN §5.3), this only stops the linter from hard-failing the rare deliberate case.
      '@typescript-eslint/no-explicit-any': 'warn',

      // `type` is used deliberately throughout this codebase (PLAN §4's CareerEntry sketch is a
      // `type`), including for discriminated unions (ProjectBlock) that `interface` cannot
      // express. Stylistic preference only — disable rather than mix declaration styles.
      '@typescript-eslint/consistent-type-definitions': 'off',

      // Content types intentionally union a literal sentinel with `string` (e.g.
      // `string | 'present'`) to document intent even though TS treats it as structurally equal
      // to `string`. This is a deliberate, narrow use — not a general escape hatch.
      '@typescript-eslint/no-redundant-type-constituents': 'off',
    },
  },
  {
    // Vite/Node config files run outside the browser and outside the app tsconfig project.
    files: ['*.config.{js,ts}', '.commitlintrc.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['src/test/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  prettierConfig,
);
