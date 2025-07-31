import { chromaticNotes } from "../data/noteFrequencies";

export function getScaleFrequncies(scale: string[]): number[] {
  return scale.map(note => chromaticNotes[note]);
}