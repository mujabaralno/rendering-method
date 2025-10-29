"use client";
import React from "react";

export function StepIndicator({ active }: { active: 1|2|3|4|5 }) {
  const steps = ["Create A Quote","Customer Detail","Product Spec","Operational","Quotation"];
  return (
    <div className="flex items-center gap-6 mb-6">
      {steps.map((label, i) => {
        const idx = (i+1) as 1|2|3|4|5;
        const on = idx <= active;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className={`size-8 rounded-full grid place-items-center text-sm ${on ? "bg-sky-500 text-white" : "bg-gray-200"}`}>{idx}</div>
            <span className={`text-sm ${on ? "font-semibold" : "text-gray-500"}`}>{label}</span>
            {i < steps.length-1 && <div className="w-10 h-px bg-gray-300" />}
          </div>
        );
      })}
    </div>
  );
}
export default StepIndicator;
