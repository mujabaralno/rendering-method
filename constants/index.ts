import { Earth, ServerCog, Clock } from "lucide-react";

export type SideBarChild = { label: string; href: string };
export type SideBarItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: SideBarChild[];
};

export const sideBarItems: SideBarItem[] = [
  {
    label: "CSR",
    icon: Earth,
    children: [
      { label: "Step-1", href: "/csr/step-1" },
      { label: "Step-2", href: "/csr/step-2" },
      { label: "Step-3", href: "/csr/step-3" },
      { label: "Step-4", href: "/csr/step-4" },
      { label: "Step-5", href: "/csr/step-5" },
    ],
  },
  {
    label: "SSR",
    icon: ServerCog,
    children: [
      { label: "Step-1", href: "/ssr/step-1" },
      { label: "Step-2", href: "/ssr/step-2" },
      { label: "Step-3", href: "/ssr/step-3" },
      { label: "Step-4", href: "/ssr/step-4" },
      { label: "Step-5", href: "/ssr/step-5" },
    ],
  },
  {
    label: "ISR",
    icon: Clock,
    children: [
      { label: "Step-1", href: "/isr/step-1" },
      { label: "Step-2", href: "/isr/step-2" },
      { label: "Step-3", href: "/isr/step-3" },
      { label: "Step-4", href: "/isr/step-4" },
      { label: "Step-5", href: "/isr/step-5" },
    ],
  },
];


export const UI_KEY = "sp_quote_ui";
export const FORM_KEY = "sp_quote_wip";