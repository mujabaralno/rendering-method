"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/csr/StepIndicator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { QuoteFormData, UIFlowState } from "@/types";
import { loadForm, saveForm } from "@/lib/storage";

const UI_KEY = "sp_quote_ui";

/** Form awal yang sesuai skema tipe aslimu */
const INITIAL_FORM: QuoteFormData = {
  client: {
    clientType: "Company",
    companyName: "",
    contactPerson: "",
    email: "",
    emails: "[]",
    phone: "",
    countryCode: "+971",
    role: "",
    address: "",
    city: "",
    area: "",
    state: "",
    postalCode: "",
    country: "",
    additionalInfo: "",
  },
  products: [], // akan diisi di Step-3 atau saat pilih template
  operational: {
    papers: [],
    finishing: [],
    plates: null,
    units: null,
    impressions: null,
  },
  calculation: {
    basePrice: 0,
    marginAmount: 0,
    marginPercentage: 15,
    subtotal: 0,
    finalSubtotal: 0,
    vatAmount: 0,
    totalPrice: 0,
  },
  approval: undefined,
  salesPersonId: undefined,
};

export default function Step1Page() {
  const router = useRouter();

  // State lokal hanya untuk highlight kartu yang dipilih
  const [ui, setUi] = useState<UIFlowState>({ mode: "new" });

  // Hydrate form & ui
  useEffect(() => {
    const f = loadForm<QuoteFormData>();
    if (!f) {
      // Simpan initial form sekali saat pertama kali masuk flow
      saveForm(INITIAL_FORM);
    }
    const rawUi = typeof window !== "undefined" ? localStorage.getItem(UI_KEY) : null;
    if (rawUi) setUi(JSON.parse(rawUi) as UIFlowState);
  }, []);

  // Helper simpan UI state
  const setUIAndGo = (nextUi: UIFlowState, go = true) => {
    setUi(nextUi);
    if (typeof window !== "undefined") {
      localStorage.setItem(UI_KEY, JSON.stringify(nextUi));
    }
    if (go) router.push("/csr/step-2");
  };

  const startNew = () => {
    // reset form ke initial untuk jalur "new"
    saveForm(INITIAL_FORM);
    setUIAndGo({ mode: "new" });
  };

  const useExisting = () => {
    // tidak reset form; pilih template di Step-2
    setUIAndGo({ mode: "existing" });
  };

  return (
    <main className="mx-auto max-w-5xl p-6">
      <StepIndicator active={1} />
      <h1 className="text-2xl font-bold mb-2">Create A Quote</h1>
      <p className="text-sm text-gray-600 mb-6">
        Choose how you'd like to create your printing quote
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Card: Start New */}
        <Card className={ui.mode === "new" ? "ring-2 ring-sky-500" : ""}>
          <CardHeader>
            <CardTitle>Create New Quote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Start a fresh quotation from scratch. Perfect for new projects or custom requirements.
            </p>
            <Button onClick={startNew}>Start New Quote</Button>
          </CardContent>
        </Card>

        {/* Card: Use Existing */}
        <Card className={ui.mode === "existing" ? "ring-2 ring-sky-500" : ""}>
          <CardHeader>
            <CardTitle>Based on Previous Quote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Use an existing quote as a template. Customer & product specs will be prefilled.
            </p>
            <Button onClick={useExisting}>Use Existing Quote</Button>
          </CardContent>
        </Card>
      </div>

      {/* Tombol Next opsional jika ingin pilih dulu tanpa langsung navigasi */}
      <div className="mt-8 flex justify-end">
        <Button onClick={() => router.push("/csr/step-2")}>Next</Button>
      </div>
    </main>
  );
}
