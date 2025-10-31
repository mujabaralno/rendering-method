"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

export default function CopyFlatToCloseButton({
  formId = "product-spec-form",
}: { formId?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        const root = document.getElementById(formId) as HTMLFormElement | null;
        if (!root) return;
        const flatW = root.querySelector<HTMLInputElement>('input[name="flatWidth"]');
        const flatH = root.querySelector<HTMLInputElement>('input[name="flatHeight"]');
        const closeW = root.querySelector<HTMLInputElement>('input[name="closeWidth"]');
        const closeH = root.querySelector<HTMLInputElement>('input[name="closeHeight"]');
        if (flatW && closeW) closeW.value = flatW.value;
        if (flatH && closeH) closeH.value = flatH.value;
      }}
      className="text-[#27aae1] border-[#27aae1] hover:bg-[#27aae1] hover:text-white"
    >
      <Copy className="h-4 w-4 mr-2" />
      Copy flat size to close size
    </Button>
  );
}
