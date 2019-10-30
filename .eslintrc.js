module.exports = {
  "extends": [
    "eslint:recommended",
    "plugin:prettier/recommended"
  ],
  "env": {
    "es6": true,
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": 8
  },
  "rules": {
    "no-console": "off",
    "prettier/prettier": ["error", { "singleQuote": true }]
  }
};
