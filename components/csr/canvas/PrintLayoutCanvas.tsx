"use client";

import { useEffect, useRef } from "react";
import { calcLayout, cm2px, type LayoutParams, type LayoutCalc } from "./layout-math";

export default function PrintLayoutCanvas({
  params,
  onComputed,
}: {
  params: LayoutParams;
  onComputed?: (c: LayoutCalc & { usedPct: number }) => void;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;

    const maxW = 680;
    const sclW = maxW / params.sheetW;
    const sclH = (maxW * 0.7) / params.sheetH;
    const s = Math.min(sclW, sclH);

    const W = Math.round(cm2px(params.sheetW, s));
    const H = Math.round(cm2px(params.sheetH, s));
    cv.width = W; cv.height = H;

    const ctx = cv.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0,0,W,H);

    // background + sheet frame
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.strokeRect(1,1,W-2,H-2);

    // margin & inner
    const m = cm2px(params.margin, s);
    const innerX = m;
    const innerY = m;
    const innerW = W - m*2;
    const innerH = H - m*2;

    // dashed printable (tanpa gripper)
    ctx.setLineDash([6,6]);
    ctx.strokeStyle = "#94a3b8";
    ctx.strokeRect(innerX, innerY, innerW, innerH);
    ctx.setLineDash([]);

    // gripper line (jika ada)
    let safeYpx = innerY;
    if (params.gripperTop && params.gripperTop > 0) {
      safeYpx = m + cm2px(params.gripperTop, s);
      ctx.strokeStyle = "#f97316";
      ctx.setLineDash([10,6]);
      ctx.beginPath();
      ctx.moveTo(m, safeYpx);
      ctx.lineTo(W - m, safeYpx);
      ctx.stroke();
      ctx.setLineDash([]);
      // green label
      ctx.fillStyle = "#16a34a";
      ctx.font = "12px sans-serif";
      const lbl = "GRIPPER SAFE PRINTABLE AREA";
      const tw = ctx.measureText(lbl).width + 10;
      ctx.fillRect(W/2 - tw/2, safeYpx + 6, tw, 18);
      ctx.fillStyle = "white";
      ctx.fillText(lbl, W/2 - (tw-10)/2, safeYpx + 19);
    }

    // compute layout
    const c = calcLayout(params);
    const pw = cm2px(params.rotate ? params.pieceH : params.pieceW, s);
    const ph = cm2px(params.rotate ? params.pieceW : params.pieceH, s);
    const g  = cm2px(params.gutter, s);

    const usableH = (H - m) - safeYpx - m;
    const startX = innerX + (innerW - (c.across * pw + (c.across-1) * g)) / 2;
    const startY = safeYpx + (usableH - (c.down   * ph + (c.down  -1) * g)) / 2;

    // draw pieces
    const pieceArea = pw*ph;
    let used = 0;
    for (let r=0; r<c.down; r++) {
      for (let col=0; col<c.across; col++) {
        const x = startX + col*(pw+g);
        const y = startY + r*(ph+g);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(x,y,pw,ph);
        // label
        ctx.fillStyle = "white";
        ctx.font = "12px sans-serif";
        const txt = `${Math.round(params.pieceW)}×${Math.round(params.pieceH)} cm`;
        const tw = ctx.measureText(txt).width;
        ctx.fillText(txt, x + pw/2 - tw/2, y + ph/2 + 4);
        used += pieceArea;
      }
    }

    const innerArea = (innerW) * (usableH);
    const usedPct = innerArea > 0 ? +( (used/innerArea)*100 ).toFixed(1) : 0;

    onComputed?.({...c, usedPct});
  }, [params]);

  return <canvas ref={ref} className="border rounded-md shadow-sm bg-white" />;
}
