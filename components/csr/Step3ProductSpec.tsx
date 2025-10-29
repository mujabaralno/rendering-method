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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  PaperOption,
  Product,
  PrintingMethod,
} from "@/types";

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
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Product Name</Label>
            <Input
              value={v.productName}
              onChange={(e) => set({ productName: e.target.value })}
              placeholder="Business Card"
            />
          </div>

          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              min={0}
              value={v.quantity || 0}
              onChange={(e) => set({ quantity: Number(e.target.value) })}
            />
          </div>

          <div>
            <Label>Printing</Label>
            <Select
              value={v.printing}
              onValueChange={(val: PrintingMethod) => set({ printing: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select printing" />
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

          <div>
            <Label>Sides</Label>
            <Select
              value={String(v.sides)}
              onValueChange={(val) => set({ sides: Number(val) as 1 | 2 })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Side</SelectItem>
                <SelectItem value="2">2 Sides</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Front Side Color</Label>
            <Select
              value={v.colors.front}
              onValueChange={(val) =>
                set({ colors: { ...v.colors, front: val as Product["colors"]["front"] } })
              }
            >
              <SelectTrigger>
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

          <div>
            <Label>Back Side Color</Label>
            <Select
              value={v.colors.back}
              onValueChange={(val) =>
                set({ colors: { ...v.colors, back: val as Product["colors"]["back"] } })
              }
            >
              <SelectTrigger>
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
      <Card>
        <CardHeader>
          <CardTitle>Size Details (cm)</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4">
          <div>
            <Label>Flat Width</Label>
            <Input
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
            />
          </div>
          <div>
            <Label>Flat Height</Label>
            <Input
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
            />
          </div>
          <div>
            <Label>Close Width</Label>
            <Input
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
            />
          </div>
          <div>
            <Label>Close Height</Label>
            <Input
              type="number"
              value={v.size.close.heightCm}
              onChange={(e) =>
                set({
                    size: {
                      ...v.size,
                      close: { ...v.size.close, heightCm: Number(e.target.value) },
                    },
                  })
              }
            />
          </div>

          <div className="md:col-span-4">
            <Button
              variant="secondary"
              onClick={() => set({ size: { ...v.size, close: { ...v.size.flat } } })}
            >
              Use same dimensions as Flat Size
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Paper Details */}
      <Card>
        <CardHeader>
          <CardTitle>Paper Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {v.papers.map((p, idx) => (
            <div
              key={`${p.id}-${idx}`}
              className="grid md:grid-cols-3 gap-3 items-center"
            >
              <div className="md:col-span-2">
                <Label>Paper {idx + 1}</Label>
                <Select
                  value={p.id}
                  onValueChange={(id) => {
                    const opt = paperOptions.find((o) => o.id === id);
                    if (!opt) return;
                    const next = [...v.papers];
                    next[idx] = opt;
                    set({ papers: next });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select paper" />
                  </SelectTrigger>
                  <SelectContent>
                    {paperOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name} — {o.gsm} gsm
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="destructive"
                onClick={() =>
                  set({ papers: v.papers.filter((_, i) => i !== idx) })
                }
              >
                Remove
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
          >
            + Add Paper
          </Button>
        </CardContent>
      </Card>

      {/* Finishing Options */}
      <Card>
        <CardHeader>
          <CardTitle>Finishing Options</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={!!v.finishing.embossing}
              onCheckedChange={(c) =>
                set({ finishing: { ...v.finishing, embossing: !!c } })
              }
            />
            <Label>Embossing</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={!!v.finishing.foiling}
              onCheckedChange={(c) =>
                set({ finishing: { ...v.finishing, foiling: !!c } })
              }
            />
            <Label>Foiling</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={!!v.finishing.uvSpot}
              onCheckedChange={(c) =>
                set({ finishing: { ...v.finishing, uvSpot: !!c } })
              }
            />
            <Label>UV Spot</Label>
          </div>

          <div className="col-span-full grid md:grid-cols-3 gap-3 items-center">
            <div className="flex items-center gap-2">
              <Switch
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
              />
              <Label>Lamination</Label>
            </div>
            <div className="md:col-span-2">
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
                disabled={!v.finishing.lamination?.enabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Side" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Front">Front</SelectItem>
                  <SelectItem value="Back">Back</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
