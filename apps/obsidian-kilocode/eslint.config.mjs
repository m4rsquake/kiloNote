import { config } from "../../packages/config-eslint/base.js"

export default [
  ...config,
  {
    languageOptions: {
      globals: {
        document: "readonly",
        window: "readonly",
      },
    },
  },
  {
    ignores: ["dist/*"],
  },
]
