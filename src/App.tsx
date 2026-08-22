import { useState } from "react";

import { ThemeToggle } from "./features/theme/components/ThemeToggle";

function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col items-center justify-center gap-6 border-x px-6 text-center">
      <h1 className="text-5xl font-medium tracking-tight text-foreground">Get started</h1>
      <p>
        Edit{" "}
        <code className="rounded bg-muted px-2 py-1 font-mono text-sm text-foreground">
          src/App.tsx
        </code>{" "}
        and save to test HMR
      </p>
      <button
        type="button"
        onClick={() => setCount((count) => count + 1)}
        className="rounded border px-4 py-2 font-mono text-foreground hover:border-primary hover:text-primary"
      >
        Count is {count}
      </button>

      <ThemeToggle />
    </main>
  );
}

export default App;
