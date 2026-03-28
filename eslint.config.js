import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    plugins: {
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.recommended.rules,
      'jsx-a11y/alt-text': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/no-redundant-roles': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/img-redundant-alt': 'off',
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'prefer-const': 'error',
    },
  },
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'error',
      'no-debugger': 'error',
    },
  },
  {
    files: ['scripts/**/*.{js,mjs,cjs}', 'api/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  },
  {
    files: ['tools/**/*.{js,mjs,cjs,ts,tsx}', '**/*.config.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-empty': 'off',
      'no-useless-escape': 'off',
      'prefer-const': 'off',
    },
  },
  prettier,
]
