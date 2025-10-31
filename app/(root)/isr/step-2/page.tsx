import StepIndicator from "@/components/shared/StepIndicator";
import Step2ClientWrapper from "@/components/isr/Step2ClientWrapper";
import type { QuoteTemplate, PaperOption } from "@/types";

/*
 * 💡 FIX: Hapus `export const revalidate`.
 * Ini mengubah halaman dari ISR (statis) menjadi SSR (dinamis).
 * Sekarang halaman ini BISA membaca searchParams.
 */
// export const revalidate = 3600; // <-- DIHAPUS

async function getPageData() {
  try {
    // Anda mungkin perlu URL absolut di sini, pastikan ini benar
    const res = await fetch("http://localhost:3000/api/quotes", {
      cache: "no-store", // Data dinamis, jangan di-cache
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

// 1. Terima searchParams di sini
export default async function Step2PageSSR({
  searchParams,
}: {
  searchParams?: { mode?: "new" | "existing"; selected?: string };
}) {
  // 2. Baca searchParams dengan aman (ini sekarang valid karena halaman SSR)
  const mode = (searchParams?.mode === "existing" ? "existing" : "new") as "new" | "existing";
  const selectedId = searchParams?.selected;

  // Data tetap di-fetch di server
  const { templates, papers } = await getPageData();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <StepIndicator active={2} />
      <h1 className="text-2xl font-bold mb-4">Step 2 - Customer Detail</h1>

      {/* 3. Teruskan mode dan data ke Client Component */}
      <Step2ClientWrapper
        initialTemplates={templates}
        initialPapers={papers}
        mode={mode}
        selectedId={selectedId}
      />
    </main>
  );
}

