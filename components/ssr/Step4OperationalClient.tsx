// components/ssr/Step4OperationalClient.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { QuoteFormData } from "@/types";
import Step4OperationalForm from "@/components/csr/Step4OperationalForm";

/**
 * Client adapter kecil untuk:
 * - Menampung state form lokal (agar UI tetap responsif).
 * - Memanggil server action persistFormAction saat form berubah (debounced).
 * 
 * Dengan ini, kita bisa re-use Step4OperationalForm (CSR) di halaman SSR
 * tanpa mengubah UI/UX dan tetap menyimpan state ke cookies untuk Step-5.
 */

type Props = {
  initialForm: QuoteFormData;
  // server action dari page.tsx
  persistFormAction: (formJson: string) => Promise<void>;
};

export default function Step4OperationalClient({
  initialForm,
  persistFormAction,
}: Props) {
  const [form, setForm] = useState<QuoteFormData>(initialForm);

  // Debounce agar tidak memanggil server action di setiap keystroke
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(
    (next: QuoteFormData) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void persistFormAction(JSON.stringify(next));
      }, 250);
    },
    [persistFormAction]
  );

  const handleChange = useCallback(
    (next: QuoteFormData) => {
      setForm(next);
      persist(next);
    },
    [persist]
  );

  // Jika initialForm berubah karena navigasi/server revalidation (jarang),
  // sinkronkan lagi local state
  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  // Render UI asli (apple-to-apple) dari CSR
  return (
    <Step4OperationalForm form={form} onChange={handleChange} />
  );
}
