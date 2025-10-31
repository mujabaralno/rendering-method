"use client";

import { useEffect, useRef } from "react";
import { calcLayout, cm2px, type LayoutParams } from "./layout-math";

export default function CuttingCanvas({ params }: { params: LayoutParams }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;

    const s = Math.min(700 / params.sheetW, 450 / params.sheetH);
    const W = Math.round(cm2px(params.sheetW, s));
    const H = Math.round(cm2px(params.sheetH, s));

    cv.width = W;
    cv.height = H;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);

    // Professional cutting board gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#1e40af");
    bgGrad.addColorStop(1, "#1e3a8a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Grid pattern overlay for cutting mat texture
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x < W; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Calculations
    const m = cm2px(params.margin, s);
    const safeTop = m + cm2px(params.gripperTop ?? 0, s);
    const innerW = W - m * 2;
    const innerH = H - m - safeTop;

    const pw = cm2px(params.rotate ? params.pieceH : params.pieceW, s);
    const ph = cm2px(params.rotate ? params.pieceW : params.pieceH, s);
    const g = cm2px(params.gutter, s);

    const c = calcLayout(params);

    const startX = m + (innerW - (c.across * pw + (c.across - 1) * g)) / 2;
    const startY = safeTop + (innerH - (c.down * ph + (c.down - 1) * g)) / 2;

    // Draw cut lines with professional styling
    ctx.strokeStyle = "rgba(251, 191, 36, 0.9)";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);

    // Vertical cut lines
    for (let i = 0; i <= c.across; i++) {
      const x = startX + i * pw + Math.max(0, i - 1) * g;
      
      // Main line
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + c.down * ph + (c.down - 1) * g);
      ctx.stroke();

      // Glow effect
      ctx.strokeStyle = "rgba(251, 191, 36, 0.3)";
      ctx.lineWidth = 6;
      ctx.stroke();
      
      ctx.strokeStyle = "rgba(251, 191, 36, 0.9)";
      ctx.lineWidth = 2;
    }

    // Horizontal cut lines
    for (let j = 0; j <= c.down; j++) {
      const y = startY + j * ph + Math.max(0, j - 1) * g;
      
      // Main line
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + c.across * pw + (c.across - 1) * g, y);
      ctx.stroke();

      // Glow effect
      ctx.strokeStyle = "rgba(251, 191, 36, 0.3)";
      ctx.lineWidth = 6;
      ctx.stroke();
      
      ctx.strokeStyle = "rgba(251, 191, 36, 0.9)";
      ctx.lineWidth = 2;
    }

    // Corner markers for precision
    const markerSize = 12;
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    
    for (let i = 0; i <= c.across; i++) {
      for (let j = 0; j <= c.down; j++) {
        const x = startX + i * pw + Math.max(0, i - 1) * g;
        const y = startY + j * ph + Math.max(0, j - 1) * g;
        
        // Draw corner marker
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#fbbf24";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Label
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CUTTING GUIDE", W / 2, 20);
    
    ctx.font = "11px sans-serif";
    ctx.fillText(`${c.across} × ${c.down} = ${c.perSheet} pieces`, W / 2, 38);

  }, [params]);

  return <canvas ref={ref} className="border rounded-md bg-slate-900" />;
}
