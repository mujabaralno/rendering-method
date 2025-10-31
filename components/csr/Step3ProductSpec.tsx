/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaperOption, Product, PrintingMethod } from "@/types";
import { Plus, Trash2, Copy } from "lucide-react";

type Props = {
  value?: Product;
  paperOptions: PaperOption[];
  onChange: (v: Product) => void;
};

const printingMethods: PrintingMethod[] = ["Offset", "Digital", "Inkjet"];

export default function Step3ProductSpec({
  value,
  paperOptions,
  onChange,
}: Props) {
  const v: Product = useMemo<Product>(
    () =>
      value ?? {
        productName: "",
        quantity: 0,
        printing: "Offset",
        sides: 2,
        colors: { front: "CMYK", back: "SameAsFront" },
        size: {
          flat: { widthCm: 0, heightCm: 0 },
          close: { widthCm: 0, heightCm: 0 },
        },
        papers: [],
        finishing: {
          lamination: { enabled: false, side: "Front" },
        },
      },
    [value]
  );

  const set = (patch: Partial<Product>) => onChange({ ...v, ...patch });

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="border-l-4 border-l-[#27aae1]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Basic Information</CardTitle>
          <p className="text-sm text-gray-500">Enter the product details and specifications</p>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="productName" className="text-sm font-medium">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productName"
              value={v.productName}
              onChange={(e) => set({ productName: e.target.value })}
              placeholder="e.g. Business Card, Brochure"
              className="focus:border-[#27aae1] focus:ring-[#27aae1]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min={0}
              value={v.quantity || 0}
              onChange={(e) => set({ quantity: Number(e.target.value) })}
              className="focus:border-[#27aae1] focus:ring-[#27aae1]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="printing" className="text-sm font-medium">
              Printing Method
            </Label>
            <Select
              value={v.printing}
              onValueChange={(val: PrintingMethod) => set({ printing: val })}
            >
              <SelectTrigger id="printing" className="focus:border-[#27aae1] focus:ring-[#27aae1]">
                <SelectValue placeholder="Select printing method" />
              </SelectTrigger>
              <SelectContent>
                {printingMethods.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sides" className="text-sm font-medium">
              Printing Sides
            </Label>
            <Select
              value={String(v.sides)}
              onValueChange={(val) => set({ sides: Number(val) as 1 | 2 })}
            >
              <SelectTrigger id="sides" className="focus:border-[#27aae1] focus:ring-[#27aae1]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Side (Simplex)</SelectItem>
                <SelectItem value="2">2 Sides (Duplex)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frontColor" className="text-sm font-medium">
              Front Side Color
            </Label>
            <Select
              value={v.colors.front}
              onValueChange={(val) =>
                set({
                  colors: {
                    ...v.colors,
                    front: val as Product["colors"]["front"],
                  },
                })
              }
            >
              <SelectTrigger id="frontColor" className="focus:border-[#27aae1] focus:ring-[#27aae1]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CMYK">4 Colors (CMYK)</SelectItem>
                <SelectItem value="1C">1 Color</SelectItem>
                <SelectItem value="Pantone">Pantone</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backColor" className="text-sm font-medium">
              Back Side Color
            </Label>
            <Select
              value={v.colors.back}
              onValueChange={(val) =>
                set({
                  colors: {
                    ...v.colors,
                    back: val as Product["colors"]["back"],
                  },
                })
              }
            >
              <SelectTrigger id="backColor" className="focus:border-[#27aae1] focus:ring-[#27aae1]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="SameAsFront">Same as Front</SelectItem>
                <SelectItem value="CMYK">4 Colors (CMYK)</SelectItem>
                <SelectItem value="1C">1 Color</SelectItem>
                <SelectItem value="Pantone">Pantone</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Size Details */}
      <Card className="border-l-4 border-l-[#ea078b]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Size Details</CardTitle>
          <p className="text-sm text-gray-500">Specify dimensions in centimeters</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700">Flat Size (cm)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="flatWidth" className="text-xs">Width</Label>
                  <Input
                    id="flatWidth"
                    type="number"
                    value={v.size.flat.widthCm}
                    onChange={(e) =>
                      set({
                        size: {
                          ...v.size,
                          flat: { ...v.size.flat, widthCm: Number(e.target.value) },
                        },
                      })
                    }
                    className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flatHeight" className="text-xs">Height</Label>
                  <Input
                    id="flatHeight"
                    type="number"
                    value={v.size.flat.heightCm}
                    onChange={(e) =>
                      set({
                        size: {
                          ...v.size,
                          flat: { ...v.size.flat, heightCm: Number(e.target.value) },
                        },
                      })
                    }
                    className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700">Close Size (cm)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="closeWidth" className="text-xs">Width</Label>
                  <Input
                    id="closeWidth"
                    type="number"
                    value={v.size.close.widthCm}
                    onChange={(e) =>
                      set({
                        size: {
                          ...v.size,
                          close: { ...v.size.close, widthCm: Number(e.target.value) },
                        },
                      })
                    }
                    className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closeHeight" className="text-xs">Height</Label>
                  <Input
                    id="closeHeight"
                    type="number"
                    value={v.size.close.heightCm}
                    onChange={(e) =>
                      set({
                        size: {
                          ...v.size,
                          close: {
                            ...v.size.close,
                            heightCm: Number(e.target.value),
                          },
                        },
                      })
                    }
                    className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              set({ size: { ...v.size, close: { ...v.size.flat } } })
            }
            className="text-[#27aae1] border-[#27aae1] hover:bg-[#27aae1] hover:text-white"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy flat size to close size
          </Button>
        </CardContent>
      </Card>

      {/* Paper Details */}
      <Card className="border-l-4 border-l-[#fbec20]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Paper Selection</CardTitle>
          <p className="text-sm text-gray-500">Add one or more paper types for this product</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {v.papers.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <p className="text-sm">No paper selected yet</p>
              <p className="text-xs">Click the button below to add paper</p>
            </div>
          )}

          {v.papers.map((p, idx) => (
            <div
              key={`${p.id}-${idx}`}
              className="flex gap-3 items-end p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 space-y-2">
                <Label htmlFor={`paper-${idx}`} className="text-sm">
                  Paper {idx + 1}
                </Label>
                <Select
                  value={p.id}
                  onValueChange={(id) => {
                    const opt = paperOptions.find((o) => o.id === id);
                    if (!opt) return;
                    const next = [...v.papers];
                    next[idx] = opt as any;
                    set({ papers: next });
                  }}
                >
                  <SelectTrigger id={`paper-${idx}`} className="focus:border-[#27aae1] focus:ring-[#27aae1]">
                    <SelectValue placeholder="Select paper" />
                  </SelectTrigger>
                  <SelectContent>
                    {paperOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.material} — {o.gsm} gsm
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  set({ papers: v.papers.filter((_, i) => i !== idx) })
                }
                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={() => {
              const first = paperOptions[0];
              if (!first) return;
              set({ papers: [...v.papers, first] });
            }}
            className="w-full text-[#27aae1] border-[#27aae1] hover:bg-[#27aae1] hover:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Paper
          </Button>
        </CardContent>
      </Card>

      {/* Finishing Options */}
      <Card className="border-l-4 border-l-[#27aae1]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Finishing Options</CardTitle>
          <p className="text-sm text-gray-500">Select additional finishing treatments</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id="embossing"
                checked={!!v.finishing.embossing}
                onCheckedChange={(c) =>
                  set({ finishing: { ...v.finishing, embossing: !!c } })
                }
                className="data-[state=checked]:bg-[#27aae1] data-[state=checked]:border-[#27aae1]"
              />
              <Label htmlFor="embossing" className="cursor-pointer text-sm">
                Embossing
              </Label>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id="foiling"
                checked={!!v.finishing.foiling}
                onCheckedChange={(c) =>
                  set({ finishing: { ...v.finishing, foiling: !!c } })
                }
                className="data-[state=checked]:bg-[#27aae1] data-[state=checked]:border-[#27aae1]"
              />
              <Label htmlFor="foiling" className="cursor-pointer text-sm">
                Foiling
              </Label>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id="uvSpot"
                checked={!!v.finishing.uvSpot}
                onCheckedChange={(c) =>
                  set({ finishing: { ...v.finishing, uvSpot: !!c } })
                }
                className="data-[state=checked]:bg-[#27aae1] data-[state=checked]:border-[#27aae1]"
              />
              <Label htmlFor="uvSpot" className="cursor-pointer text-sm">
                UV Spot
              </Label>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <Switch
                id="lamination"
                checked={!!v.finishing.lamination?.enabled}
                onCheckedChange={(c) =>
                  set({
                    finishing: {
                      ...v.finishing,
                      lamination: {
                        ...(v.finishing.lamination ?? { side: "Front" }),
                        enabled: !!c,
                      },
                    },
                  })
                }
                className="data-[state=checked]:bg-[#27aae1]"
              />
              <Label htmlFor="lamination" className="text-sm font-medium">
                Lamination
              </Label>
            </div>

            {v.finishing.lamination?.enabled && (
              <div className="space-y-2 ml-11">
                <Label htmlFor="laminationSide" className="text-xs text-gray-600">
                  Lamination Side
                </Label>
                <Select
                  value={v.finishing.lamination?.side ?? "Front"}
                  onValueChange={(side) =>
                    set({
                      finishing: {
                        ...v.finishing,
                        lamination: {
                          ...(v.finishing.lamination ?? { enabled: true }),
                          side: side as "Front" | "Back" | "Both",
                        },
                      },
                    })
                  }
                >
                  <SelectTrigger id="laminationSide" className="focus:border-[#27aae1] focus:ring-[#27aae1]">
                    <SelectValue placeholder="Select side" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Front">Front Only</SelectItem>
                    <SelectItem value="Back">Back Only</SelectItem>
                    <SelectItem value="Both">Both Sides</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
