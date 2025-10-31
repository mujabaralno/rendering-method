"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
// Asumsi path ini benar, sesuai instruksi Anda
import PrintLayoutCanvas from "@/components/csr/canvas/PrintLayoutCanvas";
import CuttingCanvas from "@/components/csr/canvas/CuttingCanvas";
import GripperCanvas from "@/components/csr/canvas/GripperCanvas";
import { calculatePricing } from "@/lib/pricing";
import type { QuoteFormData } from "@/types";
import { RotateCw, Scissors, Grid3x3, DollarSign } from "lucide-react";

type Props = { form: QuoteFormData; onChange: (f: QuoteFormData) => void };

// Kode ini SAMA PERSIS dengan file Step4Operational.tsx Anda,
// karena sudah merupakan Client Component yang terisolasi dengan baik.
export default function Step4OperationalForm({ form, onChange }: Props) {
  const product = form.products[0];

  // UI State
  const [sheetW, setSheetW] = useState(100);
  const [sheetH, setSheetH] = useState(70);
  const [margin, setMargin] = useState(0.5);
  const [gutter, setGutter] = useState(0.3);
  const [rotate, setRotate] = useState(false);
  const [gripperTop, setGripperTop] = useState(2.0);

  const [computed, setComputed] = useState<{
    perSheet: number;
    usedPct: number;
    across: number;
    down: number;
  } | null>(null);

  // derive params for canvas
  const params = useMemo(() => {
    const w = product?.size.close.widthCm ?? 0;
    const h = product?.size.close.heightCm ?? 0;
    return {
      sheetW,
      sheetH,
      margin,
      gutter,
      rotate,
      gripperTop,
      pieceW: w,
      pieceH: h,
    };
  }, [sheetW, sheetH, margin, gutter, rotate, gripperTop, product]);

  // sync recommended sheets to operational.papers[0]
  useEffect(() => {
    if (!product || !computed) return;
    const rec =
      computed.perSheet > 0
        ? Math.ceil((product.quantity || 0) / computed.perSheet)
        : product.quantity || 0;
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

  if (!product)
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">
          Please complete Step 3 (Product Specification) first.
        </p>
      </div>
    );

  const op = form.operational.papers[0];
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const pricing = useMemo(() => calculatePricing(form), [form]);
  const pricePerSheet = Number(op?.pricePerSheet ?? 0);
  const enteredSheets = Number(op?.enteredSheets ?? op?.recommendedSheets ?? 0);

  return (
    <div className="space-y-6">
      {/* Main Layout Card */}
      <Card className="border-l-4 border-l-[#27aae1]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-[#27aae1]" />
            Sheet Layout Visualization
          </CardTitle>
          <p className="text-sm text-gray-500">
            {product.productName || "Product"} — Interactive layout calculator
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tabs for visualization */}
          <Tabs defaultValue="print" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="print" className="data-[state=active]:bg-[#27aae1] data-[state=active]:text-white">
                Print Layout
              </TabsTrigger>
              <TabsTrigger value="cut" className="data-[state=active]:bg-[#ea078b] data-[state=active]:text-white">
                Cutting
              </TabsTrigger>
              <TabsTrigger value="gripper" className="data-[state=active]:bg-[#fbec20] data-[state=active]:text-gray-900">
                Gripper
              </TabsTrigger>
            </TabsList>

            <TabsContent value="print" className="pt-6">
              <PrintLayoutCanvas
                params={params}
                onComputed={(c) =>
                  setComputed({
                    perSheet: c.perSheet,
                    usedPct: c.usedPct,
                    across: c.across,
                    down: c.down,
                  })
                }
              />
            </TabsContent>

            <TabsContent value="cut" className="pt-6">
              <CuttingCanvas params={params} />
            </TabsContent>

            <TabsContent value="gripper" className="pt-6">
              <GripperCanvas params={params} />
            </TabsContent>
          </Tabs>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-[#27aae1]/5 to-[#27aae1]/10 rounded-lg border border-[#27aae1]/20">
              <div className="text-sm font-semibold text-gray-700 mb-2">Sheet Specifications</div>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Press sheet: {sheetW} × {sheetH} cm</div>
                <div>Printable area: {(sheetW - margin * 2).toFixed(1)} × {(sheetH - margin * 2).toFixed(1)} cm</div>
                <div>Gripper margin: {gripperTop} cm</div>
                <div>Edge margin: {margin} cm</div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-[#ea078b]/5 to-[#ea078b]/10 rounded-lg border border-[#ea078b]/20">
              <div className="text-sm font-semibold text-gray-700 mb-2">Product Layout</div>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Total quantity: {product.quantity} pcs</div>
                <div>Pieces across: {computed?.across ?? 0}</div>
                <div>Pieces down: {computed?.down ?? 0}</div>
                <div>Sheet utilization: <span className="font-semibold text-[#ea078b]">{computed?.usedPct ?? 0}%</span></div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-[#fbec20]/10 to-[#fbec20]/20 rounded-lg border border-[#fbec20]/40">
              <div className="text-sm font-semibold text-gray-700 mb-2">Production Yield</div>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Pieces per sheet: <span className="font-semibold text-gray-900">{computed?.perSheet ?? 0}</span></div>
                <div>Recommended sheets: {op?.recommendedSheets ?? 0}</div>
                <div>Entered sheets: {enteredSheets}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Parameters */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-gray-700">Layout Parameters</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sheetW" className="text-xs">Sheet Width (cm)</Label>
                <Input
                  id="sheetW"
                  type="number"
                  value={sheetW}
                  onChange={(e) => setSheetW(+e.target.value || 0)}
                  className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sheetH" className="text-xs">Sheet Height (cm)</Label>
                <Input
                  id="sheetH"
                  type="number"
                  value={sheetH}
                  onChange={(e) => setSheetH(+e.target.value || 0)}
                  className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="margin" className="text-xs">Edge Margin (cm)</Label>
                <Input
                  id="margin"
                  type="number"
                  step="0.1"
                  value={margin}
                  onChange={(e) => setMargin(+e.target.value || 0)}
                  className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gutter" className="text-xs">Gutter Space (cm)</Label>
                <Input
                  id="gutter"
                  type="number"
                  step="0.1"
                  value={gutter}
                  onChange={(e) => setGutter(+e.target.value || 0)}
                  className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gripper" className="text-xs">Gripper Top (cm)</Label>
                <Input
                  id="gripper"
                  type="number"
                  step="0.1"
                  value={gripperTop}
                  onChange={(e) => setGripperTop(+e.target.value || 0)}
                  className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 w-full">
                  <Switch
                    id="rotate"
                    checked={rotate}
                    onCheckedChange={setRotate}
                    className="data-[state=checked]:bg-[#27aae1]"
                  />
                  <Label htmlFor="rotate" className="flex items-center gap-2 cursor-pointer text-sm">
                    <RotateCw className="h-4 w-4" />
                    Rotate 90°
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational & Cost Card */}
      <Card className="border-l-4 border-l-[#ea078b]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#ea078b]" />
            Operational Details & Costing
          </CardTitle>
          <p className="text-sm text-gray-500">Configure production parameters and pricing</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Paper Details */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h4 className="text-sm font-semibold text-gray-700">Paper Configuration</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Output Width (cm)</Label>
                <Input value={product.size.close.widthCm} readOnly className="bg-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Output Height (cm)</Label>
                <Input value={product.size.close.heightCm} readOnly className="bg-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Recommended Sheets</Label>
                <Input value={op?.recommendedSheets ?? 0} readOnly className="bg-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enteredSheets" className="text-xs">Actual Sheets to Use</Label>
                <Input
                  id="enteredSheets"
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
                  className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                />
              </div>
            </div>
          </div>

          {/* Paper Pricing */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h4 className="text-sm font-semibold text-gray-700">Paper Pricing</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerSheet" className="text-xs">Price per Sheet (AED)</Label>
                <Input
                  id="pricePerSheet"
                  type="number"
                  step="0.01"
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
                  className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sheetsPerPacket" className="text-xs">Sheets per Packet</Label>
                <Input
                  id="sheetsPerPacket"
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
                  className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                />
              </div>
            </div>
          </div>

          {/* Production Costs */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h4 className="text-sm font-semibold text-gray-700">Production Parameters</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plates" className="text-xs">Number of Plates</Label>
                <Input
                  id="plates"
                  type="number"
                  value={form.operational.plates ?? 0}
                  onChange={(e) =>
                    onChange({
                      ...form,
                      operational: { ...form.operational, plates: +e.target.value || 0 },
                    })
                  }
                  className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="units" className="text-xs">Number of Units</Label>
                <Input
                  id="units"
                  type="number"
                  value={form.operational.units ?? 0}
                  onChange={(e) =>
                    onChange({
                      ...form,
                      operational: { ...form.operational, units: +e.target.value || 0 },
                    })
                  }
                  className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="impressions" className="text-xs">Number of Impressions</Label>
                <Input
                  id="impressions"
                  type="number"
                  value={form.operational.impressions ?? 0}
                  onChange={(e) =>
                    onChange({
                      ...form,
                      operational: { ...form.operational, impressions: +e.target.value || 0 },
                    })
                  }
                  className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                />
              </div>
            </div>
          </div>

          {/* Finishing Costs */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              Finishing Costs
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lamination" className="text-xs">Lamination (AED - flat rate)</Label>
                <Input
                  id="lamination"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  onChange={(e) => {
                    const cost = +e.target.value || 0;
                    const others = (form.operational.finishing ?? []).filter(
                      (f) => f.name !== "Lamination"
                    );
                    onChange({
                      ...form,
                      operational: {
                        ...form.operational,
                        finishing: [...others, { name: "Lamination", cost }],
                      },
                    });
                  }}
                  className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uvspot" className="text-xs">UV Spot (AED - flat rate)</Label>
                <Input
                  id="uvspot"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  onChange={(e) => {
                    const cost = +e.target.value || 0;
                    const others = (form.operational.finishing ?? []).filter(
                      (f) => f.name !== "UV Spot"
                    );
                    onChange({
                      ...form,
                      operational: {
                        ...form.operational,
                        finishing: [...others, { name: "UV Spot", cost }],
                      },
                    });
                  }}
                  className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Pricing Summary */}
          <div className="p-5 bg-gradient-to-br from-[#27aae1]/5 via-[#ea078b]/5 to-[#fbec20]/10 rounded-lg border border-gray-200">
            <h4 className="text-base font-semibold mb-4 text-gray-800">Pricing Summary</h4>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Product size:</span>
                <span className="font-medium">{product.size.close.widthCm} × {product.size.close.heightCm} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pieces per sheet:</span>
                <span className="font-medium">{computed?.perSheet ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unit price:</span>
                <span className="font-medium">AED {pricePerSheet.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sheets used:</span>
                <span className="font-medium">{enteredSheets}</span>
              </div>
              
              <Separator className="md:col-span-2 my-2" />
              
              <div className="flex justify-between">
                <span className="text-gray-600">Paper cost:</span>
                <span className="font-medium text-[#27aae1]">AED {pricing.paperCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plate cost:</span>
                <span className="font-medium">AED {pricing.plateCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unit cost:</span>
                <span className="font-medium">AED {pricing.unitCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Finishing cost:</span>
                <span className="font-medium">AED {pricing.finishingCost.toFixed(2)}</span>
              </div>
              
              <Separator className="md:col-span-2 my-2" />
              
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold">AED {pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Margin (15%):</span>
                <span className="font-semibold">AED {pricing.margin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">VAT (5%):</span>
                <span className="font-semibold">AED {pricing.vat.toFixed(2)}</span>
              </div>
              
              <div className="md:col-span-2 pt-3 mt-2 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Estimated Total:</span>
                  <span className="text-2xl font-bold text-[#27aae1]">AED {pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
