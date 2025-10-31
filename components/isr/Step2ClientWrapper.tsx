"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Step2ExistingQuoteTable, {
  type Step2Row,
} from "@/components/csr/Step2ExistingQuoteTable";
import Step2CustomerForm from "@/components/csr/Step2CustomerForm";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type {
  QuoteFormData,
  QuoteTemplate,
  PaperOption,
  Product,
  UIFlowState,
} from "@/types";
import { loadForm, saveForm } from "@/lib/storage";

const UI_KEY = "sp_quote_ui";

// --- helper baca UI secara sinkron saat init ---
function readUI(): UIFlowState {
  if (typeof window === "undefined") return { mode: "new" };
  try {
    const raw = localStorage.getItem(UI_KEY);
    return raw ? (JSON.parse(raw) as UIFlowState) : { mode: "new" };
  } catch {
    return { mode: "new" };
  }
}

const deepClone = <T,>(value: T): T =>
  value === undefined ? value : JSON.parse(JSON.stringify(value));

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
  products: [],
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
};

// Terima data yang di-fetch server sebagai props
interface Step2ClientWrapperProps {
  initialTemplates: QuoteTemplate[];
  initialPapers: PaperOption[];
}

export default function Step2ClientWrapper({
  initialTemplates,
  initialPapers,
}: Step2ClientWrapperProps) {
  const router = useRouter();

  // >>> inisialisasi dari localStorage (sinkron)
  const [ui, setUi] = useState<UIFlowState>(readUI);
  const [form, setForm] = useState<QuoteFormData>(
    () => loadForm<QuoteFormData>() ?? INITIAL_FORM
  );

  // Inisialisasi state dari props yang di-pass server
  const [templates, setTemplates] =
    useState<QuoteTemplate[]>(initialTemplates);
  const [papers, setPapers] = useState<PaperOption[]>(initialPapers);
  const [notice, setNotice] = useState("");

  // fetch dummy API sudah TIDAK DIPERLUKAN di sini
  // useEffect(() => { ... fetch ... }, []);

  // autosave (tetap di client)
  useEffect(() => {
    saveForm(form);
  }, [form]);
  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem(UI_KEY, JSON.stringify(ui));
  }, [ui]);

  // rows untuk tabel
  const rows: Step2Row[] = templates.map((t) => ({
    id: t.id,
    productName: t.productsSnapshot?.[0]?.productName ?? "-",
    date: t.date,
    status: t.status,
    customerName: t.customerName,
  }));

  const handleSelectId = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    const first: Product | undefined = t.productsSnapshot?.[0];

    setForm({
      ...form,
      client: deepClone(t.clientSnapshot),
      products: first ? [deepClone(first)] : [],
      operational: t.operationalSnapshot
        ? deepClone(t.operationalSnapshot)
        : form.operational,
      calculation: t.calculationSnapshot
        ? deepClone(t.calculationSnapshot)
        : form.calculation,
    });
    setUi({ mode: "existing", selectedExistingQuoteId: id });

    setNotice(
      `Quote ID: ${t.id} | Product: ${first?.productName ?? "-"} | Customer: ${
        t.customerName
      }`
    );
  };

  // Layout <main>, <h1>, <StepIndicator> sudah di-render di server
  return (
    <>
      {notice && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertTitle>Quote template selected successfully!</AlertTitle>
          <AlertDescription>
            {notice}
            <br />
            Customer details and product specifications will be auto-filled in
            the next steps.
          </AlertDescription>
        </Alert>
      )}

      {/* kunci: render berdasarkan ui.mode yang dibaca sinkron */}
      {ui.mode === "existing" ? (
        <Step2ExistingQuoteTable quotes={rows} onSelectId={handleSelectId} />
      ) : (
        <Step2CustomerForm
          value={form.client}
          onChange={(client) => setForm({ ...form, client })}
          paperOptions={papers}
        />
      )}

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" onClick={() => router.push("/isr/step-1")}>
          Previous
        </Button>
        <Button onClick={() => router.push("/isr/step-3")}>Next</Button>
      </div>
    </>
  );
}
