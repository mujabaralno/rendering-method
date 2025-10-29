"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QuoteFormData, PaperOption } from "@/types";

type Client = QuoteFormData["client"];

export default function Step2CustomerForm({
  value,
  onChange,
  paperOptions, // opsional untuk kebutuhan selanjutnya
}: {
  value: Client;
  onChange: (c: Client) => void;
  paperOptions?: PaperOption[];
}) {
  const set = (k: keyof Client, v: string | boolean | undefined) =>
    onChange({ ...value, [k]: v as any });

  return (
    <div className="grid gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Client Type</Label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={value.clientType}
            onChange={(e) => set("clientType", e.target.value as Client["clientType"])}
          >
            <option value="Company">Company</option>
            <option value="Individual">Individual</option>
          </select>
        </div>
        <div>
          <Label>Contact Person</Label>
          <Input value={value.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} />
        </div>
      </div>

      {value.clientType === "Company" ? (
        <div>
          <Label>Company</Label>
          <Input value={value.companyName} onChange={(e) => set("companyName", e.target.value)} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>First Name</Label>
            <Input value={value.firstName ?? ""} onChange={(e) => set("firstName", e.target.value)} />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input value={value.lastName ?? ""} onChange={(e) => set("lastName", e.target.value)} />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <Input value={value.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={value.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label>Country Code</Label>
          <Input value={value.countryCode} onChange={(e) => set("countryCode", e.target.value)} />
        </div>
        <div>
          <Label>Role</Label>
          <Input value={value.role} onChange={(e) => set("role", e.target.value)} />
        </div>
        <div>
          <Label>TRN</Label>
          <Input value={value.trn ?? ""} onChange={(e) => set("trn", e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Address</Label>
        <Input value={value.address ?? ""} onChange={(e) => set("address", e.target.value)} />
      </div>
    </div>
  );
}
