"use client";

import { useEffect, useRef } from "react";

export type LayoutInput = {
  sheetWidthCm: number;   // lebar kertas (cm)
  sheetHeightCm: number;  // tinggi kertas (cm)
  pieceWidthCm: number;   // lebar produk (cm)
  pieceHeightCm: number;  // tinggi produk (cm)
  marginCm: number;       // margin sisi (cm)
  gutterCm: number;       // jarak antar potong (cm)
  rotate: boolean;        // rotasi 90° untuk optimasi
};

export type LayoutResult = {
  across: number;
  down: number;
  perSheet: number;
  usedAreaPct: number;
};

function cmToPx(cm: number, scale: number) {
  // skala fleksibel; 1 cm = scale px
  return cm * scale;
}

export default function SheetCanvas({
  input,
  onComputed,
}: {
  input: LayoutInput;
  onComputed?: (res: LayoutResult) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Tentukan scale agar muat rapi
    const maxPx = 640; // bounding box untuk preview
    const scaleW = maxPx / input.sheetWidthCm;
    const scaleH = (maxPx * 0.7) / input.sheetHeightCm;
    const scale = Math.min(scaleW, scaleH);

    const W = Math.max(320, Math.round(cmToPx(input.sheetWidthCm, scale)));
    const H = Math.max(220, Math.round(cmToPx(input.sheetHeightCm, scale)));
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, W, H);

    // Sheet border
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    // Margin area
    const marginPx = cmToPx(input.marginCm, scale);
    const innerX = marginPx;
    const innerY = marginPx;
    const innerW = W - marginPx * 2;
    const innerH = H - marginPx * 2;

    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(innerX, innerY, innerW, innerH);

    // Piece size (optionally rotated)
    const pwCm = input.rotate ? input.pieceHeightCm : input.pieceWidthCm;
    const phCm = input.rotate ? input.pieceWidthCm : input.pieceHeightCm;

    const pw = cmToPx(pwCm, scale);
    const ph = cmToPx(phCm, scale);
    const gutter = cmToPx(input.gutterCm, scale);

    // Hitung berapa across / down
    const across = Math.max(0, Math.floor((innerW + gutter) / (pw + gutter)));
    const down = Math.max(0, Math.floor((innerH + gutter) / (ph + gutter)));
    const perSheet = across * down;

    // Draw grid
    ctx.fillStyle = "#1e293b"; // potongan
    const startX = innerX + (innerW - (across * pw + (across - 1) * gutter)) / 2;
    const startY = innerY + (innerH - (down * ph + (down - 1) * gutter)) / 2;

    for (let r = 0; r < down; r++) {
      for (let c = 0; c < across; c++) {
        const x = startX + c * (pw + gutter);
        const y = startY + r * (ph + gutter);
        ctx.fillRect(x, y, pw, ph);

        // Label kecil
        ctx.fillStyle = "white";
        ctx.font = "12px sans-serif";
        const label = `${Math.round(input.pieceWidthCm)}×${Math.round(input.pieceHeightCm)}cm`;
        const tw = ctx.measureText(label).width;
        ctx.fillText(label, x + pw / 2 - tw / 2, y + ph / 2 + 4);
        ctx.fillStyle = "#1e293b";
      }
    }

    // Coverage
    const pieceArea = pw * ph;
    const usedArea = perSheet * pieceArea;
    const totalArea = innerW * innerH;
    const usedAreaPct = totalArea > 0 ? (usedArea / totalArea) * 100 : 0;

    onComputed?.({
      across,
      down,
      perSheet,
      usedAreaPct: Number(usedAreaPct.toFixed(1)),
    });
  }, [input, onComputed]);

  return (
    <div className="w-full flex justify-center">
      <canvas ref={canvasRef} className="rounded-md border" />
    </div>
  );
}
