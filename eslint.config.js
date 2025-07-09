import js from "@eslint/js";
import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    plugins: { "jsx-a11y": jsxA11y, "react-hooks": reactHooks, "react-refresh": reactRefresh },
    extends: [
      "plugin:jsx-a11y/recommended",
      "plugin:react-hooks/recommended",
      "plugin:react-refresh/recommended",
      "prettier"
    ],
    rules: {
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "react-refresh/only-export-components": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": ["warn"],
      "prefer-const": "error"
    }
  }
];
