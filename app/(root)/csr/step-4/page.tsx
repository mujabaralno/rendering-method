"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/csr/StepIndicator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Step4OperationalForm from "@/components/csr/Step4OperationalForm";
import type { QuoteFormData } from "@/types";
import { loadForm, saveForm } from "@/lib/storage";

export default function Step4Page() {
  const router = useRouter();
  const [form, setForm] = useState<QuoteFormData | null>(null);

  useEffect(() => {
    const f = loadForm<QuoteFormData>();
    setForm(f ?? null);
  }, []);

  useEffect(() => { if (form) saveForm(form); }, [form]);

  if (!form) return <p className="p-6">Loading…</p>;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <StepIndicator active={4} />
      <h1 className="text-2xl font-bold mb-4">Operational Details</h1>

      <Card className="p-4">
        <Step4OperationalForm form={form} onChange={setForm} />
      </Card>

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" onClick={() => router.push("/csr/step-3")}>Previous</Button>
        <Button onClick={() => router.push("/csr/step-5")}>Next</Button>
      </div>
    </main>
  );
}
