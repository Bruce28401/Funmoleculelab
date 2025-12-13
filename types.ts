export interface Atom {
  id: number;
  element: string; // e.g., "H", "O", "C"
  x: number;
  y: number;
  z: number;
  color: string;
  radius: number;
}

export interface Bond {
  source: number; // index of atom
  target: number; // index of atom
}

export interface MoleculeData {
  name: string;
  formula: string;
  description: string;
  funFact: string;
  properties: {
    state: string;
    meltingPoint: string;
  };
  atoms: Atom[];
  bonds: Bond[];
}

export enum AppState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR
}