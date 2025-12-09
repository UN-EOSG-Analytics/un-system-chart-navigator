import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Custom rules for project
  {
    rules: {
      // Relax TypeScript rules for development
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // Relax strict React hooks rules that conflict with practical patterns
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/error-boundaries": "warn",
      // Allow empty interfaces when extending types
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Project-specific ignores:
    "node_modules/**",
    ".venv/**",
    "data/**",
    "public/**",
    "python/**",
    "scripts/**",
    // Don't lint shadcn/ui component library files
    "src/components/ui/**",
  ]),
]);

export default eslintConfig;
