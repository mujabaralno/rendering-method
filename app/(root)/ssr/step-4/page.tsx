// app/(root)/ssr/step-4/page.tsx
import { redirect } from "next/navigation";
import StepIndicator from "@/components/ssr/StepIndicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getQuoteState,
  setQuoteForm,
} from "@/lib/server/cookie-helper";
import type { QuoteFormData } from "@/types";
import Step4OperationalClient from "@/components/ssr/Step4OperationalClient";

export const dynamic = "force-dynamic";

// Navigasi server actions
const goBackToStep3 = async () => {
  "use server";
  redirect("/ssr/step-3");
};

const goToStep5 = async () => {
  "use server";
  // Tidak memodifikasi apa pun di sini; asumsi state sudah tersimpan via persistFormAction
  redirect("/ssr/step-5");
};

// Server action untuk persist perubahan form dari client
const persistFormAction = async (formJson: string) => {
  "use server";
  try {
    const next = JSON.parse(formJson) as QuoteFormData;
    await setQuoteForm(next);
  } catch {
    // diamkan saja; bisa ditambahkan logging bila perlu
  }
};

const Step4Page = async () => {
  const { form } = await getQuoteState();
  const product = form.products[0];

  // Jika product belum diisi dari Step-3, tampilkan notice & tombol kembali
  if (!product) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <StepIndicator active={4} />
        <Card className="mt-8 border border-yellow-300 bg-yellow-50 p-6">
          <h2 className="text-lg font-semibold text-yellow-900">
            Product details required
          </h2>
          <p className="mt-2 text-sm text-yellow-900">
            Lengkapi spesifikasi produk di Step 3 terlebih dahulu agar perhitungan operasional bisa dilakukan.
          </p>
          <form action={goBackToStep3} className="mt-4">
            <Button variant="secondary">Back to Step 3</Button>
          </form>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      {/* UI parity dengan CSR */}
      <StepIndicator active={4} />
      <h1 className="text-2xl font-bold mb-4">Operational Details</h1>

      {/* Reuse komponen CSR via client-adapter agar onChange → cookies */}
      <Card className="p-4">
        <Step4OperationalClient
          initialForm={form}
          persistFormAction={persistFormAction}
        />
      </Card>

      {/* Footer navigasi sama seperti CSR (posisi & gaya) */}
      <div className="mt-8 flex justify-between">
        <form action={goBackToStep3}>
          <Button variant="secondary">Previous</Button>
        </form>
        <form action={goToStep5}>
          <Button>Next</Button>
        </form>
      </div>
    </main>
  );
};

export default Step4Page;
