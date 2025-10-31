"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Step4OperationalForm from "@/components/isr/Step4OperationalForm"; // Import versi ISR
import type { QuoteFormData } from "@/types";
import { loadForm, saveForm } from "@/lib/storage";

export default function Step4ClientWrapper() {
  const router = useRouter();
  const [form, setForm] = useState<QuoteFormData | null>(null);

  // Membaca dari localStorage saat komponen di-mount di client
  useEffect(() => {
    const f = loadForm<QuoteFormData>();
    setForm(f ?? null);
  }, []);

  // Autosave saat form berubah
  useEffect(() => {
    if (form) saveForm(form);
  }, [form]);

  if (!form) return <p className="p-6">Loading…</p>;

  // Render bagian interaktif
  return (
    <>
      <Card className="p-4">
        <Step4OperationalForm form={form} onChange={setForm} />
      </Card>

      <div className="mt-8 flex justify-between">
        <Button
          variant="secondary"
          onClick={() => router.push("/isr/step-3")} // Path diubah ke ISR
        >
          Previous
        </Button>
        <Button onClick={() => router.push("/isr/step-5")} // Path diubah ke ISR
        >
          Next
        </Button>
      </div>
    </>
  );
}
