"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

// Terima data yang di-fetch server sebagai props
interface Step3ClientWrapperProps {
  initialTemplates: QuoteTemplate[];
  initialPapers: PaperOption[];
}

function Step3ClientWrapper({
  initialTemplates,
  initialPapers,
}: Step3ClientWrapperProps) {
  const router = useRouter();
  const [form, setForm] = useState<QuoteFormData | null>(null);
  
  // Inisialisasi state dari props
  const [papers, setPapers] = useState<PaperOption[]>(initialPapers);
  const [templates, setTemplates] = useState<QuoteTemplate[]>(initialTemplates);

  // Hydrate form dari localStorage
  useEffect(() => {
    const f = loadForm<QuoteFormData>();
    if (f) setForm(f);
    
    // Fetch API tidak diperlukan lagi di sini
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
      // Gunakan 'templates' dari state (yang diisi oleh props)
      const t = templates.find((x) => x.id === ui.selectedExistingQuoteId);
      const first = t?.productsSnapshot?.[0];
      if (first) {
        const next = { ...form, products: [first] };
        setForm(next);
        saveForm(next);
      }
    }
  }, [form, templates]); // Dependensi 'templates' sudah benar

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
    if (!form) return;
    const nextProducts = [...(form.products || [])];
    nextProducts[0] = p;
    setForm({ ...form, products: nextProducts });
  };

  return (
    <>
      <Card className="p-4">
        <Step3ProductSpec
          value={product}
          onChange={onChange}
          paperOptions={papers}
        />
      </Card>

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" onClick={() => router.push("/isr/step-2")}>
          Previous
        </Button>
        <Button disabled={!canNext} onClick={() => router.push("/isr/step-4")}>
          Next
        </Button>
      </div>
    </>
  );
}

export default Step3ClientWrapper