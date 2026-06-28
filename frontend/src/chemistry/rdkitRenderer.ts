import type { RDKitModule } from "@rdkit/rdkit";
import initRDKitModule from "@rdkit/rdkit/dist/RDKit_minimal.js";
import rdkitWasmUrl from "@rdkit/rdkit/dist/RDKit_minimal.wasm?url";

type MoleculeSvgRequest = {
  smiles: string;
  width?: number;
  height?: number;
};

let rdkitModulePromise: Promise<RDKitModule> | null = null;
const moleculeSvgCache = new Map<string, Promise<string>>();

export function getRDKitModule(): Promise<RDKitModule> {
  if (!rdkitModulePromise) {
    rdkitModulePromise = initRDKitModule({
      locateFile: () => rdkitWasmUrl,
    }).then((rdkit) => {
      rdkit.prefer_coordgen(true);
      return rdkit;
    });
  }

  return rdkitModulePromise;
}

export function getMoleculeSvg({
  smiles,
  width = 192,
  height = 82,
}: MoleculeSvgRequest): Promise<string> {
  const cacheKey = `${smiles}:${width}x${height}`;
  const cachedSvg = moleculeSvgCache.get(cacheKey);

  if (cachedSvg) {
    return cachedSvg;
  }

  const svgPromise = renderSmilesToSvg(smiles, width, height);
  moleculeSvgCache.set(cacheKey, svgPromise);
  return svgPromise;
}

export function getCachedMoleculeSvgCount(): number {
  return moleculeSvgCache.size;
}

async function renderSmilesToSvg(
  smiles: string,
  width: number,
  height: number,
): Promise<string> {
  const rdkit = await getRDKitModule();
  const molecule = rdkit.get_mol(smiles);

  if (!molecule) {
    throw new Error(`RDKit could not parse SMILES: ${smiles}`);
  }

  try {
    return molecule.get_svg(width, height);
  } finally {
    molecule.delete();
  }
}
