"use client";
import React from "react";
import { Check } from "lucide-react";

export function StepIndicator({ active }: { active: 1 | 2 | 3 | 4 | 5 }) {
  const steps = [
    { id: 1, label: "Create A Quote" },
    { id: 2, label: "Customer Detail" },
    { id: 3, label: "Product Spec" },
    { id: 4, label: "Operational" },
    { id: 5, label: "Quotation" },
  ];

  const getStepStatus = (stepId: number) => {
    if (stepId < active) return "completed";
    if (stepId === active) return "active";
    return "upcoming";
  };

  const getStepStyles = (status: string) => {
    switch (status) {
      case "completed":
        return {
          circle: "bg-[#27aae1] text-white border-[#27aae1] shadow-md",
          label: "text-gray-700 font-medium",
          connector: "bg-[#27aae1]",
        };
      case "active":
        return {
          circle: "bg-white text-[#27aae1] border-[#27aae1] border-2 shadow-lg ring-4 ring-[#27aae1]/20",
          label: "text-[#27aae1] font-bold",
          connector: "bg-gray-300",
        };
      case "upcoming":
        return {
          circle: "bg-white text-gray-400 border-gray-300 border",
          label: "text-gray-400",
          connector: "bg-gray-300",
        };
      default:
        return {
          circle: "",
          label: "",
          connector: "",
        };
    }
  };

  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between gap-2 md:gap-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const styles = getStepStyles(status);
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2 md:gap-3">
                {/* Step Circle */}
                <div
                  className={`
                    relative flex items-center justify-center
                    w-9 h-9 md:w-10 md:h-10 rounded-full
                    transition-all duration-300 ease-in-out
                    ${styles.circle}
                  `}
                  aria-current={status === "active" ? "step" : undefined}
                >
                  {status === "completed" ? (
                    <Check className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
                  ) : (
                    <span className="text-sm md:text-base font-semibold">
                      {step.id}
                    </span>
                  )}
                  
                  {/* Active indicator pulse */}
                  {status === "active" && (
                    <span className="absolute inset-0 rounded-full border-2 border-[#27aae1] animate-ping opacity-75" />
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`
                    text-xs md:text-sm whitespace-nowrap
                    transition-all duration-200
                    ${styles.label}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2 md:mx-4
                    transition-all duration-300
                    ${styles.connector}
                  `}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default StepIndicator;
