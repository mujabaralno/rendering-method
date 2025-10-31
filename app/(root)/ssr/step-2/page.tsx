import { redirect } from "next/navigation";
import StepIndicator from "@/components/ssr/StepIndicator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getQuoteForm,
  getQuoteState,
  getUIState,
  setQuoteForm,
  setUIState,
} from "@/lib/server/cookie-helper";
import type { QuoteFormData, QuoteTemplate } from "@/types";
import Step2ExistingQuoteTable from "@/components/ssr/Step2ExistingQuoteTable";

export const dynamic = "force-dynamic";

type QuoteTemplatesPayload = {
  quoteTemplates: QuoteTemplate[];
};

const resolveBaseUrl = () => {
  const envUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  return envUrl ?? "http://localhost:3000";
};

const fetchQuoteTemplates = async (): Promise<QuoteTemplate[]> => {
  try {
    const res = await fetch(`${resolveBaseUrl()}/api/quotes`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return [];
    }
    const payload = (await res.json()) as QuoteTemplatesPayload & Record<string, unknown>;
    return Array.isArray(payload.quoteTemplates) ? payload.quoteTemplates : [];
  } catch {
    return [];
  }
};

const saveClientDetails = async (formData: FormData) => {
  "use server";

  const parseString = (key: string, fallback = "") =>
    (formData.get(key) as string | null)?.trim() ?? fallback;
  const parseBoolean = (key: string) => formData.get(key) === "on";

  const clientTypeRaw = parseString("clientType", "Company");
  const clientType =
    clientTypeRaw === "Individual" ? "Individual" : ("Company" as QuoteFormData["client"]["clientType"]);

  const emailsRaw = parseString("emails", "");
  const emailList = emailsRaw
    ? emailsRaw
        .split(/[\n,;]+/)
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  const currentForm = await getQuoteForm();
  const nextClient: QuoteFormData["client"] = {
    ...currentForm.client,
    clientType,
    companyName: parseString("companyName"),
    contactPerson: parseString("contactPerson"),
    firstName: parseString("firstName"),
    lastName: parseString("lastName"),
    email: parseString("email"),
    emails: JSON.stringify(emailList),
    phone: parseString("phone"),
    countryCode: parseString("countryCode") || "+971",
    role: parseString("role"),
    trn: parseString("trn"),
    hasNoTrn: parseBoolean("hasNoTrn"),
    address: parseString("address"),
    city: parseString("city"),
    area: parseString("area"),
    state: parseString("state"),
    postalCode: parseString("postalCode"),
    country: parseString("country"),
    additionalInfo: parseString("additionalInfo"),
  };

  const nextForm: QuoteFormData = {
    ...currentForm,
    client: nextClient,
  };

  await setQuoteForm(nextForm);
  await setUIState({ mode: "new" });

  redirect("/ssr/step-3");
};

const selectExistingTemplate = async (formData: FormData) => {
  "use server";

  const templateId = (formData.get("templateId") as string | null)?.trim();
  if (!templateId) {
    redirect("/ssr/step-2");
  }

  const templates = await fetchQuoteTemplates();
  const template = templates.find((item) => item.id === templateId);

  if (!template) {
    await setUIState({ mode: "existing", selectedExistingQuoteId: undefined });
    redirect("/ssr/step-2");
  }

  const currentForm = await getQuoteForm();

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

  await setQuoteForm(nextForm);
  await setUIState({ mode: "existing", selectedExistingQuoteId: templateId });

  redirect("/ssr/step-2");
};

const goBackToStep1 = async () => {
  "use server";
  redirect("/ssr/step-1");
};

const continueToStep3FromExisting = async () => {
  "use server";
  const ui = await getUIState();
  if (ui.mode !== "existing" || !ui.selectedExistingQuoteId) {
    redirect("/ssr/step-2");
  }
  redirect("/ssr/step-3");
};

const Step2Page = async () => {
  const { form, ui } = await getQuoteState();
  const templates = await fetchQuoteTemplates();

  const selectedTemplate = ui.selectedExistingQuoteId
    ? templates.find((item) => item.id === ui.selectedExistingQuoteId)
    : undefined;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <StepIndicator active={2} />
      <h1 className="mt-6 text-2xl font-bold text-gray-900">Step 2 — Customer Detail</h1>
      <p className="mt-2 text-sm text-gray-600">
        Capture customer information or reuse an existing quotation template to speed up the process.
      </p>

      {ui.mode === "existing" ? (
       <section className="mt-8 space-y-6">
    {selectedTemplate && (
      <Alert className="border-green-200 bg-green-50 text-green-900">
        <AlertTitle>Quote template selected successfully!</AlertTitle>
        <AlertDescription>
          Quote ID: <strong>{selectedTemplate.id}</strong> • Customer:{" "}
          <strong>{selectedTemplate.customerName}</strong> • Product:{" "}
          <strong>{selectedTemplate.productsSnapshot?.[0]?.productName ?? "-"}</strong>
        </AlertDescription>
      </Alert>
    )}

    <Card className="border border-gray-200">
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Existing quotation templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* ⬇️ Komponen client dengan UI parity CSR */}
        <Step2ExistingQuoteTable
          templates={templates}
          selectedId={ui.selectedExistingQuoteId}
          onSelect={selectExistingTemplate}
        />
      </CardContent>
    </Card>

    <div className="flex items-center justify-between border-t border-gray-200 pt-6">
      <form action={goBackToStep1}>
        <Button variant="secondary" className="px-6">Previous</Button>
      </form>
      <form action={continueToStep3FromExisting}>
        <Button
          type="submit"
          className="px-6"
          disabled={!ui.selectedExistingQuoteId}
        >
          Next
        </Button>
      </form>
    </div>
  </section>
      ) : (
        <section className="mt-8 space-y-8">
          <Card className="border border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Customer information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={saveClientDetails} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-gray-700">Client Type</span>
                    <select
                      name="clientType"
                      defaultValue={form.client.clientType}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                    >
                      <option value="Company">Company</option>
                      <option value="Individual">Individual</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm md:col-span-2">
                    <span className="font-medium text-gray-700">Contact Person</span>
                    <input
                      name="contactPerson"
                      type="text"
                      defaultValue={form.client.contactPerson}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-gray-700">Company Name</span>
                    <input
                      name="companyName"
                      type="text"
                      defaultValue={form.client.companyName}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                      placeholder="Only for company clients"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-gray-700">Role / Title</span>
                    <input
                      name="role"
                      type="text"
                      defaultValue={form.client.role}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-gray-700">First Name</span>
                    <input
                      name="firstName"
                      type="text"
                      defaultValue={form.client.firstName ?? ""}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                      placeholder="For individual clients"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-gray-700">Last Name</span>
                    <input
                      name="lastName"
                      type="text"
                      defaultValue={form.client.lastName ?? ""}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                      placeholder="For individual clients"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-gray-700">Email</span>
                    <input
                      name="email"
                      type="email"
                      defaultValue={form.client.email}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-gray-700">Phone</span>
                    <input
                      name="phone"
                      type="tel"
                      defaultValue={form.client.phone}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-gray-700">Country Code</span>
                    <input
                      name="countryCode"
                      type="text"
                      defaultValue={form.client.countryCode}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-gray-700">TRN</span>
                    <input
                      name="trn"
                      type="text"
                      defaultValue={form.client.trn ?? ""}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                      placeholder="Tax registration number"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      name="hasNoTrn"
                      type="checkbox"
                      defaultChecked={!!form.client.hasNoTrn}
                      className="h-4 w-4 rounded border border-gray-300 text-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                    />
                    No TRN available
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-gray-700">Address</span>
                    <input
                      name="address"
                      type="text"
                      defaultValue={form.client.address ?? ""}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-gray-700">City</span>
                    <input
                      name="city"
                      type="text"
                      defaultValue={form.client.city ?? ""}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-gray-700">Area</span>
                    <input
                      name="area"
                      type="text"
                      defaultValue={form.client.area ?? ""}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-gray-700">State</span>
                    <input
                      name="state"
                      type="text"
                      defaultValue={form.client.state ?? ""}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus-border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-gray-700">Postal Code</span>
                    <input
                      name="postalCode"
                      type="text"
                      defaultValue={form.client.postalCode ?? ""}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus-border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                    />
                  </label>
                </div>

                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-gray-700">Country</span>
                  <input
                    name="country"
                    type="text"
                    defaultValue={form.client.country ?? ""}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus-border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                  />
                </label>

                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-gray-700">
                    Additional emails (comma, semicolon, or newline separated)
                  </span>
                  <textarea
                    name="emails"
                    defaultValue={
                      form.client.emails
                        ? (() => {
                            try {
                              const parsed = JSON.parse(form.client.emails);
                              return Array.isArray(parsed) ? parsed.join(", ") : "";
                            } catch {
                              return "";
                            }
                          })()
                        : ""
                    }
                    className="min-h-20 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus-border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                  />
                </label>

                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-gray-700">Additional notes</span>
                  <textarea
                    name="additionalInfo"
                    defaultValue={form.client.additionalInfo ?? ""}
                    className="min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus-border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/40"
                  />
                </label>

                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                  <form action={goBackToStep1}>
                    <Button variant="secondary" className="px-6">
                      Previous
                    </Button>
                  </form>
                  <Button type="submit" className="px-6">
                    Save &amp; Continue
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      )}
    </main>
  );
};

export default Step2Page;
