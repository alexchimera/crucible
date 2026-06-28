import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  getCachedMoleculeSvgCount,
  getMoleculeSvg,
  getRDKitModule,
} from "../chemistry/rdkitRenderer";
import { makeCompoundRows, type CompoundRow } from "../data/compounds";

const ROW_HEIGHT = 104;
const STRUCTURE_COLUMN_WIDTH = 232;
const ID_COLUMN_WIDTH = 132;
const SVG_WIDTH = 192;
const SVG_HEIGHT = 82;

const columnHelper = createColumnHelper<CompoundRow>();

type SvgState =
  | { status: "loading" }
  | { status: "ready"; svg: string }
  | { status: "error"; message: string };

type RdkitState =
  | { status: "loading" }
  | { status: "ready"; version: string; initMs: number }
  | { status: "error"; message: string };

export function VirtualizedMoleculeTable() {
  const rows = useMemo(() => makeCompoundRows(420), []);
  const [rdkitState, setRdkitState] = useState<RdkitState>({ status: "loading" });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const startedAt = performance.now();

    getRDKitModule()
      .then((rdkit) => {
        if (!cancelled) {
          setRdkitState({
            status: "ready",
            version: rdkit.version(),
            initMs: Math.round(performance.now() - startedAt),
          });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setRdkitState({
            status: "error",
            message: error instanceof Error ? error.message : "RDKit failed to initialize",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor("smiles", {
        id: "structure",
        header: "Structure",
        size: STRUCTURE_COLUMN_WIDTH,
        cell: ({ row }) => <MoleculeStructureCell compound={row.original} />,
      }),
      columnHelper.accessor("id", {
        header: "ID",
        size: ID_COLUMN_WIDTH,
        cell: (info) => <span className="compound-id">{info.getValue()}</span>,
      }),
      columnHelper.accessor("name", {
        header: "Name",
        size: 210,
      }),
      columnHelper.accessor("series", {
        header: "Series",
        size: 150,
        cell: (info) => <span className="series-pill">{info.getValue()}</span>,
      }),
      columnHelper.accessor("potencyNm", {
        header: "IC50",
        size: 120,
        cell: (info) => `${info.getValue().toLocaleString()} nM`,
      }),
      columnHelper.accessor("clogp", {
        header: "cLogP",
        size: 112,
        cell: (info) => info.getValue().toFixed(2),
      }),
      columnHelper.accessor("tpsa", {
        header: "TPSA",
        size: 112,
        cell: (info) => info.getValue().toFixed(1),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        size: 128,
        cell: (info) => <span className="status-chip">{info.getValue()}</span>,
      }),
      columnHelper.accessor("owner", {
        header: "Owner",
        size: 136,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableRows = table.getRowModel().rows;
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: tableRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 7,
    getItemKey: (index) => tableRows[index]?.id ?? index,
  });

  return (
    <section className="spike-grid" aria-labelledby="grid-title">
      <div className="grid-summary">
        <div>
          <p className="eyebrow">WASM + virtual rows</p>
          <h2 id="grid-title">420 compound rows</h2>
        </div>
        <div className="summary-metrics" aria-label="Spike metrics">
          <span>{renderRdkitState(rdkitState)}</span>
          <span>Row estimate {ROW_HEIGHT}px</span>
          <span>{getCachedMoleculeSvgCount()} cached SVGs</span>
        </div>
      </div>

      <div className="table-viewport" ref={scrollContainerRef}>
        <table className="compound-table" style={{ width: table.getTotalSize() }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    className={getCellClassName(header.column.id)}
                    key={header.id}
                    style={getColumnStyle(header.column.id, header.getSize(), true)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = tableRows[virtualRow.index];

              return (
                <tr
                  data-index={virtualRow.index}
                  key={row.id}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    height: `${ROW_HEIGHT}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      className={getCellClassName(cell.column.id)}
                      key={cell.id}
                      style={getColumnStyle(cell.column.id, cell.column.getSize())}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dl className="spike-notes">
        <div>
          <dt>Rendering boundary</dt>
          <dd>`getMoleculeSvg` owns RDKit now and can later call server thumbnails.</dd>
        </div>
        <div>
          <dt>WASM lifetime</dt>
          <dd>One module promise is reused by every mounted structure cell.</dd>
        </div>
        <div>
          <dt>Virtual body</dt>
          <dd>Rows use `estimateSize` plus measured row elements at a 104px target.</dd>
        </div>
      </dl>
    </section>
  );
}

function MoleculeStructureCell({ compound }: { compound: CompoundRow }) {
  const [svgState, setSvgState] = useState<SvgState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    setSvgState({ status: "loading" });
    getMoleculeSvg({
      smiles: compound.smiles,
      width: SVG_WIDTH,
      height: SVG_HEIGHT,
    })
      .then((svg) => {
        if (!cancelled) {
          setSvgState({ status: "ready", svg });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSvgState({
            status: "error",
            message: error instanceof Error ? error.message : "SVG render failed",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [compound.smiles]);

  return (
    <div className="structure-frame" title={compound.smiles}>
      {svgState.status === "loading" && <span className="structure-placeholder">Loading</span>}
      {svgState.status === "error" && (
        <span className="structure-error">{svgState.message}</span>
      )}
      {svgState.status === "ready" && (
        <div
          aria-label={`${compound.id} structure`}
          className="structure-svg"
          dangerouslySetInnerHTML={{ __html: svgState.svg }}
        />
      )}
    </div>
  );
}

function renderRdkitState(state: RdkitState): string {
  if (state.status === "ready") {
    return `RDKit ${state.version} in ${state.initMs}ms`;
  }

  if (state.status === "error") {
    return "RDKit failed";
  }

  return "RDKit loading";
}

function getCellClassName(columnId: string): string {
  return ["grid-cell", isPinnedColumn(columnId) ? "is-pinned" : "", `col-${columnId}`]
    .filter(Boolean)
    .join(" ");
}

function getColumnStyle(
  columnId: string,
  size: number,
  isHeader = false,
): CSSProperties {
  return {
    flexBasis: `${size}px`,
    width: `${size}px`,
    minWidth: `${size}px`,
    maxWidth: `${size}px`,
    ...getPinnedStyle(columnId, isHeader),
  };
}

function getPinnedStyle(columnId: string, isHeader: boolean): CSSProperties {
  if (columnId === "structure") {
    return {
      left: 0,
      zIndex: isHeader ? 6 : 4,
    };
  }

  if (columnId === "id") {
    return {
      left: STRUCTURE_COLUMN_WIDTH,
      zIndex: isHeader ? 6 : 4,
    };
  }

  return {};
}

function isPinnedColumn(columnId: string): boolean {
  return columnId === "structure" || columnId === "id";
}
