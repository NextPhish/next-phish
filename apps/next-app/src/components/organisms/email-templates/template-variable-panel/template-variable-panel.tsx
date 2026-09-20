"use client";

import { useTemplateVariables } from "./hooks/use-template-variables";
import { TemplateVariablePanelView } from "./parts/template-variable-panel-view";

export function TemplateVariablePanel() {
  return <TemplateVariablePanelView {...useTemplateVariables()} />;
}
