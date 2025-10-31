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
 const ref = useRef<HTMLCanvasElement>(null);
  const prevResultRef = useRef<string>(""); // 👈 Track previous result

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;

    const maxW = 700;
    const sclW = maxW / params.sheetW;
    const sclH = (maxW * 0.7) / params.sheetH;
    const s = Math.min(sclW, sclH);

    const W = Math.round(cm2px(params.sheetW, s));
    const H = Math.round(cm2px(params.sheetH, s));

    cv.width = W;
    cv.height = H;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);

    // Background with subtle gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#ffffff");
    bgGrad.addColorStop(1, "#f8fafc");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Sheet frame with shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, W - 4, H - 4);
    ctx.shadowColor = "transparent";

    // Margin calculation
    const m = cm2px(params.margin, s);
    const innerX = m;
    const innerY = m;
    const innerW = W - m * 2;
    const innerH = H - m * 2;

    // Printable area (dashed border)
    ctx.setLineDash([8, 4]);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(innerX, innerY, innerW, innerH);
    ctx.setLineDash([]);

    // Gripper area visualization
    let safeYpx = innerY;
    if (params.gripperTop && params.gripperTop > 0) {
      const gripperHeight = cm2px(params.gripperTop, s);
      safeYpx = m + gripperHeight;

      // Gripper zone with gradient
      const gripGrad = ctx.createLinearGradient(innerX, innerY, innerX, safeYpx);
      gripGrad.addColorStop(0, "rgba(251, 146, 60, 0.15)");
      gripGrad.addColorStop(1, "rgba(251, 146, 60, 0.05)");
      ctx.fillStyle = gripGrad;
      ctx.fillRect(innerX, innerY, innerW, gripperHeight);

      // Gripper boundary line
      ctx.strokeStyle = "#fb923c";
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 6]);
      ctx.beginPath();
      ctx.moveTo(m, safeYpx);
      ctx.lineTo(W - m, safeYpx);
      ctx.stroke();
      ctx.setLineDash([]);

      // Professional label badge
      ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      const lblText = "GRIPPER MARGIN";
      const txtWidth = ctx.measureText(lblText).width;
      const badgeW = txtWidth + 16;
      const badgeH = 22;
      const badgeX = W / 2 - badgeW / 2;
      const badgeY = safeYpx - 11;

      // Badge background with gradient
      const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + badgeH);
      badgeGrad.addColorStop(0, "#fb923c");
      badgeGrad.addColorStop(1, "#f97316");
      ctx.fillStyle = badgeGrad;

      // Rounded rectangle for badge
      const radius = 4;
      ctx.beginPath();
      ctx.moveTo(badgeX + radius, badgeY);
      ctx.lineTo(badgeX + badgeW - radius, badgeY);
      ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + radius);
      ctx.lineTo(badgeX + badgeW, badgeY + badgeH - radius);
      ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - radius, badgeY + badgeH);
      ctx.lineTo(badgeX + radius, badgeY + badgeH);
      ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - radius);
      ctx.lineTo(badgeX, badgeY + radius);
      ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
      ctx.closePath();
      ctx.fill();

      // Badge text
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(lblText, W / 2, badgeY + badgeH / 2);
      ctx.textAlign = "left";
    }

    // Compute layout
    const c = calcLayout(params);
    const pw = cm2px(params.rotate ? params.pieceH : params.pieceW, s);
    const ph = cm2px(params.rotate ? params.pieceW : params.pieceH, s);
    const g = cm2px(params.gutter, s);

    const usableH = H - m - safeYpx - m;
    const startX = innerX + (innerW - (c.across * pw + (c.across - 1) * g)) / 2;
    const startY = safeYpx + (usableH - (c.down * ph + (c.down - 1) * g)) / 2;

    // Draw product pieces with professional styling
    const pieceArea = pw * ph;
    let used = 0;

    for (let r = 0; r < c.down; r++) {
      for (let col = 0; col < c.across; col++) {
        const x = startX + col * (pw + g);
        const y = startY + r * (ph + g);

        // Piece gradient fill
        const pieceGrad = ctx.createLinearGradient(x, y, x + pw, y + ph);
        pieceGrad.addColorStop(0, "#27aae1");
        pieceGrad.addColorStop(1, "#1f8bb8");
        ctx.fillStyle = pieceGrad;
        ctx.fillRect(x, y, pw, ph);

        // Piece border
        ctx.strokeStyle = "#1e7ba0";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, pw, ph);

        // Cross marks for cut guides
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        // Horizontal center line
        ctx.beginPath();
        ctx.moveTo(x, y + ph / 2);
        ctx.lineTo(x + pw, y + ph / 2);
        ctx.stroke();

        // Vertical center line
        ctx.beginPath();
        ctx.moveTo(x + pw / 2, y);
        ctx.lineTo(x + pw / 2, y + ph);
        ctx.stroke();
        ctx.setLineDash([]);

        // Piece counter
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const pieceNum = r * c.across + col + 1;
        ctx.fillText(`${pieceNum}`, x + pw / 2, y + ph / 2);

        used += pieceArea;
      }
    }

    // Dimension annotations
    ctx.fillStyle = "#64748b";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";

    // Width dimension
    const dimY = H - 8;
    ctx.fillText(`${params.sheetW} cm`, W / 2, dimY);

    // Height dimension (rotated)
    ctx.save();
    ctx.translate(8, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${params.sheetH} cm`, 0, 0);
    ctx.restore();

    // Calculate utilization
    const innerArea = innerW * innerH;
    const usedPct = innerArea > 0 ? +((used / innerArea) * 100).toFixed(1) : 0;

    // 👇 FIX INFINITE LOOP: Only call onComputed if result actually changed
    const resultKey = `${c.across}-${c.down}-${c.perSheet}-${usedPct}`;
    if (prevResultRef.current !== resultKey) {
      prevResultRef.current = resultKey;
      onComputed?.({ ...c, usedPct });
    }
  }, [params]);

  return <canvas ref={ref} className="border rounded-md shadow-sm bg-white" />;
}
