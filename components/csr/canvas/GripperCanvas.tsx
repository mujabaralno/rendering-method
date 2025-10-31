"use client";

import { useEffect, useRef } from "react";
import { calcLayout, cm2px, type LayoutParams } from "./layout-math";

export default function GripperCanvas({ params }: { params: LayoutParams }) {
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

    // Sheet background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    const m = cm2px(params.margin, s);
    const innerX = m;
    const innerY = m;
    const innerW = W - m * 2;
    const innerH = H - m * 2;

    // Printable area dashed
    ctx.setLineDash([8, 4]);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(innerX, innerY, innerW, innerH);
    ctx.setLineDash([]);

    // Gripper area with pattern
    const grip = cm2px(params.gripperTop ?? 0, s);
    
    // Diagonal stripe pattern for gripper
    ctx.save();
    ctx.beginPath();
    ctx.rect(innerX, innerY, innerW, grip);
    ctx.clip();
    
    const stripeGrad = ctx.createLinearGradient(innerX, innerY, innerX, innerY + grip);
    stripeGrad.addColorStop(0, "rgba(251, 191, 36, 0.25)");
    stripeGrad.addColorStop(1, "rgba(251, 191, 36, 0.15)");
    ctx.fillStyle = stripeGrad;
    ctx.fillRect(innerX, innerY, innerW, grip);
    
    // Diagonal stripes
    ctx.strokeStyle = "rgba(251, 191, 36, 0.2)";
    ctx.lineWidth = 2;
    const stripeSpacing = 10;
    for (let i = -grip; i < innerW; i += stripeSpacing) {
      ctx.beginPath();
      ctx.moveTo(innerX + i, innerY);
      ctx.lineTo(innerX + i + grip, innerY + grip);
      ctx.stroke();
    }
    
    ctx.restore();

    // Gripper border
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.strokeRect(innerX, innerY, innerW, grip);

    // Warning icons on gripper
    const iconSize = 16;
    const iconY = innerY + grip / 2;
    
    // Left warning icon
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.moveTo(innerX + 20, iconY - iconSize / 2);
    ctx.lineTo(innerX + 20 + iconSize / 2, iconY + iconSize / 2);
    ctx.lineTo(innerX + 20 - iconSize / 2, iconY + iconSize / 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", innerX + 20, iconY);

    // Right warning icon
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.moveTo(W - innerX - 20, iconY - iconSize / 2);
    ctx.lineTo(W - innerX - 20 + iconSize / 2, iconY + iconSize / 2);
    ctx.lineTo(W - innerX - 20 - iconSize / 2, iconY + iconSize / 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = "#ffffff";
    ctx.fillText("!", W - innerX - 20, iconY);

    // Label badge
    ctx.font = "bold 11px sans-serif";
    const lblText = `NO PRINT ZONE - ${params.gripperTop ?? 0} cm`;
    const txtWidth = ctx.measureText(lblText).width;
    const badgeW = txtWidth + 20;
    const badgeH = 24;
    const badgeX = W / 2 - badgeW / 2;
    const badgeY = innerY + grip / 2 - badgeH / 2;

    // Badge with gradient
    const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + badgeH);
    badgeGrad.addColorStop(0, "#f59e0b");
    badgeGrad.addColorStop(1, "#d97706");
    ctx.fillStyle = badgeGrad;
    
    const radius = 6;
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

    // Badge shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fill();
    ctx.shadowColor = "transparent";

    // Badge text
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(lblText, W / 2, badgeY + badgeH / 2);

    // Draw products in safe area
    const c = calcLayout(params);
    const pw = cm2px(params.rotate ? params.pieceH : params.pieceW, s);
    const ph = cm2px(params.rotate ? params.pieceW : params.pieceH, s);
    const g = cm2px(params.gutter, s);

    const safeY = innerY + grip;
    const usableH = H - m - safeY - m;

    const startX = innerX + (innerW - (c.across * pw + (c.across - 1) * g)) / 2;
    const startY = safeY + (usableH - (c.down * ph + (c.down - 1) * g)) / 2;

    for (let r = 0; r < c.down; r++) {
      for (let col = 0; col < c.across; col++) {
        const x = startX + col * (pw + g);
        const y = startY + r * (ph + g);

        // Product with gradient
        const prodGrad = ctx.createLinearGradient(x, y, x + pw, y + ph);
        prodGrad.addColorStop(0, "#10b981");
        prodGrad.addColorStop(1, "#059669");
        ctx.fillStyle = prodGrad;
        ctx.fillRect(x, y, pw, ph);

        // Border
        ctx.strokeStyle = "#047857";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, pw, ph);

        // Checkmark
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + pw * 0.3, y + ph * 0.5);
        ctx.lineTo(x + pw * 0.45, y + ph * 0.65);
        ctx.lineTo(x + pw * 0.7, y + ph * 0.35);
        ctx.stroke();
      }
    }
  }, [params]);

  return <canvas ref={ref} className="border rounded-md shadow-sm" />;
}
