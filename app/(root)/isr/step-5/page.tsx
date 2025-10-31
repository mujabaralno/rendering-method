import StepIndicator from "@/components/shared/StepIndicator";
import Step5ClientWrapper from "@/components/isr/Step5ClientWrapper";

// Mengatur halaman ini sebagai ISR, revalidasi setiap 1 jam
// Ini akan di-cache seperti halaman statis
export const revalidate = 3600;

export default async function Step5PageISR() {
  // Server hanya merender layout statis
  return (
    <main className="mx-auto max-w-6xl p-6">
      <StepIndicator active={5} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quotation Summary</h1>
        <p className="text-gray-600">
          Review and finalize your quote before submission
        </p>
      </div>

      {/* Semua logika interaktif dan pemuatan data ada di sini */}
      <Step5ClientWrapper />
    </main>
  );
}
