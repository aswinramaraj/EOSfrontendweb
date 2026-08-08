"use client";

import { useState } from "react";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { TextInput } from "@/shared/components/ui/TextInput";

const OTHER = "__other";

interface ItemNameSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
  hasError?: boolean;
}

/**
 * Preset dropdown + "Other (enter manually)" free-text fallback — matches
 * the design's SOP/POP/item-row pattern exactly. The underlying value is
 * always a plain string (preset label or custom text); "other mode" is
 * local UI state since an empty custom value can't be distinguished from
 * "nothing selected" by value alone.
 */
export function ItemNameSelect({ value, onChange, options, placeholder, hasError }: ItemNameSelectProps) {
  const [otherMode, setOtherMode] = useState(() => value !== "" && !options.includes(value));

  return (
    <div className="flex flex-col gap-2">
      <SelectInput
        hasError={hasError && !otherMode}
        value={otherMode ? OTHER : value}
        onChange={(e) => {
          if (e.target.value === OTHER) {
            setOtherMode(true);
            onChange("");
          } else {
            setOtherMode(false);
            onChange(e.target.value);
          }
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value={OTHER}>Other (enter manually)</option>
      </SelectInput>
      {otherMode && (
        <TextInput
          placeholder="Enter name manually"
          value={value}
          hasError={hasError}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
