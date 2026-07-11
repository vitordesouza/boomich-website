import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', '.astro/', 'shots/', 'test-results/'],
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  ...tseslint.configs.strict,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['tests/**/*.ts', 'playwright.config.ts', 'vitest.config.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  ...astro.configs.recommended,
);
