"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { sideBarItems } from "@/constants";
import { useState } from "react";

function cx(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(sideBarItems.map((i) => [i.label, true]))
  );

  const toggleGroup = (label: string) => {
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className="h-screen w-64 border-r border-gray-200 bg-gradient-to-b from-white to-gray-50 sticky top-0 flex flex-col shadow-sm"
      role="navigation"
      aria-label="Main sidebar navigation"
    >
      {/* Header */}
      <div className="px-5 py-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#27aae1] via-[#ea078b] to-[#fbec20] flex items-center justify-center">
            <span className="text-white font-bold text-sm">NR</span>
          </div>
          <h1 className="font-bold text-lg text-gray-900">Next.js Render Lab</h1>
        </div>
        <p className="text-xs text-gray-500 ml-10">CSR / SSR / ISR</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sideBarItems.map((group, groupIndex) => {
          const Icon = group.icon;
          const isOpen = open[group.label];
          const hasActiveChild = group.children.some(
            (child) =>
              pathname === child.href || pathname.startsWith(child.href)
          );

          return (
            <div key={group.label} className="mb-2">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.label)}
                className={cx(
                  "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "hover:bg-white hover:shadow-sm group",
                  hasActiveChild && "bg-white shadow-sm"
                )}
                aria-expanded={isOpen}
                aria-controls={`group-${groupIndex}`}
              >
                <div
                  className={cx(
                    "p-1.5 rounded-md transition-colors duration-200",
                    hasActiveChild
                      ? "bg-[#27aae1] text-white"
                      : "bg-gray-100 text-gray-600 group-hover:bg-[#27aae1]/10 group-hover:text-[#27aae1]"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.5} />
                </div>
                <span
                  className={cx(
                    "flex-1 text-sm font-semibold text-left transition-colors duration-200",
                    hasActiveChild ? "text-[#27aae1]" : "text-gray-700"
                  )}
                >
                  {group.label}
                </span>
                <ChevronDown
                  className={cx(
                    "h-4 w-4 transition-all duration-200 text-gray-400",
                    isOpen && "rotate-180 text-[#27aae1]"
                  )}
                />
              </button>

              {/* Children Links */}
              {isOpen && (
                <ul
                  id={`group-${groupIndex}`}
                  className="mt-1 pl-11 pr-2 space-y-0.5 animate-in slide-in-from-top-1 duration-200"
                >
                  {group.children.map((child) => {
                    const isActive =
                      pathname === child.href || pathname.startsWith(child.href);

                    return (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          prefetch={false}
                          className={cx(
                            "block text-sm px-3 py-2 rounded-md transition-all duration-200",
                            "relative overflow-hidden",
                            isActive
                              ? "bg-gradient-to-r from-[#27aae1] to-[#1f8bb8] text-white font-medium shadow-md"
                              : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm"
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#fbec20] rounded-r-full" />
                          )}
                          <span className={isActive ? "ml-1" : ""}>
                            {child.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Badge */}
      <div className="px-5 py-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-[#27aae1]" />
            <span className="w-2 h-2 rounded-full bg-[#ea078b]" />
            <span className="w-2 h-2 rounded-full bg-[#fbec20]" />
          </div>
          <span>Render Comparison Tool</span>
        </div>
      </div>
    </aside>
  );
}
