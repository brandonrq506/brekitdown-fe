import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ThemeToggle } from "./features/theme/components/ThemeToggle";
import { GOALS_ENDPOINT } from "./libs/axios";
import { getGoals } from "./features/goals/api/axios/getGoals";

function App() {
  const [count, setCount] = useState(0);
  const { data, isPending, isError, isSuccess } = useQuery({
    queryKey: [GOALS_ENDPOINT],
    queryFn: getGoals,
  });

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col items-center justify-center gap-6 border-x px-6 text-center">
      <h1 className="text-5xl font-medium tracking-tight text-heading">Get started</h1>
      <p>
        Edit{" "}
        <code className="rounded bg-code px-2 py-1 font-mono text-sm text-heading">
          src/App.tsx
        </code>{" "}
        and save to test HMR
      </p>
      <button
        type="button"
        onClick={() => setCount((count) => count + 1)}
        className="rounded border px-4 py-2 font-mono text-heading hover:border-accent hover:text-accent"
      >
        Count is {count}
      </button>

      {isPending && <p className="text-sm">Loading goals...</p>}
      {isError && <p className="text-sm text-red-500">Error loading goals</p>}
      {isSuccess && <p className="text-sm">{data.data.length} goals loaded</p>}
      <ThemeToggle />
    </main>
  );
}

export default App;
