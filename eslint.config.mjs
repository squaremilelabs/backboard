import { FlatCompat } from "@eslint/eslintrc"

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "plugin:prettier/recommended"),
  {
    rules: {
      "import/order": "warn",
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "prettier/prettier": [
        "warn",
        {
          plugins: [
            "prettier-plugin-tailwindcss",
            "prettier-plugin-classnames",
            "prettier-plugin-merge",
          ],
          semi: false,
          printWidth: 100,
          proseWrap: "always",
          trailingComma: "es5",
          quotes: true,
          quoteProps: "consistent",
        },
      ],
    },
  },
  {
    ignores: ["node_modules"],
  },
]

export default eslintConfig
