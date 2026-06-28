export type CompoundRow = {
  id: string;
  name: string;
  smiles: string;
  series: string;
  potencyNm: number;
  clogp: number;
  tpsa: number;
  status: "queued" | "made" | "assayed" | "watch" | "advance";
  owner: string;
};

const seedCompounds = [
  { name: "Aspirin", smiles: "CC(=O)Oc1ccccc1C(=O)O", series: "Salicylates" },
  { name: "Caffeine", smiles: "Cn1cnc2c1c(=O)n(C)c(=O)n2C", series: "Xanthines" },
  { name: "Acetaminophen", smiles: "CC(=O)Nc1ccc(O)cc1", series: "Anilides" },
  { name: "Ibuprofen", smiles: "CC(C)Cc1ccc(cc1)C(C)C(=O)O", series: "Aryl acids" },
  { name: "Naproxen", smiles: "COc1ccc2cc(ccc2c1)C(C)C(=O)O", series: "Aryl acids" },
  { name: "Lidocaine", smiles: "CCN(CC)CC(=O)Nc1c(C)cccc1C", series: "Anilides" },
  { name: "Diphenhydramine", smiles: "CN(C)CCOC(c1ccccc1)c1ccccc1", series: "Aryl ethers" },
  { name: "Benzamide", smiles: "NC(=O)c1ccccc1", series: "Benzamides" },
  { name: "Benzoic acid", smiles: "O=C(O)c1ccccc1", series: "Aryl acids" },
  { name: "Ethyl benzoate", smiles: "CCOC(=O)c1ccccc1", series: "Esters" },
  { name: "Anisole", smiles: "COc1ccccc1", series: "Aryl ethers" },
  { name: "Phenol", smiles: "Oc1ccccc1", series: "Phenols" },
  { name: "Aniline", smiles: "Nc1ccccc1", series: "Anilines" },
  { name: "Pyridine", smiles: "c1ccncc1", series: "Heteroaryl" },
  { name: "Pyrimidine", smiles: "c1cncnc1", series: "Heteroaryl" },
  { name: "Quinoline", smiles: "c1ccc2ncccc2c1", series: "Fused aryl" },
  { name: "Indole", smiles: "c1ccc2[nH]ccc2c1", series: "Fused aryl" },
  { name: "Chlorobenzene", smiles: "Clc1ccccc1", series: "Halogenated" },
  { name: "Fluorobenzene", smiles: "Fc1ccccc1", series: "Halogenated" },
  { name: "Bromobenzene", smiles: "Brc1ccccc1", series: "Halogenated" },
  { name: "Acetanilide", smiles: "CC(=O)Nc1ccccc1", series: "Anilides" },
  { name: "Benzyl alcohol", smiles: "OCc1ccccc1", series: "Alcohols" },
  { name: "Phenethylamine", smiles: "NCCc1ccccc1", series: "Amines" },
  { name: "Propranolol core", smiles: "CC(C)NCC(O)COc1cccc2ccccc12", series: "Aryl ethers" },
  { name: "Warfarin core", smiles: "CC(=O)CC(c1ccccc1)c1c(O)c2ccccc2oc1=O", series: "Coumarins" },
  { name: "Biphenyl", smiles: "c1ccc(cc1)c1ccccc1", series: "Biaryls" },
  { name: "Tert-butylbenzene", smiles: "CC(C)(C)c1ccccc1", series: "Hydrophobes" },
  { name: "Dimethyl aniline", smiles: "CN(C)c1ccccc1", series: "Anilines" },
  { name: "Ethyl acetate", smiles: "CCOC(C)=O", series: "Esters" },
  { name: "Triethylamine", smiles: "CCN(CC)CC", series: "Amines" },
] as const;

const statuses: CompoundRow["status"][] = ["queued", "made", "assayed", "watch", "advance"];
const owners = ["AK", "CH", "MR", "SB", "JL", "NV"];

export function makeCompoundRows(count: number): CompoundRow[] {
  return Array.from({ length: count }, (_, index) => {
    const seed = seedCompounds[index % seedCompounds.length];
    const batch = Math.floor(index / seedCompounds.length) + 1;
    const hash = hashString(`${seed.smiles}-${index}`);

    return {
      id: `CRB-${(index + 1).toString().padStart(4, "0")}`,
      name: `${seed.name} ${batch}`,
      smiles: seed.smiles,
      series: seed.series,
      potencyNm: 8 + (hash % 9400),
      clogp: 0.7 + ((hash >>> 3) % 420) / 100,
      tpsa: 18 + ((hash >>> 5) % 920) / 10,
      status: statuses[hash % statuses.length],
      owner: owners[hash % owners.length],
    };
  });
}

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
