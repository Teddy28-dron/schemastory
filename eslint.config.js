export default [
  {
    ignores: ['node_modules/**', 'coverage/**', 'examples/report.html'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        Buffer: 'readonly',
        URL: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
      },
    },
    rules: {
      'array-callback-return': 'error',
      eqeqeq: ['error', 'always'],
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-duplicate-imports': 'error',
      'no-else-return': 'error',
      'no-implicit-coercion': 'error',
      'no-shadow': 'error',
      'no-undef': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
    },
  },
];
