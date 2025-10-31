"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { QuoteFormData } from "@/types";
import { loadForm, saveForm } from "@/lib/storage";
import {
  Download,
  Send,
  Save,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  Calendar,
} from "lucide-react";

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

function toMoney(n: number) {
  return `AED ${n.toFixed(2)}`;
}

/** Kalkulasi harga berdasarkan form operational + calculation settings. */
function computeTotals(form: QuoteFormData): Totals {
  const p = form.operational.papers?.[0];

  const perSheetPrice = Number(p?.pricePerSheet ?? 0);
  const enteredSheets = Number(p?.enteredSheets ?? p?.recommendedSheets ?? 0);
  const paperCost = perSheetPrice * enteredSheets;

  const finishingCost = (form.operational.finishing ?? []).reduce(
    (s, f) => s + (f.cost ?? 0),
    0
  );

  const baseBeforeMargin = paperCost + finishingCost;

  const marginPct = Number(form.calculation.marginPercentage ?? 0) / 100;
  const marginAmount = +(baseBeforeMargin * marginPct);

  const subtotal = baseBeforeMargin + marginAmount;

  // Diskon: prioritas amount > percentage bila amount > 0
  const hasDiscount = !!form.calculation.discount?.isApplied;
  const discAmountRaw = hasDiscount
    ? (form.calculation.discount?.amount ?? 0) > 0
      ? Number(form.calculation.discount?.amount ?? 0)
      : subtotal * (Number(form.calculation.discount?.percentage ?? 0) / 100)
    : 0;

  const discountAmount = Math.min(discAmountRaw, subtotal);
  const finalSubtotal = subtotal - discountAmount;

  const vatAmount = +(finalSubtotal * 0.05);
  const totalPrice = +(finalSubtotal + vatAmount);

  return {
    paperCost: +paperCost,
    finishingCost: +finishingCost,
    baseBeforeMargin: +baseBeforeMargin,
    marginAmount: +marginAmount,
    subtotal: +subtotal,
    discountAmount: +discountAmount,
    finalSubtotal: +finalSubtotal,
    vatAmount: +vatAmount,
    totalPrice: +totalPrice,
  };
}

export default function Step5ClientWrapper() {
  const router = useRouter();
  const [form, setForm] = useState<QuoteFormData | null>(null);

  useEffect(() => {
    setForm(loadForm<QuoteFormData>() ?? null);
  }, []);

  // Recompute dan sinkronkan ke form.calculation agar konsisten
  const totals = useMemo(() => (form ? computeTotals(form) : null), [form]);

  useEffect(() => {
    if (!form || !totals) return;
    const next: QuoteFormData = {
      ...form,
      calculation: {
        ...form.calculation,
        basePrice: totals.baseBeforeMargin,
        marginAmount: totals.marginAmount,
        subtotal: totals.subtotal,
        finalSubtotal: totals.finalSubtotal,
        vatAmount: totals.vatAmount,
        totalPrice: totals.totalPrice,
      },
    };
    // Cek untuk menghindari infinite loop jika objek/angka tidak berubah
    if (form.calculation.totalPrice !== totals.totalPrice) {
      setForm(next);
      saveForm(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totals?.totalPrice, form]); // Tambahkan 'form' sebagai dependensi

  if (!form)
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading quotation...</p>
      </div>
    );

  const client = form.client;
  const product = form.products[0];

  // Handlers Discount & Margin
  const setDiscountApplied = (applied: boolean) =>
    setForm({
      ...form,
      calculation: {
        ...form.calculation,
        discount: {
          isApplied: applied,
          percentage: applied ? form.calculation.discount?.percentage ?? 0 : 0,
          amount: applied ? form.calculation.discount?.amount ?? 0 : 0,
        },
      },
    });

  const setDiscountPct = (pct: number) =>
    setForm({
      ...form,
      calculation: {
        ...form.calculation,
        discount: {
          ...(form.calculation.discount ?? {
            isApplied: true,
            percentage: 0,
            amount: 0,
          }),
          percentage: pct,
        },
      },
    });

  const setDiscountAmount = (amt: number) =>
    setForm({
      ...form,
      calculation: {
        ...form.calculation,
        discount: {
          ...(form.calculation.discount ?? {
            isApplied: true,
            percentage: 0,
            amount: 0,
          }),
          amount: amt,
        },
      },
    });

  const setMarginPct = (pct: number) =>
    setForm({
      ...form,
      calculation: { ...form.calculation, marginPercentage: pct },
    });
  
  const handleSubmit = () => {
    // Mengganti alert dengan console.log atau UI modal kustom
    console.log("Quote submitted successfully (mock).");
    // Di aplikasi nyata, di sini Anda akan memanggil API
    // ...
    // router.push("/isr/success");
  };

  return (
    <>
      {!product && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900">Product Incomplete</AlertTitle>
          <AlertDescription className="text-amber-800">
            Please complete Step 3 (Product Spec) and Step 4 (Operational) to
            see accurate calculations.
          </AlertDescription>
        </Alert>
      )}

      {/* Header Cards */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card className="border-l-4 border-l-[#27aae1]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-[#27aae1]" />
              Quote To
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Client Type</span>
              <Badge
                variant="secondary"
                className="bg-[#27aae1]/10 text-[#27aae1] border-[#27aae1]/20"
              >
                {client.clientType}
              </Badge>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Company</span>
              <span className="font-medium">{client.companyName || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Contact Person</span>
              <span className="font-medium">{client.contactPerson || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-[#27aae1]">
                {client.email || JSON.parse(client.emails || "[]")?.[0] || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium">
                {client.countryCode} {client.phone || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Address</span>
              <span className="font-medium text-right max-w-xs">
                {client.address || "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#ea078b]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-[#ea078b]" />
              Quote Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Sales Person</span>
              <span className="font-medium">{form.salesPersonId || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date
              </span>
              <span className="font-medium">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Status</span>
              <Badge
                variant="outline"
                className="border-gray-400 text-gray-700"
              >
                Draft
              </Badge>
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

      {/* Discount Management */}
      <Card className="mb-6 border-l-4 border-l-[#fbec20]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Pricing Adjustments</CardTitle>
          <p className="text-sm text-gray-500">
            Configure margin and discount settings
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Switch
              id="discountToggle"
              checked={!!form.calculation.discount?.isApplied}
              onCheckedChange={setDiscountApplied}
              className="data-[state=checked]:bg-[#27aae1]"
            />
            <label
              htmlFor="discountToggle"
              className="text-sm font-medium cursor-pointer"
            >
              Apply Discount to This Quote
            </label>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="margin"
                className="text-xs font-medium text-gray-700"
              >
                Profit Margin (%)
              </label>
              <Input
                id="margin"
                type="number"
                value={form.calculation.marginPercentage}
                onChange={(e) => setMarginPct(Number(e.target.value) || 0)}
                className="focus:border-[#27aae1] focus:ring-[#27aae1]"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="discountPct"
                className="text-xs font-medium text-gray-700"
              >
                Discount Percentage (%)
              </label>
              <Input
                id="discountPct"
                type="number"
                disabled={!form.calculation.discount?.isApplied}
                value={form.calculation.discount?.percentage ?? 0}
                onChange={(e) => setDiscountPct(Number(e.target.value) || 0)}
                className="focus:border-[#27aae1] focus:ring-[#27aae1] disabled:bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="discountAmt"
                className="text-xs font-medium text-gray-700"
              >
                Discount Amount (AED)
              </label>
              <Input
                id="discountAmt"
                type="number"
                disabled={!form.calculation.discount?.isApplied}
                value={form.calculation.discount?.amount ?? 0}
                onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                className="focus:border-[#27aae1] focus:ring-[#27aae1] disabled:bg-gray-100"
              />
            </div>
          </div>

          {form.calculation.discount?.isApplied && (
            <p className="text-xs text-gray-500 bg-amber-50 p-2 rounded border border-amber-200">
              <strong>Note:</strong> If discount amount is set, it will override
              the percentage value.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Price Summary */}
      <Card className="mb-6 border-l-4 border-l-[#27aae1]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Price Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Product Name</TableHead>
                  <TableHead className="w-32 font-semibold">Quantity</TableHead>
                  <TableHead className="w-40 text-right font-semibold">
                    Subtotal
                  </TableHead>
                  <TableHead className="w-32 text-right font-semibold">
                    VAT (5%)
                  </TableHead>
                  <TableHead className="w-40 text-right font-semibold">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    {product?.productName || "-"}
                  </TableCell>
                  <TableCell>{product?.quantity ?? 0}</TableCell>
                  <TableCell className="text-right font-medium">
                    {toMoney(totals?.finalSubtotal ?? 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {toMoney(totals?.vatAmount ?? 0)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-[#27aae1]">
                    {toMoney(totals?.totalPrice ?? 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <Separator className="my-6" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
              <div className="font-semibold text-gray-800 mb-3">
                Cost Breakdown
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paper Cost</span>
                <span className="font-medium">
                  {toMoney(totals?.paperCost ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Finishing Cost</span>
                <span className="font-medium">
                  {toMoney(totals?.finishingCost ?? 0)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Base Total</span>
                <span className="font-semibold">
                  {toMoney(totals?.baseBeforeMargin ?? 0)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
              <div className="font-semibold text-gray-800 mb-3">
                Adjustments
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Margin ({form.calculation.marginPercentage}%)
                </span>
                <span className="font-medium text-green-600">
                  + {toMoney(totals?.marginAmount ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {toMoney(totals?.subtotal ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-red-600">
                  - {toMoney(totals?.discountAmount ?? 0)}
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
                  {toMoney(totals?.finalSubtotal ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT (5%)</span>
                <span className="font-medium">
                  {toMoney(totals?.vatAmount ?? 0)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-gray-800">
                  Total Price
                </span>
                <span className="text-xl font-bold text-[#27aae1]">
                  {toMoney(totals?.totalPrice ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download & Actions */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-l-4 border-l-[#ea078b]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5 text-[#ea078b]" />
              Download Options
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              disabled
              className="border-[#27aae1] text-[#27aae1] hover:bg-[#27aae1] hover:text-white disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Customer Copy
            </Button>
            <Button
              variant="outline"
              disabled
              className="border-[#ea078b] text-[#ea078b] hover:bg-[#ea078b] hover:text-white disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Operations Copy
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#fbec20]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-[#fbec20]" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            <Button variant="outline" className="hover:bg-gray-100">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="outline" className="hover:bg-gray-100">
              <Send className="h-4 w-4 mr-2" />
              Request Approval
            </Button>
            <Button variant="outline" className="hover:bg-gray-100">
              <Send className="h-4 w-4 mr-2" />
              Send to Customer
            </Button>
            <Button className="bg-[#27aae1] hover:bg-[#1f8bb8] text-white">
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Quote
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => router.push("/isr/step-4")}
          className="border-gray-300 hover:bg-gray-100"
        >
          Previous Step
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-[#27aae1] hover:bg-[#1f8bb8] text-white px-8"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Submit Quote
        </Button>
      </div>
    </>
  );
}
