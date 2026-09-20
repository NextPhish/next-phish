import type { PageFormValues } from "../../types/page-form.types";

export type PageSettingsValues = Omit<PageFormValues, "name">;
