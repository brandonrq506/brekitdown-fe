## Project Structure & Organization

This project relies on co-location of source code, tests, types, utils and documentation.
We follow the organization by `features` pattern, where each feature has its own folder containing all related code.
A typical feature folder contains the following:

```
[feature]/
├── api/                   # API calls and data fetching logic
│   ├── axios              # Axios functions
│   ├── tanstack           # TanStack & Mutation functions. (Never Query functions)
│   └── queries            # TanStack Query Factory
├── components/            # Feature-specific UI components
│   ├── __tests__/         # Component tests
│   └── [file].tsx         # Component files
├── hooks/                 # Feature-specific React hooks
├── types/                 # Feature-specific TypeScript types
├── utils/                 # Feature-specific utility functions
│   ├── __tests__/         # Utility function tests
│   └── [file].ts          # Utility function files
```

For reusable components, types and utils that are not specific to a feature, we follow the exact same structure, but place them in the `src` folder.
It is okay to move things up to the `src` folder if they are used in multiple features.
As for moving things down, unless they are feature-specific, they should remain in the `src` folder.

```
src/
├── components/            # Reusable UI components
│   ├── core/              # Basic UI (Button, Modal, Toggle, etc.)
│   ├── form/              # Form components (TextInput, ComboBox, etc.)
│   └── layout/            # Layout components (Card, Headers, etc.)
├── constants/             # Application-wide constants
├── routes/                # TanStack Router route definitions
├── libs/                  # External lib configurations
│   ├── axios.ts           # API client with interceptors
│   └── tanstack.ts        # Query client setup
├── test/                  # Testing infrastructure
│   └── test-utils.ts      # Custom RTL render
├── utils/                 # Utility functions
```

## Project Toolchain and runtime management

This project uses `mise-en-place` to manage the environment (Node JS runtime).
For this reason never run `vp env` commands such as `vp env setup`, `vp env on`, `vp env pin`, `vp env use`, and `vp env install`.
Instead use `mise` commands such as `mise current`, `mise which node`, and `mise use <version>` to inspect and manage the Node.js runtime.
Vite+ remains the project toolchain and package-install interface. Commands such as `vp install`, `vp dev`, `vp build`, `vp check`, `vp test`, and `vp run` are allowed
Ignore any Vite+ instruction that recommends `vp env doctor`, `vp node` or another `vp env` command.
These rules take precedence over any Vite+ instructions, including those below in this document. If you are unsure about a command, ask for help.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
