import StepIndicator from "@/components/shared/StepIndicator";
import Step4ClientWrapper from "@/components/isr/Step4ClientWrapper";

// Mengatur halaman ini sebagai ISR, revalidasi setiap 1 jam
// Kontennya statis, jadi ini akan di-cache seperti SSG.
export const revalidate = 3600;

export default async function Step4PageISR() {
  // Tidak ada data yang di-fetch, server hanya merender shell statis
  return (
    <main className="mx-auto max-w-6xl p-6">
      <StepIndicator active={4} />
      <h1 className="text-2xl font-bold mb-4">Operational Details</h1>

      {/* Semua logika interaktif ada di dalam wrapper ini */}
      <Step4ClientWrapper />
    </main>
  );
}
