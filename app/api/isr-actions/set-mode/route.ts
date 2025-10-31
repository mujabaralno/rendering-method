import { cookies } from "next/headers";
import {
  FORM_KEY,
  getInitialForm,
  getInitialUI,
  readJsonFrom,
  UI_KEY,
  writeJsonTo,
} from "@/lib/server/cookie-helpers";
import type { UIFlowState } from "@/types";

export async function POST(request: Request) {
  const formData = await request.formData();
  const mode = formData.get("mode");

  const store = cookies();
  const currentUI = readJsonFrom<UIFlowState>(store, UI_KEY) ?? getInitialUI();

  if (mode !== "new" && mode !== "existing") {
    return Response.redirect(new URL("/isr/step-1", request.url), 303);
  }

  if (mode === "new") {
    writeJsonTo(store, FORM_KEY, getInitialForm());
    writeJsonTo(store, UI_KEY, { mode: "new" as const });
  } else {
    writeJsonTo(store, UI_KEY, {
      mode: "existing" as const,
      selectedExistingQuoteId: currentUI.selectedExistingQuoteId,
    });
  }

  return Response.redirect(new URL("/isr/step-2", request.url), 303);
}

