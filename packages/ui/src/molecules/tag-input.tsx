"use client";

import {
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { X } from "lucide-react";

export interface TagInputProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  labels?: {
    tags: string;
    remove: (tag: string) => string;
  };
}

const defaultLabels = {
  tags: "Tags",
  remove: (tag: string) => `Remove ${tag}`,
};

function parseTags(value: string) {
  return value
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function TagInput({
  value,
  onValueChange,
  id,
  name,
  placeholder,
  disabled,
  labels = defaultLabels,
  ...aria
}: TagInputProps) {
  const generatedId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = id ?? generatedId;
  const [draft, setDraft] = useState("");

  function addTags(tags: string[], base = value) {
    const existing = new Set(base.map((tag) => tag.toLocaleLowerCase()));
    const next = [...base];
    for (const tag of tags) {
      const key = tag.toLocaleLowerCase();
      if (!existing.has(key)) {
        existing.add(key);
        next.push(tag);
      }
    }
    if (
      next.length !== value.length ||
      next.some((tag, index) => tag !== value[index])
    )
      onValueChange(next);
  }

  function commit() {
    addTags(parseTags(draft));
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit();
    } else if (event.key === "Backspace" && !draft && value.length) {
      onValueChange(value.slice(0, -1));
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text");
    if (!/[,\n]/.test(pasted)) return;
    event.preventDefault();
    addTags(parseTags(`${draft},${pasted}`));
    setDraft("");
  }

  return (
    <div
      ref={containerRef}
      className="np-tag-input"
      data-disabled={disabled || undefined}
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget)) commit();
      }}
    >
      {value.length > 0 && (
        <ul aria-label={labels.tags}>
          {value.map((tag) => (
            <li key={tag}>
              <span>{tag}</span>
              <button
                type="button"
                disabled={disabled}
                aria-label={labels.remove(tag)}
                onClick={() => {
                  addTags(
                    parseTags(draft),
                    value.filter((item) => item !== tag),
                  );
                  setDraft("");
                }}
              >
                <X size={13} aria-hidden="true" />
              </button>
              {name && <input type="hidden" name={name} value={tag} />}
            </li>
          ))}
        </ul>
      )}
      <input
        {...aria}
        id={inputId}
        type="text"
        value={draft}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
      />
    </div>
  );
}
