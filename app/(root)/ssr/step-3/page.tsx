// app/(root)/ssr/step-3/page.tsx
import { redirect } from "next/navigation";
import StepIndicator from "@/components/ssr/StepIndicator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

import CopyFlatToCloseButton from "@/components/ssr/CopyFlatToCloseButton";
import PaperSelectorOne from "@/components/ssr/PaperSelectorOne";

import {
  getQuoteForm,
  getQuoteState,
  setQuoteForm,
} from "@/lib/server/cookie-helper";
import type {
  LaminationSide,
  PaperOption,
  Product,
  QuoteFormData,
} from "@/types";

export const dynamic = "force-dynamic";

/** ---------- Dataset / Helpers ---------- */
type QuotesDataset = {
  papers: PaperOption[];
};

const resolveBaseUrl = () => {
  const envUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  return envUrl ?? "http://localhost:3000";
};

const printingMethods: Product["printing"][] = ["Offset", "Digital", "Inkjet"];
const colorFrontOptions: Product["colors"]["front"][] = [
  "CMYK",
  "1C",
  "Pantone",
  "Custom",
];
const colorBackOptions: Product["colors"]["back"][] = [
  "None",
  "SameAsFront",
  "CMYK",
  "1C",
  "Pantone",
  "Custom",
];
const laminationSides: LaminationSide[] = ["Front", "Back", "Both"];

const fetchQuotesDataset = async (): Promise<QuotesDataset> => {
  try {
    const res = await fetch(`${resolveBaseUrl()}/api/quotes`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { papers: [] };
    }
    const payload = (await res.json()) as QuotesDataset & Record<string, unknown>;
    return {
      papers: Array.isArray(payload.papers) ? payload.papers : [],
    };
  } catch {
    return { papers: [] };
  }
};

/** ---------- Server Actions ---------- */
const goBackToStep2 = async () => {
  "use server";
  redirect("/ssr/step-2");
};

const saveProductSpecification = async (formData: FormData) => {
  "use server";

  const dataset = await fetchQuotesDataset();

  const parseString = (key: string, fallback = "") =>
    (formData.get(key) as string | null)?.trim() ?? fallback;
  const parseNumber = (key: string) => {
    const raw = parseString(key);
    if (!raw) return 0;
    const asNumber = Number(raw);
    return Number.isFinite(asNumber) ? asNumber : 0;
  };
  const parseCheckbox = (key: string) => formData.get(key) === "on";

  const printingRaw = parseString("printing", "Offset");
  const printing = printingMethods.includes(printingRaw as Product["printing"])
    ? (printingRaw as Product["printing"])
    : "Offset";

  const sidesValue = parseString("sides") === "1" ? 1 : (2 as 1 | 2);

  const colorFrontRaw = parseString("colorFront", "CMYK");
  const colorFront = colorFrontOptions.includes(
    colorFrontRaw as Product["colors"]["front"]
  )
    ? (colorFrontRaw as Product["colors"]["front"])
    : "CMYK";

  const colorBackRaw = parseString("colorBack", "None");
  const colorBack = colorBackOptions.includes(
    colorBackRaw as Product["colors"]["back"]
  )
    ? (colorBackRaw as Product["colors"]["back"])
    : "None";

  const laminationEnabled = parseCheckbox("laminationEnabled");
  const laminationSideRaw = parseString("laminationSide", "Front");
  const laminationSide = laminationSides.includes(
    laminationSideRaw as LaminationSide
  )
    ? (laminationSideRaw as LaminationSide)
    : ("Front" as LaminationSide);

  const paperId = parseString("paperId");
  const selectedPaper = dataset.papers.find((paper) => paper.id === paperId);

  const quantity = Math.max(0, parseNumber("quantity"));
  const flatWidth = parseNumber("flatWidth");
  const flatHeight = parseNumber("flatHeight");
  const closeWidth = parseNumber("closeWidth");
  const closeHeight = parseNumber("closeHeight");

  const product: Product = {
    productName: parseString("productName"),
    quantity,
    printing,
    sides: sidesValue,
    colors: {
      front: colorFront,
      back: colorBack,
    },
    size: {
      flat: {
        widthCm: flatWidth,
        heightCm: flatHeight,
      },
      close: {
        widthCm: closeWidth,
        heightCm: closeHeight,
      },
    },
    papers: selectedPaper ? [selectedPaper] : [],
    finishing: {
      embossing: parseCheckbox("embossing") || undefined,
      foiling: parseCheckbox("foiling") || undefined,
      uvSpot: parseCheckbox("uvSpot") || undefined,
      lamination: laminationEnabled
        ? {
            enabled: true,
            side: laminationSide,
          }
        : undefined,
    },
  };

  // Pertahankan kompatibilitas operational/papers dari step 4
  const currentForm = await getQuoteForm();
  const existingPaper = currentForm.operational.papers[0];
  const recommendedSheets =
    quantity > 0 ? quantity : existingPaper?.recommendedSheets ?? 0;
  const enteredSheets =
    existingPaper?.enteredSheets ?? (quantity > 0 ? quantity : null);
  const selectedColors =
    existingPaper?.selectedColors && existingPaper.selectedColors.length > 0
      ? existingPaper.selectedColors
      : [colorFront];

  const fallbackPaper = {
    inputWidth: existingPaper?.inputWidth ?? null,
    inputHeight: existingPaper?.inputHeight ?? null,
    pricePerPacket: existingPaper?.pricePerPacket ?? null,
    pricePerSheet: existingPaper?.pricePerSheet ?? null,
    sheetsPerPacket: existingPaper?.sheetsPerPacket ?? null,
    recommendedSheets,
    enteredSheets,
    outputWidth: closeWidth,
    outputHeight: closeHeight,
    selectedColors,
  };

  const nextForm: QuoteFormData = {
    ...currentForm,
    products: [product],
    operational: {
      ...currentForm.operational,
      papers: [fallbackPaper],
    },
  };

  await setQuoteForm(nextForm);
  redirect("/ssr/step-4");
};

/** ---------- Page ---------- */
const Step3Page = async () => {
  const { form } = await getQuoteState();
  const dataset = await fetchQuotesDataset();

  const existingProduct = form.products[0];
  const defaultProduct: Product =
    existingProduct ?? {
      productName: "",
      quantity: 0,
      printing: "Offset",
      sides: 2,
      colors: { front: "CMYK", back: "None" },
      size: {
        flat: { widthCm: 0, heightCm: 0 },
        close: { widthCm: 0, heightCm: 0 },
      },
      papers: [],
      finishing: {},
    };

  const selectedPaperId = defaultProduct.papers?.[0]?.id ?? "";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <StepIndicator active={3} />
      <h1 className="mt-6 text-2xl font-bold text-gray-900">
        Product Specifications
      </h1>

      <Card className="mt-8 border-l-4 border-l-[#27aae1]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Basic Information</CardTitle>
          <p className="text-sm text-gray-500">
            Enter the product details and specifications
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="productName" className="text-sm font-medium">
              Product Name <span className="text-red-500">*</span>
            </Label>
            {/* form id di bawah, jadi input-input ada di dalam form utama */}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium">
              Quantity <span className="text-red-500">*</span>
            </Label>
          </div>

          {/* Printing Method */}
          <div className="space-y-2">
            <Label htmlFor="printing" className="text-sm font-medium">
              Printing Method
            </Label>
          </div>

          {/* Printing Sides */}
          <div className="space-y-2">
            <Label htmlFor="sides" className="text-sm font-medium">
              Printing Sides
            </Label>
          </div>

          {/* Front Color */}
          <div className="space-y-2">
            <Label htmlFor="frontColor" className="text-sm font-medium">
              Front Side Color
            </Label>
          </div>

          {/* Back Color */}
          <div className="space-y-2">
            <Label htmlFor="backColor" className="text-sm font-medium">
              Back Side Color
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Form utama dimulai di sini agar tombol "Copy" bisa baca input via id */}
      <Card className="mt-4 border border-gray-200">
        <CardContent className="pt-6">
          <form id="product-spec-form" action={saveProductSpecification} className="space-y-6">
            {/* Basic Information - FIELD */}
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                id="productName"
                name="productName"
                type="text"
                required
                defaultValue={defaultProduct.productName}
                placeholder="e.g. Business Card, Brochure"
                className="focus:border-[#27aae1] focus:ring-[#27aae1]"
              />

              <Input
                id="quantity"
                name="quantity"
                type="number"
                min={0}
                step={1}
                required
                defaultValue={defaultProduct.quantity}
                className="focus:border-[#27aae1] focus:ring-[#27aae1]"
              />

              <Select defaultValue={defaultProduct.printing} name="printing">
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

              <Select defaultValue={String(defaultProduct.sides)} name="sides">
                <SelectTrigger id="sides" className="focus:border-[#27aae1] focus:ring-[#27aae1]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Side (Simplex)</SelectItem>
                  <SelectItem value="2">2 Sides (Duplex)</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue={defaultProduct.colors.front} name="colorFront">
                <SelectTrigger id="frontColor" className="focus:border-[#27aae1] focus:ring-[#27aae1]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorFrontOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select defaultValue={defaultProduct.colors.back} name="colorBack">
                <SelectTrigger id="backColor" className="focus:border-[#27aae1] focus:ring-[#27aae1]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorBackOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size Details */}
            <Card className="border-l-4 border-l-[#ea078b]">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Size Details</CardTitle>
                <p className="text-sm text-gray-500">Specify dimensions in centimeters</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-700">Flat Size (cm)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="flatWidth" className="text-xs">
                          Width
                        </Label>
                        <Input
                          id="flatWidth"
                          name="flatWidth"
                          type="number"
                          step="0.1"
                          min={0}
                          defaultValue={defaultProduct.size.flat.widthCm}
                          className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="flatHeight" className="text-xs">
                          Height
                        </Label>
                        <Input
                          id="flatHeight"
                          name="flatHeight"
                          type="number"
                          step="0.1"
                          min={0}
                          defaultValue={defaultProduct.size.flat.heightCm}
                          className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-700">Close Size (cm)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="closeWidth" className="text-xs">
                          Width
                        </Label>
                        <Input
                          id="closeWidth"
                          name="closeWidth"
                          type="number"
                          step="0.1"
                          min={0}
                          defaultValue={defaultProduct.size.close.widthCm}
                          className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="closeHeight" className="text-xs">
                          Height
                        </Label>
                        <Input
                          id="closeHeight"
                          name="closeHeight"
                          type="number"
                          step="0.1"
                          min={0}
                          defaultValue={defaultProduct.size.close.heightCm}
                          className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tombol Copy flat -> close */}
                <CopyFlatToCloseButton formId="product-spec-form" />
              </CardContent>
            </Card>

            {/* Paper Selection */}
            <Card className="border-l-4 border-l-[#fbec20]">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Paper Selection</CardTitle>
                <p className="text-sm text-gray-500">
                  Add one or more paper types for this product
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <PaperSelectorOne
                  papers={dataset.papers}
                  initialPaperId={selectedPaperId}
                  // hidden input name harus "paperId" agar server action membaca id
                  inputName="paperId"
                />
              </CardContent>
            </Card>

            {/* Finishing Options */}
            <Card className="border-l-4 border-l-[#27aae1]">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Finishing Options</CardTitle>
                <p className="text-sm text-gray-500">
                  Select additional finishing treatments
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Checkbox: Embossing / Foiling / UV Spot */}
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50">
                    <Checkbox
                      name="embossing"
                      defaultChecked={!!defaultProduct.finishing.embossing}
                      className="data-[state=checked]:bg-[#27aae1] data-[state=checked]:border-[#27aae1]"
                    />
                    <span className="text-sm">Embossing</span>
                  </label>

                  <label className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50">
                    <Checkbox
                      name="foiling"
                      defaultChecked={!!defaultProduct.finishing.foiling}
                      className="data-[state=checked]:bg-[#27aae1] data-[state=checked]:border-[#27aae1]"
                    />
                    <span className="text-sm">Foiling</span>
                  </label>

                  <label className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50">
                    <Checkbox
                      name="uvSpot"
                      defaultChecked={!!defaultProduct.finishing.uvSpot}
                      className="data-[state=checked]:bg-[#27aae1] data-[state=checked]:border-[#27aae1]"
                    />
                    <span className="text-sm">UV Spot</span>
                  </label>
                </div>

                {/* Switch Lamination + Select Side */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      name="laminationEnabled"
                      defaultChecked={!!defaultProduct.finishing.lamination?.enabled}
                      className="data-[state=checked]:bg-[#27aae1]"
                    />
                    <Label className="text-sm font-medium">Lamination</Label>
                  </div>

                  <div className="mt-4 grid max-w-md gap-3">
                    <Label htmlFor="laminationSide" className="text-xs text-gray-600">
                      Lamination Side
                    </Label>
                    <Select
                      defaultValue={defaultProduct.finishing.lamination?.side ?? "Front"}
                      name="laminationSide"
                    >
                      <SelectTrigger
                        id="laminationSide"
                        className="focus:border-[#27aae1] focus:ring-[#27aae1]"
                      >
                        <SelectValue placeholder="Select side" />
                      </SelectTrigger>
                      <SelectContent>
                        {laminationSides.map((side) => (
                          <SelectItem key={side} value={side}>
                            {side}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <Button
                type="submit"
                variant="secondary"
                formAction={goBackToStep2}
                className="px-6"
              >
                Previous
              </Button>
              <Button type="submit" className="px-6">
                Next
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Step3Page;
