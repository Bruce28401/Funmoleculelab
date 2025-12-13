export const CPK_COLORS: Record<string, string> = {
  H: "#FFFFFF",  // Hydrogen - White
  C: "#2c3e50",  // Carbon - Dark Grey/Black
  N: "#3498db",  // Nitrogen - Blue
  O: "#e74c3c",  // Oxygen - Red
  F: "#2ecc71",  // Fluorine - Green
  Cl: "#2ecc71", // Chlorine - Green
  Br: "#8e44ad", // Bromine - Dark Red/Purple
  I: "#9b59b6",  // Iodine - Dark Violet
  He: "#00FFFF", // Helium
  Ne: "#00FFFF", // Neon
  Ar: "#00FFFF", // Argon
  S: "#f1c40f",  // Sulfur - Yellow
  P: "#e67e22",  // Phosphorus - Orange
  Fe: "#e67e22", // Iron - Orange
  Na: "#8e44ad", // Sodium - Violet
  Mg: "#27ae60", // Magnesium - Green
  Ca: "#95a5a6", // Calcium - Grey
  // Default fallback
  DEFAULT: "#ff00ff"
};

export const ATOM_RADII: Record<string, number> = {
  H: 0.3,
  C: 0.5,
  N: 0.5,
  O: 0.5,
  F: 0.45,
  Cl: 0.6,
  S: 0.6,
  P: 0.6,
  DEFAULT: 0.5
};

export const SAMPLE_MOLECULES = [
  "水 (H2O)",
  "二氧化碳 (CO2)",
  "甲烷 (CH4)",
  "乙醇 (C2H5OH)",
  "葡萄糖 (C6H12O6)",
  "咖啡因 (C8H10N4O2)",
  "阿司匹林 (C9H8O4)"
];