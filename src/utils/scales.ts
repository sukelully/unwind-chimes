const chromaticNotes: Record<string, number> = {
  C4: 261.63,
  Db4: 277.18,
  D4: 293.67,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.228,
  Gb4: 369.99,
  G4: 392.0,
  Ab4: 415.31,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
};

export const cMajPent = ['C4', 'E4', 'G4', 'A4', 'C5'];
export const cMaj7Pent = ['C4', 'E4', 'G4', 'A4', 'B4'];

export function getScaleFrequncies(scale: string[]): number[] {
  return scale.map((note) => chromaticNotes[note]);
}
