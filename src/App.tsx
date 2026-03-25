import { useEffect, useState } from "react";
import { Dashboard } from "./components/Dashboard";

export function App() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Pollution Monitoring Dashboard
          </h1>
          <button
            onClick={() => setDark((d) => !d)}
            className="text-xs px-3 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          >
            Toggle Dark Mode
          </button>
        </header>

        <Dashboard />
      </div>
    </div>
  );
}
