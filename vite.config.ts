import { defineConfig, lazyPlugins } from "vite-plus";
import { devtools } from "@tanstack/devtools-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    ignorePatterns: ["src/routeTree.gen.ts"],
    sortTailwindcss: {
      stylesheet: "./src/index.css",
    },
  },
  test: {
    // Date labels resolve against the viewer's zone, so pin one instead of the host machine's.
    env: { TZ: "UTC" },
    // React Testing Library uses the global afterEach hook for automatic cleanup.
    globals: true,
    // Vitest defaults to Node, which does not provide document or window.
    environment: "jsdom",
    // Temporary solution, disables Node’s experimental global storage. Should be removed once it's fixed.
    execArgv: ["--no-experimental-webstorage"],
    clearMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  lint: {
    ignorePatterns: ["src/routeTree.gen.ts"],
    plugins: ["react", "typescript", "oxc", "import", "unicorn"],
    categories: {
      correctness: "error",
    },
    rules: {
      "react/rules-of-hooks": "error",
      "react/forward-ref-uses-ref": "error",
      "react/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],
      "array-callback-return": "error",
      complexity: ["error", { max: 10, variant: "classic" }],
      "default-case-last": "error",
      "default-param-last": "error",
      "dot-notation": "error",
      eqeqeq: "error",
      "import/max-dependencies": "error",
      "import/no-cycle": "error",
      "import/no-mutable-exports": "error",
      "import/no-self-import": "error",
      "logical-assignment-operators": "error",
      "max-depth": ["error", { max: 3 }],
      "max-lines": ["error", { max: 170, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["error", { max: 20, skipBlankLines: true, skipComments: true }],
      "max-nested-callbacks": ["error", { max: 3 }],
      "no-await-in-loop": "error",
      "no-alert": "error",
      "no-array-constructor": "error",
      "no-case-declarations": "error",
      "no-console": "error",
      "no-duplicate-imports": "error",
      "no-else-return": "error",
      "no-eval": "error",
      "no-fallthrough": "error",
      "no-implicit-coercion": "error",
      "no-implied-eval": "error",
      "no-lonely-if": "error",
      "no-magic-numbers": ["error", { ignore: [-1, 0, 1] }],
      "no-multi-assign": "error",
      "no-negated-condition": "error",
      "no-nested-ternary": "error",
      "no-param-reassign": "error",
      "no-object-constructor": "error",
      "no-promise-executor-return": "error",
      "no-prototype-builtins": "error",
      "no-return-assign": ["error", "always"],
      "no-script-url": "error",
      "no-self-compare": "error",
      "no-template-curly-in-string": "error",
      "no-unmodified-loop-condition": "error",
      "no-unneeded-ternary": "error",
      "no-unreachable-loop": "error",
      "no-use-before-define": ["error", { functions: false }],
      "no-useless-computed-key": "error",
      "no-useless-concat": "error",
      "no-useless-return": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "oxc/branches-sharing-code": "error",
      "oxc/no-barrel-file": "error",
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "prefer-rest-params": "error",
      "prefer-template": "error",
      radix: "error",
      "react/button-has-type": "error",
      "react/checked-requires-onchange-or-readonly": "error",
      "react/display-name": "error",
      "react/jsx-no-target-blank": "error",
      "react/jsx-no-useless-fragment": "error",
      "react/no-clone-element": "error",
      "react/no-danger": "error",
      "react/no-unescaped-entities": "error",
      "react/no-unknown-property": "error",
      "typescript/ban-ts-comment": "error",
      "typescript/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "typescript/no-deprecated": "error",
      "typescript/no-empty-object-type": "error",
      "typescript/no-explicit-any": "error",
      "typescript/no-unsafe-argument": "error",
      "typescript/no-unsafe-assignment": "error",
      "typescript/no-unsafe-call": "error",
      "typescript/no-unsafe-function-type": "error",
      "typescript/no-unsafe-member-access": "error",
      "typescript/no-unsafe-return": "error",
      "typescript/only-throw-error": "error",
      "typescript/prefer-promise-reject-errors": "error",
      "typescript/prefer-ts-expect-error": "error",
      "typescript/require-await": "error",
      "typescript/restrict-plus-operands": "error",
      "typescript/return-await": "error",
      "typescript/strict-boolean-expressions": "error",
      "typescript/switch-exhaustiveness-check": "error",
      "unicorn/catch-error-name": "error",
      "unicorn/explicit-length-check": "error",
      "unicorn/new-for-builtins": "error",
      "unicorn/no-array-callback-reference": "error",
      "unicorn/no-document-cookie": "error",
      "unicorn/no-object-as-default-parameter": "error",
      "unicorn/no-immediate-mutation": "error",
      "unicorn/no-thenable": "error",
      "unicorn/prefer-number-properties": "error",
      "vite-plus/prefer-vite-plus-imports": "error",
      yoda: "error",
    },
    overrides: [
      {
        // Tanstack Router routes.
        files: ["src/routes/**/*.tsx"],
        rules: {
          "react/only-export-components": "off",
        },
      },
      {
        // All source TSX files.
        files: ["src/**/*.tsx"],
        rules: {
          "max-lines-per-function": [
            "error",
            { max: 150, skipBlankLines: true, skipComments: true },
          ],
        },
      },
      {
        // shadcn/ui output, regenerated by `shadcn add`.
        files: ["src/components/ui/**/*.{ts,tsx}"],
        rules: {
          complexity: "off",
          "import/max-dependencies": "off",
          "max-lines": "off",
          "max-lines-per-function": "off",
          "no-magic-numbers": "off",
          "typescript/strict-boolean-expressions": "off",
        },
      },
      {
        // All test files.
        files: ["**/*.spec.{tsx,ts}"],
        rules: {
          // Test files often contain magic numbers for specific test cases.
          "no-magic-numbers": "off",
          // Test files can also be long due to multiple test cases.
          "max-lines-per-function": [
            "error",
            { max: 200, skipBlankLines: true, skipComments: true },
          ],
        },
      },
      {
        files: ["src/constants/**/*.ts"],
        rules: {
          // This directory exists to give numbers a name, so the rule has nothing to add here.
          "no-magic-numbers": "off",
        },
      },
      {
        // Root config files are flat declarations, so a line budget has nothing to add here.
        files: ["*.config.ts"],
        rules: {
          "max-lines": "off",
        },
      },
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },

  /*
    - `devtools()` must be the first plugin in the list.
    - `tanstackRouter()` must be declared before `react()`.
  */
  plugins: lazyPlugins(() => [
    devtools(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      quoteStyle: "double",
      semicolons: true,
    }),
    tailwindcss(),
    react({ compiler: true }),
  ]),
});
