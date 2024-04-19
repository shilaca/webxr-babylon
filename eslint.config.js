import eslint from "@eslint/js";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginReact from "eslint-plugin-react";
import solid from "eslint-plugin-solid/dist/configs/typescript.js";
import globals from "globals";

/** @types import('eslint').Linter.FlatConfig[] */
const commonConfigs = {
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
      XRSessionMode: true,
    },
  },
  plugins: {
    import: eslintPluginImport,
    "jsx-a11y": eslintPluginJsxA11y,
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "tsconfig.json",
      },
      node: true,
    },
  },
  rules: {
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling"],
          "object",
          "type",
          "index",
        ],
        "newlines-between": "never",
        pathGroupsExcludedImportTypes: ["builtin"],
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "no-case-declarations": 0,
    "no-empty-pattern": 0,
    ...eslintPluginJsxA11y.configs["recommended"].rules,
  },
};

/** @types import('eslint').Linter.FlatConfig[] */
const tsConfigs = {
  files: ["**/*.{ts,tsx}"],
  ...solid,
  languageOptions: {
    parser: typescriptEslintParser,
    parserOptions: {
      project: "tsconfig.json",
    },
  },
  plugins: {
    "@typescript-eslint": typescriptEslintPlugin,
    react: eslintPluginReact,
  },
  rules: {
    ...typescriptEslintPlugin.configs["recommended"].rules,
    ...typescriptEslintPlugin.configs["eslint-recommended"].rules,
    "@typescript-eslint/member-delimiter-style": 0,
    "@typescript-eslint/no-unused-vars": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/no-empty-interface": 0,
    "react/jsx-sort-props": [
      "error",
      {
        callbacksLast: true,
        shorthandFirst: true,
      },
    ],
  },
};

/** @type import('eslint').Linter.FlatConfig */
export default [
  eslint.configs.recommended,
  commonConfigs,
  tsConfigs,
  eslintConfigPrettier,
];
