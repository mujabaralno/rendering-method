"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/shared/StepIndicator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { QuoteFormData, UIFlowState } from "@/types";
import { loadForm, saveForm } from "@/lib/storage";
import { FileText, Copy } from "lucide-react";

const UI_KEY = "sp_quote_ui";

const INITIAL_FORM: QuoteFormData = {
  client: {
    clientType: "Company",
    companyName: "",
    contactPerson: "",
    email: "",
    emails: "[]",
    phone: "",
    countryCode: "+971",
    role: "",
    address: "",
    city: "",
    area: "",
    state: "",
    postalCode: "",
    country: "",
    additionalInfo: "",
  },
  products: [],
  operational: {
    papers: [],
    finishing: [],
    plates: null,
    units: null,
    impressions: null,
  },
  calculation: {
    basePrice: 0,
    marginAmount: 0,
    marginPercentage: 15,
    subtotal: 0,
    finalSubtotal: 0,
    vatAmount: 0,
    totalPrice: 0,
  },
  approval: undefined,
  salesPersonId: undefined,
};

export default function Step1FormISR() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<"new" | "existing" | null>(
    null
  );
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const f = loadForm<QuoteFormData>();
    if (!f) {
      saveForm(INITIAL_FORM);
    }
    const rawUi =
      typeof window !== "undefined" ? localStorage.getItem(UI_KEY) : null;
    if (rawUi) {
      const parsedUi = JSON.parse(rawUi) as UIFlowState;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedMode(parsedUi.mode);
    }
  }, []);

  const handleModeSelection = (mode: "new" | "existing") => {
    setSelectedMode(mode);

    const nextUi: UIFlowState = { mode };
    if (typeof window !== "undefined") {
      localStorage.setItem(UI_KEY, JSON.stringify(nextUi));
    }

    if (mode === "new") {
      saveForm(INITIAL_FORM);
    }
  };

  const handleNext = () => {
    if (!selectedMode) return;
    setIsNavigating(true);
    router.push("/isr/step-2"); // Arahkan ke rute ISR berikutnya
  };

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Card: Start New */}
        <Card
          role="button"
          tabIndex={0}
          onClick={() => handleModeSelection("new")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleModeSelection("new");
            }
          }}
          className={`
            cursor-pointer transition-all duration-200 hover:shadow-lg
            ${
              selectedMode === "new"
                ? "ring-4 ring-[#27aae1] shadow-xl border-[#27aae1]"
                : "hover:border-gray-300 border-gray-200"
            }
          `}
          aria-pressed={selectedMode === "new"}
          aria-label="Create new quote from scratch"
        >
          <CardHeader>
            <div className="flex items-start gap-3">
              <div
                className={`
                  p-3 rounded-lg transition-colors duration-200
                  ${
                    selectedMode === "new"
                      ? "bg-[#27aae1] text-white"
                      : "bg-gray-100 text-gray-600"
                  }
                `}
              >
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl mb-1">Create New Quote</CardTitle>
                <p className="text-sm text-gray-500 font-normal">
                  Perfect for new projects
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 leading-relaxed">
              Start a fresh quotation from scratch with a clean slate. Ideal for
              new projects or custom requirements that need a personalized
              approach.
            </p>

            {selectedMode === "new" && (
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#27aae1]">
                <div className="w-2 h-2 rounded-full bg-[#27aae1] animate-pulse" />
                Selected
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card: Use Existing */}
        <Card
          role="button"
          tabIndex={0}
          onClick={() => handleModeSelection("existing")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleModeSelection("existing");
            }
          }}
          className={`
            cursor-pointer transition-all duration-200 hover:shadow-lg
            ${
              selectedMode === "existing"
                ? "ring-4 ring-[#ea078b] shadow-xl border-[#ea078b]"
                : "hover:border-gray-300 border-gray-200"
            }
          `}
          aria-pressed={selectedMode === "existing"}
          aria-label="Use existing quote as template"
        >
          <CardHeader>
            <div className="flex items-start gap-3">
              <div
                className={`
                  p-3 rounded-lg transition-colors duration-200
                  ${
                    selectedMode === "existing"
                      ? "bg-[#ea078b] text-white"
                      : "bg-gray-100 text-gray-600"
                  }
                `}
              >
                <Copy className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl mb-1">
                  Based on Previous Quote
                </CardTitle>
                <p className="text-sm text-gray-500 font-normal">
                  Save time with templates
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 leading-relaxed">
              Use an existing quote as a template to speed up the process.
              Customer information and product specifications will be prefilled
              for you.
            </p>

            {selectedMode === "existing" && (
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#ea078b]">
                <div className="w-2 h-2 rounded-full bg-[#ea078b] animate-pulse" />
                Selected
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">Step 1 of 5</p>
        <Button
          onClick={handleNext}
          disabled={!selectedMode || isNavigating}
          className={`
            px-8 py-2.5 font-medium transition-all duration-200
            ${
              selectedMode
                ? "bg-[#27aae1] hover:bg-[#1f8bb8] text-white shadow-md hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
          aria-label="Proceed to next step"
        >
          {isNavigating ? "Loading..." : "Next Step"}
        </Button>
      </div>

      {/* Visual Accent */}
      {selectedMode && (
        <div className="mt-8 p-4 bg-linear-to-r from-[#27aae1]/10 via-[#ea078b]/10 to-[#fbec20]/10 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">
              {selectedMode === "new" ? "New Quote" : "Template-Based Quote"}
            </span>{" "}
            selected. Click &quot;Next Step&quot; to continue.
          </p>
        </div>
      )}
    </>
  );
}
