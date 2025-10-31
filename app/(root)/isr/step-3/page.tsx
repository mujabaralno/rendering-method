import StepIndicator from "@/components/shared/StepIndicator";
import Step3ClientWrapper from "@/components/isr/Step3ClientWrapper"
import type { QuoteTemplate, PaperOption } from "@/types";

// Mengatur halaman ini sebagai ISR, revalidasi setiap 1 jam
export const revalidate = 3600;

async function getPageData() {
  try {
    // Pastikan URL ini dapat diakses oleh server saat build
    const res = await fetch("http://localhost:3000/api/quotes", {
      next: { revalidate: 3600 }, // Cache data fetch
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }

    const data = await res.json();

    return {
      templates: (data.quoteTemplates as QuoteTemplate[]) || [],
      papers: (data.papers as PaperOption[]) || [],
    };
  } catch (error) {
    console.error("Error fetching page data:", error);
    return {
      templates: [],
      papers: [],
    };
  }
}

export default async function Step3PageISR() {
  // Data diambil saat build time / revalidasi
  const { templates, papers } = await getPageData();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <StepIndicator active={3} />
      <h1 className="text-2xl font-bold mb-4">Product Specifications</h1>

      {/* Render Client Component dan teruskan data sebagai props */}
      <Step3ClientWrapper
        initialTemplates={templates}
        initialPapers={papers}
      />
    </main>
  );
}
