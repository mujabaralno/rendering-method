// app/(root)/ssr/step-5/page.tsx
import { redirect } from "next/navigation";
import StepIndicator from "@/components/ssr/StepIndicator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getQuoteForm,
  getQuoteState,
  setQuoteForm,
} from "@/lib/server/cookie-helper";
import type { QuoteFormData } from "@/types";

export const dynamic = "force-dynamic";

/* ----------------------------- Utils & Types ----------------------------- */

type Totals = {
  paperCost: number;
  finishingCost: number;
  baseBeforeMargin: number;
  marginAmount: number;
  subtotal: number;
  discountAmount: number;
  finalSubtotal: number;
  vatAmount: number;
  totalPrice: number;
};

const formatMoney = (value: number) => `AED ${Number(value || 0).toFixed(2)}`;

const computeTotals = (form: QuoteFormData): Totals => {
  const paper = form.operational.papers?.[0];
  const perSheetPrice = Number(paper?.pricePerSheet ?? 0);
  const enteredSheets = Number(
    paper?.enteredSheets ?? paper?.recommendedSheets ?? 0
  );
  const paperCost = perSheetPrice * enteredSheets;

  const finishingCost = (form.operational.finishing ?? []).reduce(
    (sum, item) => sum + Number(item.cost ?? 0),
    0
  );

  const baseBeforeMargin = paperCost + finishingCost;
  const marginPct = Number(form.calculation.marginPercentage ?? 0) / 100;
  const marginAmount = baseBeforeMargin * marginPct;
  const subtotal = baseBeforeMargin + marginAmount;

  const d = form.calculation.discount;
  const hasDiscount = !!d?.isApplied;
  const discountAmountRaw = hasDiscount
    ? Number(d?.amount ?? 0) > 0
      ? Number(d?.amount ?? 0)
      : subtotal * (Number(d?.percentage ?? 0) / 100)
    : 0;

  const discountAmount = Math.min(discountAmountRaw, subtotal);
  const finalSubtotal = subtotal - discountAmount;
  const vatAmount = finalSubtotal * 0.05;
  const totalPrice = finalSubtotal + vatAmount;

  return {
    paperCost,
    finishingCost,
    baseBeforeMargin,
    marginAmount,
    subtotal,
    discountAmount,
    finalSubtotal,
    vatAmount,
    totalPrice,
  };
};

/* ------------------------------- Actions -------------------------------- */

const goBackToStep4 = async () => {
  "use server";
  redirect("/ssr/step-4");
};

const saveCalculationAdjustments = async (formData: FormData) => {
  "use server";

  const currentForm = await getQuoteForm();

  const parseNumber = (key: string, fallback = 0) => {
    const raw = (formData.get(key) as string | null)?.trim();
    if (!raw) return fallback;
    const num = Number(raw);
    return Number.isFinite(num) ? num : fallback;
  };
  const parseText = (key: string) =>
    (formData.get(key) as string | null)?.trim() ?? "";
  const parseBoolean = (key: string) => formData.get(key) === "on";

  const marginPercentage = parseNumber(
    "marginPercentage",
    currentForm.calculation.marginPercentage
  );

  const discountApplied = parseBoolean("discountApplied");
  const discountPercentage = parseNumber(
    "discountPercentage",
    currentForm.calculation.discount?.percentage ?? 0
  );
  const discountAmount = parseNumber(
    "discountAmount",
    currentForm.calculation.discount?.amount ?? 0
  );
  const approvalNotes = parseText("approvalNotes");

  const nextForm: QuoteFormData = {
    ...currentForm,
    calculation: {
      ...currentForm.calculation,
      marginPercentage,
      discount: discountApplied
        ? {
            isApplied: true,
            percentage: discountPercentage,
            amount: discountAmount,
            approval: currentForm.calculation.discount?.approval,
          }
        : {
            isApplied: false,
            percentage: 0,
            amount: 0,
            approval: currentForm.calculation.discount?.approval,
          },
    },
    approval: approvalNotes
      ? {
          status: currentForm.approval?.status ?? "Draft",
          requiresApproval: currentForm.approval?.requiresApproval ?? false,
          approvalNotes,
          approvedAt: currentForm.approval?.approvedAt,
          approvedBy: currentForm.approval?.approvedBy,
        }
      : currentForm.approval,
  };

  // Recompute totals & persist
  const totals = computeTotals(nextForm);
  nextForm.calculation = {
    ...nextForm.calculation,
    basePrice: totals.baseBeforeMargin,
    marginAmount: totals.marginAmount,
    subtotal: totals.subtotal,
    finalSubtotal: totals.finalSubtotal,
    vatAmount: totals.vatAmount,
    totalPrice: totals.totalPrice,
  };

  await setQuoteForm(nextForm);
  redirect("/ssr/step-5");
};

/* --------------------------------- Page --------------------------------- */

const Step5Page = async () => {
  const { form } = await getQuoteState();
  const totals = computeTotals(form);

  const customer = form.client;
  const product = form.products[0];
  const discount = form.calculation.discount;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <StepIndicator active={5} />

      {/* Title + subtitle */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quotation Summary</h1>
        <p className="text-gray-600">
          Review and finalize your quote before submission
        </p>
      </div>

      {/* Header Cards: Quote To & Quote Details */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Quote To */}
        <Card className="border-l-4 border-l-[#27aae1]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Quote To</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Client Type</span>
              <span className="font-medium">
                {customer.clientType}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Company</span>
              <span className="font-medium">
                {customer.clientType === "Company"
                  ? customer.companyName || "Company"
                  : `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
                    "Individual"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Contact Person</span>
              <span className="font-medium">
                {customer.contactPerson || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-[#27aae1]">
                {customer.email || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium">
                {customer.countryCode} {customer.phone || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Address</span>
              <span className="font-medium text-right max-w-xs">
                {[customer.address, customer.city, customer.country]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quote Details */}
        <Card className="border-l-4 border-l-[#ea078b]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Quote Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Sales Person</span>
              <span className="font-medium">{form.salesPersonId || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Date</span>
              <span className="font-medium">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Status</span>
              <span className="font-medium">Draft</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Quote ID</span>
              <span className="font-mono text-xs text-gray-400">
                Auto-generated on save
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Adjustments (form server action tetap sama) */}
      <Card className="mb-6 border-l-4 border-l-[#fbec20]">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg">Pricing Adjustments</CardTitle>
          <p className="text-sm text-gray-500">
            Configure margin and discount settings
          </p>
        </CardHeader>
        <CardContent>
          <form
            action={saveCalculationAdjustments}
            className="space-y-4 text-sm text-gray-700"
          >
            {/* Apply Discount toggle */}
            <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                name="discountApplied"
                defaultChecked={!!discount?.isApplied}
                className="h-4 w-4 rounded border border-gray-300"
              />
              <span className="font-medium">Apply Discount to This Quote</span>
            </label>

            {/* Inputs grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-700">
                  Profit Margin (%)
                </span>
                <input
                  type="number"
                  name="marginPercentage"
                  step="0.1"
                  defaultValue={form.calculation.marginPercentage}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/30"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-700">
                  Discount Percentage (%)
                </span>
                <input
                  type="number"
                  name="discountPercentage"
                  step="0.1"
                  defaultValue={discount?.percentage ?? 0}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/30"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-700">
                  Discount Amount (AED)
                </span>
                <input
                  type="number"
                  name="discountAmount"
                  step="0.01"
                  defaultValue={discount?.amount ?? 0}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/30"
                />
              </label>
            </div>

            <p className="text-xs text-gray-500 bg-amber-50 p-2 rounded border border-amber-200">
              <strong>Note:</strong> If discount amount is set, it will override
              the percentage value.
            </p>

            {/* Notes */}
            <label className="grid gap-1">
              <span className="font-medium text-gray-700">
                Internal notes / approval
              </span>
              <textarea
                name="approvalNotes"
                placeholder="Add information for approvers or handover."
                defaultValue={form.approval?.approvalNotes ?? ""}
                className="min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#27aae1] focus:outline-none focus:ring-2 focus:ring-[#27aae1]/30"
              />
            </label>

            {/* Footer actions for this form section */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <Button type="submit" variant="secondary" formAction={goBackToStep4} className="px-6">
                Previous
              </Button>
              <Button type="submit" className="px-6">
                Update totals
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Price Summary (tabel ringkas) */}
      <Card className="mb-6 border-l-4 border-l-[#27aae1]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Price Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold">Product Name</th>
                  <th className="px-4 py-3 font-semibold w-32">Quantity</th>
                  <th className="px-4 py-3 font-semibold w-40 text-right">
                    Subtotal
                  </th>
                  <th className="px-4 py-3 font-semibold w-32 text-right">
                    VAT (5%)
                  </th>
                  <th className="px-4 py-3 font-semibold w-40 text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium">
                    {product?.productName || "-"}
                  </td>
                  <td className="px-4 py-3">{product?.quantity ?? 0}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatMoney(totals.finalSubtotal)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatMoney(totals.vatAmount)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#27aae1]">
                    {formatMoney(totals.totalPrice)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Three cards: Cost Breakdown / Adjustments / Final Amount */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
              <div className="font-semibold text-gray-800 mb-3">
                Cost Breakdown
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paper Cost</span>
                <span className="font-medium">
                  {formatMoney(totals.paperCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Finishing Cost</span>
                <span className="font-medium">
                  {formatMoney(totals.finishingCost)}
                </span>
              </div>
              <div className="my-2 h-px bg-gray-200" />
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Base Total</span>
                <span className="font-semibold">
                  {formatMoney(totals.baseBeforeMargin)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
              <div className="font-semibold text-gray-800 mb-3">Adjustments</div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Margin ({form.calculation.marginPercentage}%)
                </span>
                <span className="font-medium">
                  + {formatMoney(totals.marginAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {formatMoney(totals.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium">
                  - {formatMoney(totals.discountAmount)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-linear-to-br from-[#27aae1]/10 to-[#ea078b]/10 rounded-lg border border-[#27aae1]/20 space-y-2 text-sm">
              <div className="font-semibold text-gray-800 mb-3">
                Final Amount
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Final Subtotal</span>
                <span className="font-medium">
                  {formatMoney(totals.finalSubtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT (5%)</span>
                <span className="font-medium">
                  {formatMoney(totals.vatAmount)}
                </span>
              </div>
              <div className="my-2 h-px bg-gray-200" />
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-gray-800">
                  Total Price
                </span>
                <span className="text-xl font-bold text-[#27aae1]">
                  {formatMoney(totals.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Options & Actions */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-l-4 border-l-[#ea078b]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Download Options</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            <Button variant="outline" disabled className="border-[#27aae1] text-[#27aae1] hover:bg-[#27aae1] hover:text-white disabled:opacity-50">
              Customer Copy
            </Button>
            <Button variant="outline" disabled className="border-[#ea078b] text-[#ea078b] hover:bg-[#ea078b] hover:text-white disabled:opacity-50">
              Operations Copy
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#fbec20]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            <Button variant="outline" className="hover:bg-gray-100" disabled>
              Save Draft
            </Button>
            <Button variant="outline" className="hover:bg-gray-100" disabled>
              Request Approval
            </Button>
            <Button variant="outline" className="hover:bg-gray-100" disabled>
              Send to Customer
            </Button>
            <form action={saveCalculationAdjustments}>
              {/* Tombol "Save Quote" tetap submit ke action yang sama untuk persist totals */}
              <Button type="submit" className="bg-[#27aae1] hover:bg-[#1f8bb8] text-white w-full">
                Save Quote
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-6 border-t">
        <form action={goBackToStep4}>
          <Button type="submit" variant="outline" className="border-gray-300 hover:bg-gray-100">
            Previous Step
          </Button>
        </form>
        <form action={saveCalculationAdjustments}>
          <Button type="submit" className="bg-[#27aae1] hover:bg-[#1f8bb8] text-white px-8">
            Submit Quote
          </Button>
        </form>
      </div>
    </main>
  );
};

export default Step5Page;
