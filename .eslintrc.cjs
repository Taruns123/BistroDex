module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    '@electron-toolkit/eslint-config-ts/recommended',
    '@electron-toolkit/eslint-config-prettier'
  ],
  rules: {
    '@tyepscript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off'
  }
}