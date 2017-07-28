module.exports = {
  root: true,
  parser: 'babel-eslint',
  env: {
    browser: true,
    node: true
  },
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html',
    'flowtype'
  ],
  // add your custom rules here
  rules: {
    semi: ["error", "always", { "omitLastInOneLineBlock": true}],
    "flowtype/define-flow-type": 1,
    "flowtype/use-flow-type": 1
  },
  globals: {}
}
