import type { WorkspaceTabItem } from "./types";

interface WorkspaceTabsProps {
  tabs: WorkspaceTabItem[];
  activeKey: string;
  onTabChange: (key: string) => void;
}

export function WorkspaceTabs({ tabs, activeKey, onTabChange }: WorkspaceTabsProps) {
  return (
    <div className="flex items-center gap-6 border-b border-zinc-200">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`-mb-px border-b-2 px-0.5 pb-3 text-sm font-medium transition ${
              isActive
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
