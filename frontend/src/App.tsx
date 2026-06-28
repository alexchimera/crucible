import { useEffect, useMemo, useState } from "react";
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
    <main className="shell">
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">Small-molecule design data</p>
          <h1 id="page-title">Crucible</h1>
          <p className="lede">
            A self-hostable workspace for organizing compounds, assays, and design decisions
            across lean discovery teams.
          </p>
          <div className="actions" aria-label="Service status">
            <a className="primary-link" href={`${apiBaseUrl}/health`}>
              API health
            </a>
            <span className={`status status-${healthState}`}>
              {healthState === "checking" && "Checking API"}
              {healthState === "healthy" && "API healthy"}
              {healthState === "unreachable" && "API unreachable"}
            </span>
          </div>
        </div>

        <div className="molecule-panel" aria-hidden="true">
          <div className="ring ring-a" />
          <div className="ring ring-b" />
          <div className="bond bond-a" />
          <div className="bond bond-b" />
          <div className="atom atom-a" />
          <div className="atom atom-b" />
          <div className="atom atom-c" />
          <div className="atom atom-d" />
        </div>
      </section>

      <section className="system-strip" aria-label="Development services">
        <div>
          <span>Web</span>
          <strong>Bun + Vite</strong>
        </div>
        <div>
          <span>API</span>
          <strong>FastAPI</strong>
        </div>
        <div>
          <span>Database</span>
          <strong>Postgres + RDKit</strong>
        </div>
      </section>
    </main>
  );
}

export default App;
