import { PianoKey } from "./types";

export const PIANO_SCALE = 0.01;

export const KEY_PARAMS: PianoKey[] = [
  {
    type: "white",
    note: "C",
    topWidth: 1.4,
    bottomWidth: 2.3,
    topPositionX: -0.45,
    wholePositionX: -14.4,
  },
  { type: "black", note: "C#", wholePositionX: -13.45 },
  {
    type: "white",
    note: "D",
    topWidth: 1.4,
    bottomWidth: 2.4,
    topPositionX: 0,
    wholePositionX: -12,
  },
  { type: "black", note: "D#", wholePositionX: -10.6 },
  {
    type: "white",
    note: "E",
    topWidth: 1.4,
    bottomWidth: 2.3,
    topPositionX: 0.45,
    wholePositionX: -9.6,
  },
  {
    type: "white",
    note: "F",
    topWidth: 1.3,
    bottomWidth: 2.4,
    topPositionX: -0.55,
    wholePositionX: -7.2,
  },
  { type: "black", note: "F#", wholePositionX: -6.35 },
  {
    type: "white",
    note: "G",
    topWidth: 1.3,
    bottomWidth: 2.3,
    topPositionX: -0.2,
    wholePositionX: -4.8,
  },
  { type: "black", note: "G#", wholePositionX: -3.6 },
  {
    type: "white",
    note: "A",
    topWidth: 1.3,
    bottomWidth: 2.3,
    topPositionX: 0.2,
    wholePositionX: -2.4,
  },
  { type: "black", note: "A#", wholePositionX: -0.85 },
  {
    type: "white",
    note: "B",
    topWidth: 1.3,
    bottomWidth: 2.4,
    topPositionX: 0.55,
    wholePositionX: 0,
  },
];
