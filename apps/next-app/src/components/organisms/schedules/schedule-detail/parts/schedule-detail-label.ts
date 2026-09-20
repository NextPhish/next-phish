import type { TranslationFunction } from "@/src/lib/i18n/shared";

export function enumLabel(t: TranslationFunction, value: string): string {
  return t(`scheduleUi.values.${value}`);
}
