"use client";
import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type Step2Row = {
  id: string;
  productName: string;
  date: string;
  status: "Draft" | "Pending" | "Done";
  customerName: string;
};

export default function Step2ExistingQuoteTable({
  quotes,
  onSelectId,
}: {
  quotes: Step2Row[];
  onSelectId: (id: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = quotes.filter((q) =>
    [q.id, q.productName, q.customerName].some((f) =>
      f.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by quote ID, product, or customer"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((q) => (
            <TableRow key={q.id}>
              <TableCell className="font-mono">{q.id}</TableCell>
              <TableCell>{q.productName}</TableCell>
              <TableCell>{q.customerName}</TableCell>
              <TableCell>{q.date}</TableCell>
              <TableCell>
                <Badge variant={q.status === "Done" ? "default" : "secondary"}>{q.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" onClick={() => onSelectId(q.id)}>Select</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
