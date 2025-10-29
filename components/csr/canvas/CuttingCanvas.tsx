"use client";

import { useEffect, useRef } from "react";
import { calcLayout, cm2px, type LayoutParams } from "./layout-math";

export default function CuttingCanvas({ params }: { params: LayoutParams }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;

    const s = Math.min(700/params.sheetW, 450/params.sheetH);
    const W = Math.round(cm2px(params.sheetW, s));
    const H = Math.round(cm2px(params.sheetH, s));
    cv.width = W; cv.height = H;

    const ctx = cv.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0,0,W,H);

    // blue board
    ctx.fillStyle = "#1d4ed8";
    ctx.fillRect(0,0,W,H);

    // margin & safe top
    const m = cm2px(params.margin, s);
    const safeTop = m + cm2px(params.gripperTop ?? 0, s);
    const innerW = W - m*2;
    const innerH = H - m - safeTop;

    const pw = cm2px(params.rotate ? params.pieceH : params.pieceW, s);
    const ph = cm2px(params.rotate ? params.pieceW : params.pieceH, s);
    const g  = cm2px(params.gutter, s);
    const c  = calcLayout(params);

    // starting area
    const startX = m + (innerW - (c.across * pw + (c.across-1)*g)) / 2;
    const startY = safeTop + (innerH - (c.down * ph + (c.down-1)*g)) / 2;

    // draw cut grid (dashed)
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.setLineDash([6,6]);

    // vertical
    for (let i=0;i<=c.across;i++){
      const x = startX + i*pw + Math.max(0,i-1)*g;
      ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, startY + c.down*ph + (c.down-1)*g); ctx.stroke();
    }
    // horizontal
    for (let j=0;j<=c.down;j++){
      const y = startY + j*ph + Math.max(0,j-1)*g;
      ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(startX + c.across*pw + (c.across-1)*g, y); ctx.stroke();
    }

    ctx.setLineDash([]);

  }, [params]);

  return <canvas ref={ref} className="border rounded-md bg-slate-900" />;
}
