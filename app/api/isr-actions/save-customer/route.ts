import { cookies } from "next/headers";
import {
  FORM_KEY,
  getInitialForm,
  getInitialUI,
  readJsonFrom,
  UI_KEY,
  writeJsonTo,
} from "@/lib/server/cookie-helpers";
import type { QuoteFormData, QuoteTemplate, UIFlowState } from "@/types";

type QuotesResponse = {
  quoteTemplates: QuoteTemplate[];
  papers: unknown;
};

const fetchTemplates = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/quotes`,
    { next: { revalidate: 60, tags: ["quotes", "papers"] } }
  );
  if (!res.ok) return [];
  const data = (await res.json()) as QuotesResponse;
  return data.quoteTemplates ?? [];
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const mode = (formData.get("mode") as string | null) ?? "new";

  const store = cookies();
  const currentForm =
    readJsonFrom<QuoteFormData>(store, FORM_KEY) ?? getInitialForm();
  const currentUI = readJsonFrom<UIFlowState>(store, UI_KEY) ?? getInitialUI();

  if (mode === "existing") {
    const templateId = (formData.get("templateId") as string | null)?.trim();
    if (!templateId) {
      writeJsonTo(store, UI_KEY, { mode: "existing" as const });
      return Response.redirect(new URL("/isr/step-2", request.url), 303);
    }

    const templates = await fetchTemplates();
    const template = templates.find((item) => item.id === templateId);

    if (!template) {
      writeJsonTo(store, UI_KEY, { mode: "existing" as const });
      return Response.redirect(new URL("/isr/step-2", request.url), 303);
    }

    const nextForm: QuoteFormData = {
      ...currentForm,
      client: {
        ...currentForm.client,
        ...template.clientSnapshot,
        emails: Array.isArray(template.clientSnapshot.emails)
          ? JSON.stringify(template.clientSnapshot.emails)
          : template.clientSnapshot.emails ?? JSON.stringify([]),
      },
      products: template.productsSnapshot?.length
        ? [template.productsSnapshot[0]]
        : currentForm.products,
      operational: template.operationalSnapshot
        ? {
            ...currentForm.operational,
            ...template.operationalSnapshot,
          }
        : currentForm.operational,
      calculation: template.calculationSnapshot
        ? {
            ...currentForm.calculation,
            ...template.calculationSnapshot,
          }
        : currentForm.calculation,
    };

    writeJsonTo(store, FORM_KEY, nextForm);
    writeJsonTo(store, UI_KEY, {
      mode: "existing",
      selectedExistingQuoteId: templateId,
    });

    return Response.redirect(new URL("/isr/step-3", request.url), 303);
  }

  const parseString = (key: string) =>
    ((formData.get(key) as string | null) ?? "").trim();
  const parseBoolean = (key: string) => formData.get(key) === "on";

  const emailsRaw = parseString("emails");
  const emailList = emailsRaw
    ? emailsRaw
        .split(/[\n,;]+/)
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  const nextForm: QuoteFormData = {
    ...currentForm,
    client: {
      ...currentForm.client,
      clientType:
        parseString("clientType") === "Individual" ? "Individual" : "Company",
      companyName: parseString("companyName"),
      contactPerson: parseString("contactPerson"),
      firstName: parseString("firstName") || undefined,
      lastName: parseString("lastName") || undefined,
      email: parseString("email"),
      emails: JSON.stringify(emailList),
      phone: parseString("phone"),
      countryCode: parseString("countryCode") || "+971",
      role: parseString("role"),
      trn: parseString("trn") || undefined,
      hasNoTrn: parseBoolean("hasNoTrn"),
      address: parseString("address") || undefined,
      city: parseString("city") || undefined,
      area: parseString("area") || undefined,
      state: parseString("state") || undefined,
      postalCode: parseString("postalCode") || undefined,
      country: parseString("country") || undefined,
      additionalInfo: parseString("additionalInfo") || undefined,
    },
  };

  writeJsonTo(store, FORM_KEY, nextForm);
  writeJsonTo(store, UI_KEY, { mode: "new" as const });

  return Response.redirect(new URL("/isr/step-3", request.url), 303);
}

