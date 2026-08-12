import { useEffect, useState } from "react";
import { api, GOALS_ENDPOINT } from "./libs/axios";

function App() {
  const [count, setCount] = useState(0);
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    const fetchGoals = async () => {
      const response = await api.get(GOALS_ENDPOINT);
      return response.data;
    };

    fetchGoals()
      .then(setGoals)
      .catch((error) => console.error("Error fetching goals:", error));
  }, []);

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
      <p className="text-sm">{goals.length} goals loaded</p>
    </main>
  );
}

export default App;
