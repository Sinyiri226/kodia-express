// src/lib/simulation-maps.ts

export const QUARTIERS_OUAGA = [
  { nom: "Patte d'Oie", distanceKm: 3 },
  { nom: "Dassasgho", distanceKm: 7 },
  { nom: "Ouaga 2000", distanceKm: 12 },
  { nom: "Pissy", distanceKm: 8 },
  { nom: "Saaba", distanceKm: 18 },
  { nom: "Tanghin", distanceKm: 6 },
  { nom: "Koulouba", distanceKm: 2 },
  { nom: "Somgandé", distanceKm: 9 },
];

export const calculerPrixSimulation = (distance: number) => {
  if (distance <= 5) return 1000;   // Zone A
  if (distance <= 10) return 2000;  // Zone B
  if (distance <= 15) return 3000;  // Zone C
  return 5000;                      // Zone éloignée / Hors zone
};