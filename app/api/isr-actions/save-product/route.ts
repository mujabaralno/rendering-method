import { cookies } from "next/headers";
import {
  FORM_KEY,
  getInitialForm,
  readJsonFrom,
  writeJsonTo,
} from "@/lib/server/cookie-helpers";
import type { PaperOption, Product, QuoteFormData } from "@/types";

type QuotesDataset = {
  papers: PaperOption[];
  quoteTemplates: unknown;
};

const fetchPapers = async (): Promise<PaperOption[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/quotes`,
    { next: { revalidate: 60, tags: ["quotes", "papers"] } }
  );
  if (!res.ok) return [];
  const data = (await res.json()) as QuotesDataset;
  return data.papers ?? [];
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const store = cookies();
  const currentForm =
    readJsonFrom<QuoteFormData>(store, FORM_KEY) ?? getInitialForm();

  const parseNumber = (key: string) => {
    const raw = (formData.get(key) as string | null)?.trim();
    if (!raw) return 0;
    const value = Number(raw);
    return Number.isNaN(value) ? 0 : value;
  };
  const parseString = (key: string) =>
    ((formData.get(key) as string | null) ?? "").trim();
  const parseCheckbox = (key: string) => formData.get(key) === "on";

  const papers = await fetchPapers();
  const paperId = parseString("paperId");
  const selectedPaper = papers.find((paper) => paper.id === paperId);

  const quantity = parseNumber("quantity");
  const paperEntry = selectedPaper ? [selectedPaper] : [];

  const product: Product = {
    productName: parseString("productName"),
    quantity,
    printing: (parseString("printing") as Product["printing"]) ?? "Offset",
    sides: parseString("sides") === "1" ? (1 as const) : (2 as const),
    colors: {
      front: (parseString("colorFront") as Product["colors"]["front"]) ?? "CMYK",
      back: (parseString("colorBack") as Product["colors"]["back"]) ?? "None",
    },
    size: {
      flat: {
        widthCm: parseNumber("flatWidth"),
        heightCm: parseNumber("flatHeight"),
      },
      close: {
        widthCm: parseNumber("closeWidth"),
        heightCm: parseNumber("closeHeight"),
      },
    },
    papers: paperEntry,
    finishing: {
      embossing: parseCheckbox("embossing") || undefined,
      foiling: parseCheckbox("foiling") || undefined,
      folding: parseCheckbox("folding") || undefined,
      dieCutting: parseCheckbox("dieCutting") || undefined,
      varnishing: parseCheckbox("varnishing") || undefined,
      uvSpot: parseCheckbox("uvSpot") || undefined,
      lamination: parseCheckbox("laminationEnabled")
        ? {
            enabled: true,
            side: (parseString("laminationSide") as
              | "Front"
              | "Back"
              | "Both") ?? "Front",
            type: parseString("laminationType") || undefined,
          }
        : undefined,
    },
  };

  const existingOperational = currentForm.operational.papers?.[0];
  const recommendedSheets =
    quantity > 0
      ? quantity
      : existingOperational?.recommendedSheets ?? 0;
  const nextOperationalPaper = {
    inputWidth: existingOperational?.inputWidth ?? null,
    inputHeight: existingOperational?.inputHeight ?? null,
    pricePerPacket: existingOperational?.pricePerPacket ?? null,
    pricePerSheet: existingOperational?.pricePerSheet ?? null,
    sheetsPerPacket: existingOperational?.sheetsPerPacket ?? null,
    recommendedSheets,
    enteredSheets: existingOperational?.enteredSheets ?? recommendedSheets,
    outputWidth: product.size.close.widthCm || null,
    outputHeight: product.size.close.heightCm || null,
    selectedColors:
      existingOperational?.selectedColors ??
      [product.colors.front],
  };

  const nextForm: QuoteFormData = {
    ...currentForm,
    products: [product],
    operational: {
      ...currentForm.operational,
      papers: [nextOperationalPaper],
    },
  };

  writeJsonTo(store, FORM_KEY, nextForm);

  return Response.redirect(new URL("/isr/step-4", request.url), 303);
}

