import { useEffect, useMemo, useState } from "react";
import { VirtualizedMoleculeTable } from "./components/VirtualizedMoleculeTable";
import "./styles.css";

type HealthState = "checking" | "healthy" | "unreachable";

function App() {
  const [healthState, setHealthState] = useState<HealthState>("checking");
  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
    [],
  );

  useEffect(() => {
    let cancelled = false;

    fetch(`${apiBaseUrl}/health`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unexpected status ${response.status}`);
        }

        return response.json();
      })
      .then(() => {
        if (!cancelled) {
          setHealthState("healthy");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHealthState("unreachable");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Linear CHI-15</p>
          <h1>RDKit virtual grid spike</h1>
        </div>
        <a className={`health-pill health-pill-${healthState}`} href={`${apiBaseUrl}/health`}>
          {healthState === "checking" && "API checking"}
          {healthState === "healthy" && "API healthy"}
          {healthState === "unreachable" && "API unreachable"}
        </a>
      </header>

      <VirtualizedMoleculeTable />
    </main>
  );
}

export default App;
