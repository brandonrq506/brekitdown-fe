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
    plugins: ["react", "typescript", "oxc"],
    categories: {
      correctness: "error",
    },
    rules: {
      "react/rules-of-hooks": "error",
      "react/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    overrides: [
      {
        files: ["src/routes/**/*.tsx"],
        rules: {
          "react/only-export-components": "off",
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
