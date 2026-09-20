"use client";

import { useRef } from "react";
import grapesjs, { type Editor } from "grapesjs";
import GjsEditor from "@grapesjs/react";
import newsletterPreset from "grapesjs-preset-newsletter";
import blocksBasic from "grapesjs-blocks-basic";
import blocksFlexbox from "grapesjs-blocks-flexbox";
import pluginForms from "grapesjs-plugin-forms";
import styleGradient from "grapesjs-style-gradient";
import grapesjsFonts from "@silexlabs/grapesjs-fonts";
import styles from "./grapes-editor.module.css";
import { buildEditorHtml, initialEditorHtml } from "./starter-content";

export type EditorMode = "email" | "page";

interface GrapesEditorProps {
  mode: EditorMode;
  initialDesign?: object;
  initialHtml?: string;
  onChange: (value: { html: string; design: unknown }) => void;
  onEditor?: (editor: Editor) => void;
  fontsApiKey?: string;
}

function buildHtml(editor: Editor) {
  const css = editor.getCss();
  const body = editor.getHtml();
  return buildEditorHtml(body, css ?? "");
}

function getPluginsConfig(mode: EditorMode, fontsApiKey?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plugins: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pluginsOpts: Record<string, any> = {};

  plugins.push(newsletterPreset);
  pluginsOpts[newsletterPreset as unknown as string] = {
    showBlocksOnLoad: true,
    showStylesOnChange: true,
  };

  plugins.push(styleGradient);
  plugins.push(blocksBasic);

  if (mode === "email") {
    plugins.push(pluginForms);
  } else {
    plugins.push(blocksFlexbox);
    plugins.push(pluginForms);

    if (fontsApiKey) {
      plugins.push(grapesjsFonts);
      pluginsOpts[grapesjsFonts as unknown as string] = {
        key: fontsApiKey,
        limit: 40,
      };
    }
  }

  return { plugins, pluginsOpts };
}

export function GrapesEditor({
  mode,
  initialDesign,
  initialHtml,
  onChange,
  onEditor,
  fontsApiKey,
}: GrapesEditorProps) {
  const initializedRef = useRef(false);

  const { plugins, pluginsOpts } = getPluginsConfig(mode, fontsApiKey);

  function handleEditor(editor: Editor) {
    if (!initializedRef.current) {
      if (initialDesign && Object.keys(initialDesign).length > 0) {
        editor.loadProjectData(
          initialDesign as Parameters<Editor["loadProjectData"]>[0],
        );
      } else {
        editor.setComponents(initialEditorHtml(mode, initialHtml));
      }

      initializedRef.current = true;
    }

    onEditor?.(editor);

    const sync = () => {
      onChange({
        html: buildHtml(editor),
        design: editor.getProjectData(),
      });
    };

    editor.on("update", sync);
    editor.on("destroy", () => {
      editor.off("update", sync);
    });
    sync();
  }

  return (
    <div className={styles.editor}>
      <div className={styles.surface}>
        <GjsEditor
          grapesjs={grapesjs}
          grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
          onEditor={handleEditor}
          options={{
            height: "100%",
            storageManager: false,
            noticeOnUnload: false,
            plugins,
            pluginsOpts,
          }}
        />
      </div>
    </div>
  );
}
