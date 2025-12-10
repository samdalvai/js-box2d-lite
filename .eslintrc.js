module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    plugins: [],
    rules: {
        'semi': [
            'warn',
            'always'
        ],
        'quotes': ['warn', 'single'],
        '@typescript-eslint/no-unused-vars': 'warn',
        'indent': ['warn', 4, {
            'SwitchCase': 1
        }],
        '@typescript-eslint/no-explicit-any': 'off'
    },
};
