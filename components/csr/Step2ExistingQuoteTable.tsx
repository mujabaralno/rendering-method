"use client";
import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

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

  const getStatusStyle = (status: Step2Row["status"]) => {
    if (status === "Done") return "bg-[#27aae1] text-white";
    if (status === "Pending") return "bg-[#fbec20] text-gray-900";
    return "bg-gray-200 text-gray-700";
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by quote ID, product, or customer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="text-sm text-gray-600">
        Showing {filtered.length} of {quotes.length} quotes
      </div>

      <div className="border rounded-lg overflow-hidden">
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No quotes found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((q) => (
                <TableRow key={q.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-sm">#{q.id}</TableCell>
                  <TableCell className="font-medium">{q.productName}</TableCell>
                  <TableCell>{q.customerName}</TableCell>
                  <TableCell className="text-sm text-gray-600">{q.date}</TableCell>
                  <TableCell>
                    <Badge className={getStatusStyle(q.status)}>{q.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => onSelectId(q.id)}
                      className="bg-[#27aae1] hover:bg-[#1f8bb8] text-white"
                    >
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
