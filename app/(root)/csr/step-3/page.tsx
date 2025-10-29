"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/csr/StepIndicator";
import Step3ProductSpec from "@/components/csr/Step3ProductSpec";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import type {
  PaperOption,
  Product,
  QuoteFormData,
  QuoteTemplate,
  UIFlowState,
} from "@/types";
import { loadForm, saveForm } from "@/lib/storage";

const UI_KEY = "sp_quote_ui";

export default function Step3Page() {
  const router = useRouter();
  const [form, setForm] = useState<QuoteFormData | null>(null);
  const [papers, setPapers] = useState<PaperOption[]>([]);
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);

  // Hydrate dan ambil dummy API
  useEffect(() => {
    const f = loadForm<QuoteFormData>();
    if (f) setForm(f);

    fetch("/api/quotes")
      .then((r) => r.json())
      .then((data) => {
        setPapers(data.papers as PaperOption[]);
        setTemplates(data.quoteTemplates as QuoteTemplate[]);
      });
  }, []);

  // Prefill dari template jika mode=existing dan product belum ada
  useEffect(() => {
    if (!form) return;

    const rawUi =
      typeof window !== "undefined" ? localStorage.getItem(UI_KEY) : null;
    const ui: UIFlowState = rawUi
      ? (JSON.parse(rawUi) as UIFlowState)
      : { mode: "new" };

    if (
      ui.mode === "existing" &&
      (!form.products || !form.products[0]) &&
      ui.selectedExistingQuoteId
    ) {
      const t = templates.find((x) => x.id === ui.selectedExistingQuoteId);
      const first = t?.productsSnapshot?.[0];
      if (first) {
        const next = { ...form, products: [first] };
        setForm(next);
        saveForm(next);
      }
    }
  }, [form, templates]);

  // Autosave
  useEffect(() => {
    if (form) saveForm(form);
  }, [form]);

  // helper: product pertama
  const product = form?.products?.[0];

  const canNext = useMemo(() => {
    const p = product;
    return !!(
      p &&
      p.productName &&
      p.quantity > 0 &&
      p.size.flat.widthCm > 0 &&
      p.size.flat.heightCm > 0
    );
  }, [product]);

  if (!form) return <p className="p-6">Loading…</p>;

  const onChange = (p: Product) => {
    const nextProducts = [...(form.products || [])];
    nextProducts[0] = p;
    setForm({ ...form, products: nextProducts });
  };

  return (
    <main className="mx-auto max-w-5xl p-6">
      <StepIndicator active={3} />
      <h1 className="text-2xl font-bold mb-4">Product Specifications</h1>

      <Card className="p-4">
        <Step3ProductSpec
          value={product}
          onChange={onChange}
          paperOptions={papers}
        />
      </Card>

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" onClick={() => router.push("/csr/step-2")}>
          Previous
        </Button>
        <Button
          disabled={!canNext}
          onClick={() => router.push("/csr/step-4")}
        >
          Next
        </Button>
      </div>
    </main>
  );
}
