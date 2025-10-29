"use client";

import { useEffect, useRef } from "react";
import { calcLayout, cm2px, type LayoutParams } from "./layout-math";

export default function GripperCanvas({ params }: { params: LayoutParams }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;

    const s = Math.min(700/params.sheetW, 450/params.sheetH);
    const W = Math.round(cm2px(params.sheetW, s));
    const H = Math.round(cm2px(params.sheetH, s));
    cv.width = W; cv.height = H;

    const ctx = cv.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0,0,W,H);

    // sheet
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = "#e2e8f0";
    ctx.strokeRect(0,0,W,H);

    const m = cm2px(params.margin, s);
    const innerX = m;
    const innerY = m;
    const innerW = W - m*2;
    const innerH = H - m*2;

    // printable dashed
    ctx.setLineDash([6,6]);
    ctx.strokeStyle = "#94a3b8";
    ctx.strokeRect(innerX, innerY, innerW, innerH);
    ctx.setLineDash([]);

    // gripper area
    const grip = cm2px(params.gripperTop ?? 0, s);
    ctx.fillStyle = "rgba(250, 204, 21, .25)";
    ctx.fillRect(innerX, innerY, innerW, grip);
    ctx.strokeStyle = "#f59e0b";
    ctx.strokeRect(innerX, innerY, innerW, grip);

    // label
    ctx.fillStyle = "#f59e0b";
    ctx.font = "12px sans-serif";
    ctx.fillText(`Gripper: ${params.gripperTop ?? 0} cm`, innerX + 6, innerY + 14);

    // draw layout like print but clipped
    const c = calcLayout(params);
    const pw = cm2px(params.rotate ? params.pieceH : params.pieceW, s);
    const ph = cm2px(params.rotate ? params.pieceW : params.pieceH, s);
    const g  = cm2px(params.gutter, s);
    const safeY = innerY + grip;

    const usableH = (H - m) - safeY - m;
    const startX = innerX + (innerW - (c.across * pw + (c.across-1) * g)) / 2;
    const startY = safeY + (usableH - (c.down   * ph + (c.down  -1) * g)) / 2;

    for (let r=0;r<c.down;r++){
      for(let col=0;col<c.across;col++){
        const x = startX + col*(pw+g);
        const y = startY + r*(ph+g);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(x,y,pw,ph);
      }
    }
  }, [params]);

  return <canvas ref={ref} className="border rounded-md shadow-sm" />;
}
