export type PianoKey = PianoWhiteKey | PianoBlackKey;

interface PianoWhiteKey {
  type: "white";
  note: string;
  topWidth: number;
  bottomWidth: number;
  topPositionX: number;
  wholePositionX: number;
  register?: number;
  referencePositionX?: number;
}

interface PianoBlackKey {
  type: "black";
  note: string;
  wholePositionX: number;
  register?: number;
  referencePositionX?: number;
}
