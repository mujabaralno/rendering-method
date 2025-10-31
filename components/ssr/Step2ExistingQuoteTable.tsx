"use client";

import { useMemo, useState } from "react";
import type { QuoteTemplate } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import { Search } from "lucide-react";

/**
 * UI parity dengan CSR/Step2ExistingQuoteTable:
 * - Search di atas tabel
 * - "Showing X of Y quotes"
 * - Badge status & tombol Select (warna Azure)
 * - Row hover
 *
 * onSelect adalah Server Action (dibawa dari page.tsx)
 */
export default function Step2ExistingQuoteTable({
  templates,
  selectedId,
  onSelect,
}: {
  templates: QuoteTemplate[];
  selectedId?: string;
  onSelect: (formData: FormData) => Promise<void>; // server action
}) {
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const kw = search.toLowerCase();
    return templates.filter((t) => {
      const id = t.id ?? "";
      const product = t.productsSnapshot?.[0]?.productName ?? "";
      const customer = t.customerName ?? "";
      return [id, product, customer].some((v) => v.toLowerCase().includes(kw));
    });
  }, [search, templates]);

  const getStatusStyle = (status: QuoteTemplate["status"]) => {
    if (status === "Done") return "bg-[#27aae1] text-white";
    if (status === "Pending") return "bg-[#fbec20] text-gray-900";
    return "bg-gray-200 text-gray-700";
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by quote ID, product, or customer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="text-sm text-gray-600">
        Showing {rows.length} of {templates.length} quotes
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                  No quotes found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((t) => {
                const isSelected = t.id === selectedId;
                return (
                  <TableRow
                    key={t.id}
                    className={isSelected ? "bg-[#27aae1]/5" : "hover:bg-gray-50"}
                  >
                    <TableCell className="font-mono text-sm">{`#${t.id}`}</TableCell>
                    <TableCell className="font-medium">
                      {t.productsSnapshot?.[0]?.productName ?? "-"}
                    </TableCell>
                    <TableCell>{t.customerName}</TableCell>
                    <TableCell className="text-sm text-gray-600">{t.date}</TableCell>
                    <TableCell>
                      <Badge className={getStatusStyle(t.status as any)}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={onSelect}>
                        <input type="hidden" name="templateId" value={t.id} />
                        <Button
                          type="submit"
                          size="sm"
                          className={
                            isSelected
                              ? "bg-[#27aae1] text-white hover:bg-[#1f8bb8]"
                              : "border-[#27aae1] text-[#27aae1] hover:bg-[#27aae1] hover:text-white"
                          }
                          variant={isSelected ? "default" : "outline"}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
