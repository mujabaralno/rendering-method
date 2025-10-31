// app/(root)/ssr/step-1/page.tsx
import { redirect } from "next/navigation";
import { FileText, Copy } from "lucide-react";
import StepIndicator from "@/components/ssr/StepIndicator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getInitialForm,
  getQuoteState,
  getUIState,
  setQuoteForm,
  setUIState,
} from "@/lib/server/cookie-helper";

export const dynamic = "force-dynamic";

const handleStep1Submit = async (formData: FormData) => {
  "use server";

  const mode = formData.get("mode");
  if (mode !== "new" && mode !== "existing") {
    redirect("/ssr/step-1");
  }

  if (mode === "new") {
    await setQuoteForm(getInitialForm());
    await setUIState({ mode: "new" });
  } else {
    const current = await getUIState();
    await setUIState({
      mode: "existing",
      selectedExistingQuoteId: current.selectedExistingQuoteId,
    });
  }

  redirect("/ssr/step-2");
};

const Step1Page = async () => {
  const { ui } = await getQuoteState();
  const selectedMode = ui.mode;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Step indicator */}
      <div className="mb-8">
        <StepIndicator active={1} />
      </div>

      {/* Header (samakan dengan CSR) */}
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Create A Quote</h1>
        <p className="text-base text-gray-600">
          Choose how you&apos;d like to create your printing quote
        </p>
      </header>

      {/* Form utama: logic tetap sama */}
      <form action={handleStep1Submit} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card: Start New (UI parity + ring sama seperti CSR) */}
          <label className="block cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="new"
              defaultChecked={selectedMode === "new"}
              className="peer sr-only"
            />
            <Card
              className={`
                h-full border transition-all duration-200
                peer-focus-visible:outline peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[#27aae1]
                peer-checked:border-[#27aae1] peer-checked:shadow-xl peer-checked:ring-4 peer-checked:ring-[#27aae1]/30
                ${selectedMode === "new" ? "ring-4 ring-[#27aae1] shadow-xl border-[#27aae1]" : "hover:border-gray-300 border-gray-200 hover:shadow-lg"}
              `}
              aria-pressed={selectedMode === "new"}
              aria-label="Create new quote from scratch"
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      rounded-lg p-3 text-gray-600 transition-colors duration-200
                      ${selectedMode === "new" ? "bg-[#27aae1] text-white" : "bg-gray-100 text-gray-600"}
                      peer-checked:bg-[#27aae1] peer-checked:text-white
                    `}
                  >
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">Create New Quote</CardTitle>
                    <p className="text-sm font-normal text-gray-500">Perfect for new projects</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <p>
                  Start a fresh quotation from scratch with a clean slate. Ideal for new
                  projects or custom requirements that need a personalized approach.
                </p>
                {selectedMode === "new" && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#27aae1]/10 px-3 py-1 text-sm font-medium text-[#27aae1]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#27aae1]" />
                    Selected
                  </div>
                )}
              </CardContent>
            </Card>
          </label>

          {/* Card: Use Existing (UI parity + ring magenta) */}
          <label className="block cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="existing"
              defaultChecked={selectedMode === "existing"}
              className="peer sr-only"
            />
            <Card
              className={`
                h-full border transition-all duration-200
                peer-focus-visible:outline peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[#ea078b]
                peer-checked:border-[#ea078b] peer-checked:shadow-xl peer-checked:ring-4 peer-checked:ring-[#ea078b]/30
                ${selectedMode === "existing" ? "ring-4 ring-[#ea078b] shadow-xl border-[#ea078b]" : "hover:border-gray-300 border-gray-200 hover:shadow-lg"}
              `}
              aria-pressed={selectedMode === "existing"}
              aria-label="Use existing quote as template"
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      rounded-lg p-3 text-gray-600 transition-colors duration-200
                      ${selectedMode === "existing" ? "bg-[#ea078b] text-white" : "bg-gray-100 text-gray-600"}
                      peer-checked:bg-[#ea078b] peer-checked:text-white
                    `}
                  >
                    <Copy className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">Based on Previous Quote</CardTitle>
                    <p className="text-sm font-normal text-gray-500">Save time with templates</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <p>
                  Use an existing quote as a template to speed up the process. Customer
                  information and product specifications will be prefilled for you.
                </p>
                {selectedMode === "existing" && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ea078b]/10 px-3 py-1 text-sm font-medium text-[#ea078b]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#ea078b]" />
                    Selected
                  </div>
                )}
              </CardContent>
            </Card>
          </label>
        </div>

        {/* Navigation (label & style disamakan) */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">Step 1 of 5</p>
          <Button type="submit" className={`px-8 py-2.5 font-medium transition-all duration-200 ${selectedMode ? "bg-[#27aae1] hover:bg-[#1f8bb8] text-white shadow-md hover:shadow-lg" : "bg-gray-200 text-gray-400"}`}>
            Next Step
          </Button>
        </div>
      </form>

      {/* Accent bar (parity dengan CSR) */}
      {selectedMode && (
        <div className="mt-8 rounded-lg border border-gray-200 p-4 bg-linear-to-r from-[#27aae1]/10 via-[#ea078b]/10 to-[#fbec20]/10">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">
              {selectedMode === "new" ? "New Quote" : "Template-Based Quote"}
            </span>{" "}
            selected. Click &quot;Next Step&quot; to continue.
          </p>
        </div>
      )}
    </main>
  );
};

export default Step1Page;
