"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/csr/StepIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { QuoteFormData } from "@/types";
import { loadForm, saveForm } from "@/lib/storage";

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

  const finishingCost = (form.operational.finishing ?? []).reduce((s, f) => s + (f.cost ?? 0), 0);

  const baseBeforeMargin = paperCost + finishingCost;

  const marginPct = Number(form.calculation.marginPercentage ?? 0) / 100;
  const marginAmount = +(baseBeforeMargin * marginPct);

  const subtotal = baseBeforeMargin + marginAmount;

  // Diskon: prioritas amount > percentage bila amount > 0
  const hasDiscount = !!form.calculation.discount?.isApplied;
  const discAmountRaw =
    hasDiscount
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

export default function Step5Page() {
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
    setForm(next);
    saveForm(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totals?.totalPrice]);

  if (!form) return <p className="p-6">Loading…</p>;

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
          percentage: applied ? (form.calculation.discount?.percentage ?? 0) : 0,
          amount: applied ? (form.calculation.discount?.amount ?? 0) : 0,
        },
      },
    });

  const setDiscountPct = (pct: number) =>
    setForm({
      ...form,
      calculation: {
        ...form.calculation,
        discount: { ...(form.calculation.discount ?? { isApplied: true, percentage: 0, amount: 0 }), percentage: pct },
      },
    });

  const setDiscountAmount = (amt: number) =>
    setForm({
      ...form,
      calculation: {
        ...form.calculation,
        discount: { ...(form.calculation.discount ?? { isApplied: true, percentage: 0, amount: 0 }), amount: amt },
      },
    });

  const setMarginPct = (pct: number) =>
    setForm({
      ...form,
      calculation: { ...form.calculation, marginPercentage: pct },
    });

  return (
    <main className="mx-auto max-w-6xl p-6">
      <StepIndicator active={5} />
      <h1 className="text-2xl font-bold mb-4">Quotation Summary</h1>

      {!product && (
        <Alert className="mb-6">
          <AlertTitle>Product belum lengkap</AlertTitle>
          <AlertDescription>
            Lengkapi Step-3 & Step-4 terlebih dahulu agar ringkasan dan kalkulasi valid.
          </AlertDescription>
        </Alert>
      )}

      {/* Header Cards */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Quote To:</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>Client Type</div><div><Badge variant="secondary">{client.clientType}</Badge></div>
            <div>Company</div><div>{client.companyName || "-"}</div>
            <div>Contact Person</div><div>{client.contactPerson || "-"}</div>
            <div>Email</div><div>{client.email || JSON.parse(client.emails || "[]")?.[0] || "-"}</div>
            <div>Phone</div><div>{client.countryCode} {client.phone || "-"}</div>
            <div>Address</div><div>{client.address || "-"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quote Details</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>Sales Person</div><div>{form.salesPersonId || "-"}</div>
            <div>Date</div><div>{new Date().toLocaleDateString()}</div>
            <div>Status</div><div><Badge variant="outline">Draft</Badge></div>
            <div>Quote ID</div><div><span className="font-mono text-xs opacity-70">—</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Discount Management */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Discount Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={!!form.calculation.discount?.isApplied} onCheckedChange={setDiscountApplied} />
            <span>Apply Discount</span>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs block mb-1">Margin (%)</label>
              <Input
                type="number"
                value={form.calculation.marginPercentage}
                onChange={(e) => setMarginPct(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="text-xs block mb-1">Discount (%)</label>
              <Input
                type="number"
                disabled={!form.calculation.discount?.isApplied}
                value={form.calculation.discount?.percentage ?? 0}
                onChange={(e) => setDiscountPct(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="text-xs block mb-1">Discount (Amount)</label>
              <Input
                type="number"
                disabled={!form.calculation.discount?.isApplied}
                value={form.calculation.discount?.amount ?? 0}
                onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Price Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead className="w-32">Quantity</TableHead>
                <TableHead className="w-48 text-right">Total Price</TableHead>
                <TableHead className="w-32 text-right">VAT (5%)</TableHead>
                <TableHead className="w-48 text-right">Final Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{product?.productName || "-"}</TableCell>
                <TableCell>{product?.quantity ?? 0}</TableCell>
                <TableCell className="text-right">{toMoney(totals?.finalSubtotal ?? 0)}</TableCell>
                <TableCell className="text-right">{toMoney(totals?.vatAmount ?? 0)}</TableCell>
                <TableCell className="text-right">{toMoney(totals?.totalPrice ?? 0)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Separator className="my-4" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            <div className="rounded-md border p-3">
              <div className="font-medium">Cost Breakdown</div>
              <div>Paper Cost: <b>{toMoney(totals?.paperCost ?? 0)}</b></div>
              <div>Finishing Cost: <b>{toMoney(totals?.finishingCost ?? 0)}</b></div>
              <div>Base (before margin): <b>{toMoney(totals?.baseBeforeMargin ?? 0)}</b></div>
            </div>
            <div className="rounded-md border p-3">
              <div className="font-medium">Margin & Discount</div>
              <div>Margin ({form.calculation.marginPercentage}%): <b>{toMoney(totals?.marginAmount ?? 0)}</b></div>
              <div>Subtotal: <b>{toMoney(totals?.subtotal ?? 0)}</b></div>
              <div>Discount: <b>- {toMoney(totals?.discountAmount ?? 0)}</b></div>
            </div>
            <div className="rounded-md border p-3">
              <div className="font-medium">Final</div>
              <div>Final Subtotal: <b>{toMoney(totals?.finalSubtotal ?? 0)}</b></div>
              <div>VAT (5%): <b>{toMoney(totals?.vatAmount ?? 0)}</b></div>
              <div className="text-base mt-1">Final Price: <b>{toMoney(totals?.totalPrice ?? 0)}</b></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download & Actions */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle>Download Options</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            <Button variant="default" disabled>Download Customer Copy</Button>
            <Button variant="secondary" disabled>Download Operations Copy</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            <Button variant="secondary">Save Draft</Button>
            <Button variant="outline">Send for Approval</Button>
            <Button variant="outline">Send to Customer</Button>
            <Button>Save Quote</Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => router.push("/csr/step-4")}>Previous</Button>
        <Button onClick={() => alert("Quote submitted (mock).")}>Submit Quote</Button>
      </div>
    </main>
  );
}
