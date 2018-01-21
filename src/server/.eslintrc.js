module.exports = {
  extends: "../../.eslintrc.js",
  parser: 'typescript-eslint-parser',
  "plugins": ["typescript"],
  rules: {
    'no-undef': 'off',
    'import/no-duplicates': 'off',
    'no-redeclare': 'off',
    'no-dupe-args': 'off',
    'typescript/no-unused-vars': 'error',
    'typescript/type-annotation-spacing': 'error',
    'typescript/class-name-casing': 'error'
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": false
    }
  },
}
