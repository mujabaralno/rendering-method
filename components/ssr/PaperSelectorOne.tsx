"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PaperOption } from "@/types";
import { Trash2, Plus } from "lucide-react";

export default function PaperSelectorOne({
  papers,
  initialPaperId,
  inputName = "paperId",
}: {
  papers: PaperOption[];
  initialPaperId?: string;
  inputName?: string; // harus "paperId" agar server action kamu tetap bekerja
}) {
  const [paperId, setPaperId] = useState<string>(initialPaperId ?? "");

  if (!paperId) {
    return (
      <div className="space-y-3">
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <p className="text-sm">No paper selected yet</p>
          <p className="text-xs">Click the button below to add paper</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setPaperId(papers[0]?.id ?? "")}
          className="w-full text-[#27aae1] border-[#27aae1] hover:bg-[#27aae1] hover:text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Paper
        </Button>
        {/* tetap kirim hidden input kosong agar server action aman */}
        <input type="hidden" name={inputName} value="" />
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-end p-3 bg-gray-50 rounded-lg">
      <div className="flex-1 space-y-2">
        <label className="text-sm">Paper 1</label>
        <Select
          value={paperId}
          onValueChange={(id) => setPaperId(id)}
        >
          <SelectTrigger className="focus:border-[#27aae1] focus:ring-[#27aae1]">
            <SelectValue placeholder="Select paper" />
          </SelectTrigger>
          <SelectContent>
            {papers.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.material} — {o.gsm} gsm
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setPaperId("")}
        className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* hidden input yang dibaca server action */}
      <input type="hidden" name={inputName} value={paperId} />
    </div>
  );
}
