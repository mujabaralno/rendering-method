export type LayoutParams = {
  sheetW: number;  // cm
  sheetH: number;  // cm
  margin: number;  // cm
  gutter: number;  // cm
  pieceW: number;  // cm (close width)
  pieceH: number;  // cm (close height)
  rotate: boolean;
  gripperTop?: number;   // cm
  gripperGap?: number;   // cm (jarak aman dari tepi lainnya)
};

export type LayoutCalc = {
  across: number;
  down: number;
  perSheet: number;
  innerW: number; // cm
  innerH: number; // cm
  safeY?: number; // cm (untuk gripper)
};

export function calcLayout(p: LayoutParams): LayoutCalc {
  const pw = p.rotate ? p.pieceH : p.pieceW;
  const ph = p.rotate ? p.pieceW : p.pieceH;

  // gripper: reserve di sisi atas
  const safeTop = (p.gripperTop ?? 0) + p.margin;

  const innerW = p.sheetW - p.margin * 2;
  const innerH = p.sheetH - (p.margin + (p.gripperTop ?? 0)) - p.margin;

  const across = Math.max(0, Math.floor((innerW + p.gutter) / (pw + p.gutter)));
  const down   = Math.max(0, Math.floor((innerH + p.gutter) / (ph + p.gutter)));
  return {
    across, down, perSheet: across * down,
    innerW, innerH, safeY: safeTop,
  };
}

export function cm2px(cm: number, scale: number) {
  return cm * scale;
}
