import { Check } from "lucide-react";

const steps = [
  { id: 1, label: "Create A Quote" },
  { id: 2, label: "Customer Detail" },
  { id: 3, label: "Product Spec" },
  { id: 4, label: "Operational" },
  { id: 5, label: "Quotation" },
];

const statusStyles = {
  completed: {
    circle: "bg-[#27aae1] text-white border-[#27aae1] shadow-md",
    label: "text-gray-700 font-medium",
    connector: "bg-[#27aae1]",
  },
  active: {
    circle:
      "bg-white text-[#27aae1] border-[#27aae1] border-2 shadow-lg ring-4 ring-[#27aae1]/20",
    label: "text-[#27aae1] font-bold",
    connector: "bg-gray-300",
  },
  upcoming: {
    circle: "bg-white text-gray-400 border-gray-300 border",
    label: "text-gray-400",
    connector: "bg-gray-200",
  },
} as const;

type Props = {
  active: 1 | 2 | 3 | 4 | 5;
};

const getStatus = (active: number, stepId: number) => {
  if (stepId < active) return "completed";
  if (stepId === active) return "active";
  return "upcoming";
};

const StepIndicator = ({ active }: Props) => (
  <nav aria-label="Progress" className="w-full">
    <ol className="flex items-center justify-between gap-2 md:gap-4">
      {steps.map((step, index) => {
        const status = getStatus(active, step.id);
        const styles = statusStyles[status as keyof typeof statusStyles];
        const isLast = index === steps.length - 1;

        return (
          <li key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 md:gap-3">
              <div
                className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ease-in-out md:h-10 md:w-10 ${styles.circle}`}
                aria-current={status === "active" ? "step" : undefined}
              >
                {status === "completed" ? (
                  <Check className="h-5 w-5 md:h-6 md:w-6" strokeWidth={3} />
                ) : (
                  <span className="text-sm font-semibold md:text-base">
                    {step.id}
                  </span>
                )}

                {status === "active" && (
                  <span className="absolute inset-0 rounded-full border-2 border-[#27aae1] opacity-75 ring-4 ring-[#27aae1]/40" />
                )}
              </div>

              <span
                className={`text-xs transition-all duration-200 md:text-sm ${styles.label}`}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <div
                className={`mx-2 h-0.5 flex-1 transition-all duration-300 md:mx-4 ${styles.connector}`}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default StepIndicator;

