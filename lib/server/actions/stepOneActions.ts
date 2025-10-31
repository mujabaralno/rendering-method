// app/(root)/ssr/step-1/actions.ts
"use server";

import { redirect } from "next/navigation";
import { setUI, setWip, UIFlowState } from "@/lib/server/cookies";
import { INITIAL_FORM } from "@/lib/server/quote-initial";

export async function chooseMode(formData: FormData) {
  const mode = (formData.get("mode") as "new" | "existing") ?? "new";

  // Simpan UI mode di cookie
  const nextUi: UIFlowState = { mode };
  setUI(nextUi);

  // Jika "new", reset WIP
  if (mode === "new") {
    setWip(INITIAL_FORM);
  }

  // NOTE: untuk "existing" kamu bisa set selectedExistingQuoteId di Step-2.
  redirect("/ssr/step-2");
}
