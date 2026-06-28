/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "@rdkit/rdkit/dist/RDKit_minimal.js" {
  import type { RDKitLoader } from "@rdkit/rdkit";

  const initRDKitModule: RDKitLoader;
  export default initRDKitModule;
}
