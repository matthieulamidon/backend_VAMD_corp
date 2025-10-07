import globals from "globals";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Bloc global ignore
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "prisma/**",
      "migrations/**",
      "src/generated/**",
    ],
  },

  // Bloc TypeScript uniquement pour src
  {
    files: ["src/**/*.{ts,mts}"], // <-- pas ESLint config
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json", // OK car src est inclus dans tsconfig.json
      },
      globals: { ...globals.node },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      prettier: eslintPluginPrettier,
    },
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": ["warn"],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "no-console": "off",
      "no-debugger": "warn",
    },
  },

  // Prettier
  prettier,
]);
