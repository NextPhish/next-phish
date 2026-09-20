"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type EditorJS from "@editorjs/editorjs";
import type { TaskDescription } from "@next-phish/shared";
import {
  descriptionToEditorBlocks,
  editorBlocksToDescription,
} from "./block-editor-values";

export interface BlockEditorHandle {
  save: () => Promise<TaskDescription | null>;
}

export const BlockEditor = forwardRef<
  BlockEditorHandle,
  {
    value: TaskDescription | null;
    onChange: (value: TaskDescription | null) => void;
    onBlur?: () => void;
    disabled?: boolean;
    locale?: "en" | "bg";
    id?: string;
    label: string;
    describedBy?: string;
    invalid?: boolean;
  }
>(function BlockEditor(
  {
    value,
    onChange,
    onBlur,
    disabled,
    locale = "en",
    id,
    label,
    describedBy,
    invalid,
  },
  ref,
) {
  const generatedId = useId().replaceAll(":", "");
  const holder = id ?? `block-editor-${generatedId}`;
  const editor = useRef<EditorJS | null>(null);
  const changeSequence = useRef(0);
  const [loadFailed, setLoadFailed] = useState(false);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
    valueRef.current = value;
  }, [onChange, value]);

  useImperativeHandle(
    ref,
    () => ({
      async save() {
        const instance = editor.current;
        if (!instance) return value;
        ++changeSequence.current;
        await instance.isReady;
        const output = await instance.saver.save();
        const description = editorBlocksToDescription(output.blocks);
        onChangeRef.current(description);
        return description;
      },
    }),
    [value],
  );

  useEffect(() => {
    let disposed = false;
    async function mount() {
      try {
        const [{ default: Editor }, { default: Header }, { default: List }] =
          await Promise.all([
            import("@editorjs/editorjs"),
            import("@editorjs/header"),
            import("@editorjs/list"),
          ]);
        if (disposed) return;
        editor.current = new Editor({
          holder,
          placeholder:
            locale === "bg" ? "Добавете описание…" : "Add a description…",
          minHeight: 120,
          data: { blocks: descriptionToEditorBlocks(valueRef.current) },
          i18n:
            locale === "bg"
              ? {
                  messages: {
                    ui: {
                      toolbar: {
                        toolbox: { Add: "Добавяне" },
                        converter: { "Convert to": "Преобразуване в" },
                      },
                      blockTunes: {
                        toggler: {
                          "Click to tune": "Настройки",
                          "or drag to move": "или плъзнете за преместване",
                        },
                      },
                    },
                    toolNames: {
                      Text: "Текст",
                      Heading: "Заглавие",
                      List: "Списък",
                    },
                    blockTunes: {
                      Delete: "Изтриване",
                      "Move up": "Преместване нагоре",
                      "Move down": "Преместване надолу",
                    },
                    tools: {
                      list: {
                        Unordered: "Неподреден",
                        Ordered: "Подреден",
                      },
                    },
                  },
                }
              : undefined,
          tools: {
            header: Header,
            list: { class: List, config: { maxLevel: 1 } },
          },
          onChange: async (instance) => {
            const sequence = ++changeSequence.current;
            try {
              const output = await instance.saver.save();
              if (!disposed && sequence === changeSequence.current)
                onChangeRef.current(editorBlocksToDescription(output.blocks));
            } catch {
              if (!disposed) setLoadFailed(true);
            }
          },
        });
        await editor.current.isReady;
      } catch {
        if (!disposed) setLoadFailed(true);
      }
    }
    void mount();
    return () => {
      disposed = true;
      const instance = editor.current;
      editor.current = null;
      if (instance)
        void instance.isReady
          .then(() => instance.destroy())
          .catch(() => undefined);
    };
  }, [holder, locale]);

  return (
    <>
      <div
        id={holder}
        // Editor.js cannot save in read-only mode. Block user interaction instead
        // so Formik can disable the form while the final save is being flushed.
        inert={disabled || undefined}
        aria-disabled={disabled || undefined}
        role="group"
        aria-label={label}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        onBlur={onBlur}
        className="min-h-40 rounded-xl border border-[var(--np-border)] bg-[var(--np-surface)] px-4 py-2 text-[var(--np-ink)] focus-within:border-[var(--np-primary)] [&_.ce-block__content]:max-w-none [&_.codex-editor__redactor]:pb-8! [&_.ce-header]:font-semibold [&_h1.ce-header]:text-3xl [&_h2.ce-header]:text-2xl [&_h3.ce-header]:text-xl [&_h4.ce-header]:text-lg [&_h5.ce-header]:text-base [&_h6.ce-header]:text-sm"
      />
      {loadFailed && (
        <p role="alert" className="mt-2 text-sm text-[var(--np-danger)]">
          {locale === "bg"
            ? "Редакторът не можа да се зареди. Опитайте отново."
            : "The editor could not load. Please try again."}
        </p>
      )}
    </>
  );
});
