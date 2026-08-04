"use client";

import { useState } from "react";
import type { FeesTabItem } from "../types";

interface FeesTabsProps {
  tabs: FeesTabItem[];
  defaultTabKey?: string;
  activeKey?: string;
  onTabChange?: (key: string) => void;
}

export function FeesTabs({ tabs, defaultTabKey, activeKey: controlledKey, onTabChange }: FeesTabsProps) {
  const [internalKey, setInternalKey] = useState(defaultTabKey ?? tabs[0]?.key);
  const activeKey = controlledKey ?? internalKey;

  function handleSelect(key: string) {
    setInternalKey(key);
    onTabChange?.(key);
  }

  return (
    <div className="flex items-center gap-6 border-b" style={{ borderColor: "var(--border-subtle)" }}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleSelect(tab.key)}
            className={`-mb-px border-b-2 px-0.5 pb-3 text-[13px] font-medium transition ${
              isActive
                ? "border-[var(--c-primary-600)] text-[var(--c-primary-600)]"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
