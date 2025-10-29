"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import PrintLayoutCanvas from "./canvas/PrintLayoutCanvas";
import CuttingCanvas from "./canvas/CuttingCanvas";
import GripperCanvas from "./canvas/GripperCanvas";
import type { QuoteFormData } from "@/types";

type Props = { form: QuoteFormData; onChange: (f: QuoteFormData) => void; };

export default function Step4Operational({ form, onChange }: Props) {
  const product = form.products[0];

  // UI State
  const [sheetW, setSheetW] = useState(100);
  const [sheetH, setSheetH] = useState(70);
  const [margin, setMargin] = useState(0.5);
  const [gutter, setGutter] = useState(0.3);
  const [rotate, setRotate] = useState(false);
  const [gripperTop, setGripperTop] = useState(2.0);

  const [computed, setComputed] = useState<{ perSheet: number; usedPct: number; across: number; down: number } | null>(null);

  // derive params for canvas
  const params = useMemo(() => {
    const w = product?.size.close.widthCm ?? 0;
    const h = product?.size.close.heightCm ?? 0;
    return {
      sheetW, sheetH, margin, gutter, rotate, gripperTop,
      pieceW: w, pieceH: h,
    };
  }, [sheetW, sheetH, margin, gutter, rotate, gripperTop, product]);

  // sync recommended sheets to operational.papers[0]
  useEffect(() => {
    if (!product || !computed) return;
    const rec = computed.perSheet > 0 ? Math.ceil((product.quantity || 0) / computed.perSheet) : product.quantity || 0;
    const prev = form.operational.papers[0];

    onChange({
      ...form,
      operational: {
        ...form.operational,
        papers: [
          {
            inputWidth: sheetW,
            inputHeight: sheetH,
            outputWidth: product.size.close.widthCm,
            outputHeight: product.size.close.heightCm,
            pricePerPacket: prev?.pricePerPacket ?? null,
            pricePerSheet: prev?.pricePerSheet ?? null,
            sheetsPerPacket: prev?.sheetsPerPacket ?? null,
            recommendedSheets: rec,
            enteredSheets: prev?.enteredSheets ?? rec,
            selectedColors: prev?.selectedColors ?? ["CMYK"],
          },
        ],
      },
    });
  }, [computed]); // eslint-disable-line

  if (!product) return <p className="text-sm text-muted-foreground">Lengkapi Step-3 terlebih dahulu.</p>;

  const op = form.operational.papers[0];

  // kalkulasi harga ringkas (dummy logic bisa kamu ganti)
  const perSheetCost = Number(op?.pricePerSheet ?? 0);
  const finishingCost = (form.operational.finishing ?? []).reduce((s, f) => s + (f.cost ?? 0), 0);
  const enteredSheets = Number(op?.enteredSheets ?? op?.recommendedSheets ?? 0);
  const paperCost = perSheetCost * enteredSheets;
  const base = paperCost; // tempat logika offset/digital kalau ingin
  const subtotal = base + finishingCost;
  const vat = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + vat).toFixed(2);

  return (
    <div className="grid xl:grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Sheet Layout Visualization — {product.productName || "Product"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="print" className="flex justify-center items-center w-full">
            <TabsList>
              <TabsTrigger value="print">Print Layout</TabsTrigger>
              <TabsTrigger value="cut">Cutting Operations</TabsTrigger>
              <TabsTrigger value="gripper">Gripper Handling</TabsTrigger>
            </TabsList>

            <TabsContent value="print" className="pt-4 flex">
              <PrintLayoutCanvas
                params={params}
                onComputed={(c) => setComputed({
                  perSheet: c.perSheet, usedPct: c.usedPct,
                  across: c.across, down: c.down
                })}
              />
            </TabsContent>

            <TabsContent value="cut" className="pt-4">
              <CuttingCanvas params={params} />
            </TabsContent>

            <TabsContent value="gripper" className="pt-4">
              <GripperCanvas params={params} />
            </TabsContent>
          </Tabs>

          {/* Specs small cards */}
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-md border p-3">
              <div className="font-medium">Sheet Specs</div>
              <div>Press: {sheetW}×{sheetH} cm</div>
              <div>Printable: {(sheetW - margin*2)}×{(sheetH - margin*2)} cm</div>
              <div>Gripper: {gripperTop} cm</div>
              <div>Margin: {margin} cm</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="font-medium">Product Layout</div>
              <div>Product: {product.quantity} pcs</div>
              <div>Per row: {computed?.across ?? 0}</div>
              <div>Rows: {computed?.down ?? 0}</div>
              <div>Utilization: {computed?.usedPct ?? 0}%</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="font-medium">Yield</div>
              <div>Per Sheet: {computed?.perSheet ?? 0}</div>
              <div>Sheets Rec.: {op?.recommendedSheets ?? 0}</div>
              <div>Sheets Entered: {enteredSheets}</div>
            </div>
          </div>

          <Separator />

          {/* Parameters */}
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Sheet Width (cm)</Label>
              <Input type="number" value={sheetW} onChange={e=>setSheetW(+e.target.value||0)} />
            </div>
            <div>
              <Label className="text-xs">Sheet Height (cm)</Label>
              <Input type="number" value={sheetH} onChange={e=>setSheetH(+e.target.value||0)} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={rotate} onCheckedChange={setRotate} />
              <Label>Rotate 90°</Label>
            </div>
            <div>
              <Label className="text-xs">Margin (cm)</Label>
              <Input type="number" step="0.1" value={margin} onChange={e=>setMargin(+e.target.value||0)} />
            </div>
            <div>
              <Label className="text-xs">Gutter (cm)</Label>
              <Input type="number" step="0.1" value={gutter} onChange={e=>setGutter(+e.target.value||0)} />
            </div>
            <div>
              <Label className="text-xs">Gripper Top (cm)</Label>
              <Input type="number" step="0.1" value={gripperTop} onChange={e=>setGripperTop(+e.target.value||0)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right panel: Paper/Cost */}
      <Card>
        <CardHeader><CardTitle>Operational & Cost</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border p-3">
            <div className="font-medium mb-2">Paper Details</div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Output Width (cm)</Label>
                <Input value={product.size.close.widthCm} readOnly />
              </div>
              <div>
                <Label className="text-xs">Output Height (cm)</Label>
                <Input value={product.size.close.heightCm} readOnly />
              </div>
              <div>
                <Label className="text-xs">Recommended Sheets</Label>
                <Input value={op?.recommendedSheets ?? 0} readOnly />
              </div>
              <div>
                <Label className="text-xs">Enter Sheets</Label>
                <Input
                  type="number"
                  value={op?.enteredSheets ?? 0}
                  onChange={(e) =>
                    onChange({
                      ...form,
                      operational: {
                        ...form.operational,
                        papers: [{ ...(op ?? {} as any), enteredSheets: +e.target.value || 0 }],
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border p-3">
            <div className="font-medium mb-2">Paper Pricing</div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Price per Sheet</Label>
                <Input
                  type="number"
                  value={op?.pricePerSheet ?? 0}
                  onChange={(e) =>
                    onChange({
                      ...form,
                      operational: {
                        ...form.operational,
                        papers: [{ ...(op ?? {} as any), pricePerSheet: +e.target.value || 0 }],
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Sheets per Packet</Label>
                <Input
                  type="number"
                  value={op?.sheetsPerPacket ?? 0}
                  onChange={(e) =>
                    onChange({
                      ...form,
                      operational: {
                        ...form.operational,
                        papers: [{ ...(op ?? {} as any), sheetsPerPacket: +e.target.value || 0 }],
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border p-3">
            <div className="font-medium mb-2">Production Costs</div>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">No. of plates</Label>
                <Input
                  type="number"
                  value={form.operational.plates ?? 0}
                  onChange={(e) =>
                    onChange({ ...form, operational: { ...form.operational, plates: +e.target.value || 0 } })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">No. of units</Label>
                <Input
                  type="number"
                  value={form.operational.units ?? 0}
                  onChange={(e) =>
                    onChange({ ...form, operational: { ...form.operational, units: +e.target.value || 0 } })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">No. of impressions</Label>
                <Input
                  type="number"
                  value={form.operational.impressions ?? 0}
                  onChange={(e) =>
                    onChange({ ...form, operational: { ...form.operational, impressions: +e.target.value || 0 } })
                  }
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border p-3">
            <div className="font-medium mb-2">Finishing Costs</div>
            {/* contoh 2 finishing sederhana */}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Lamination (flat)</Label>
                <Input
                  type="number"
                  placeholder="AED"
                  onChange={(e) => {
                    const cost = +e.target.value || 0;
                    const others = (form.operational.finishing ?? []).filter(f => f.name !== "Lamination");
                    onChange({ ...form, operational: { ...form.operational, finishing: [...others, { name: "Lamination", cost }] }});
                  }}
                />
              </div>
              <div>
                <Label className="text-xs">UV Spot (flat)</Label>
                <Input
                  type="number"
                  placeholder="AED"
                  onChange={(e) => {
                    const cost = +e.target.value || 0;
                    const others = (form.operational.finishing ?? []).filter(f => f.name !== "UV Spot");
                    onChange({ ...form, operational: { ...form.operational, finishing: [...others, { name: "UV Spot", cost }] }});
                  }}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-md border p-3">
            <div className="font-medium mb-2">Excel-Based Pricing Summary (Mock)</div>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>Piece: {product.size.close.widthCm}×{product.size.close.heightCm} cm</div>
              <div>Per Sheet: {computed?.perSheet ?? 0}</div>
              <div>Unit Price: AED {perSheetCost.toFixed(2)}</div>
              <div>Sheets (entered): {enteredSheets}</div>
              <div className="font-medium">Paper Cost: AED {paperCost.toFixed(2)}</div>
              <div>Finishing: AED {finishingCost.toFixed(2)}</div>
              <Separator className="my-1 md:col-span-2"/>
              <div>Subtotal: AED {subtotal.toFixed(2)}</div>
              <div>VAT (5%): AED {vat.toFixed(2)}</div>
              <div className="font-semibold md:col-span-2">Estimated Total: AED {total.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
