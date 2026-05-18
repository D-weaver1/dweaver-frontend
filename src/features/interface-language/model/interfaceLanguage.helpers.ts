import ukCommon from "../locales/uk/common.json";
import enCommon from "../locales/en/common.json";

export const interfaceLanguageResources = {
  uk: {
    common: ukCommon,
  },
  en: {
    common: enCommon,
  },
} as const;

export type SupportedInterfaceLanguage =
  keyof typeof interfaceLanguageResources;

export const DEFAULT_INTERFACE_LANGUAGE: SupportedInterfaceLanguage = "en";

export const supportedInterfaceLanguages = Object.keys(
  interfaceLanguageResources,
) as SupportedInterfaceLanguage[];

function normalizeLanguageCode(languageCode: string): string {
  return languageCode.trim().replace("_", "-").toLowerCase();
}

export function resolveSupportedInterfaceLanguage(
  languageCode: string | null | undefined,
): SupportedInterfaceLanguage {
  if (!languageCode) {
    return DEFAULT_INTERFACE_LANGUAGE;
  }

  const normalizedCode = normalizeLanguageCode(languageCode);

  if (
    supportedInterfaceLanguages.includes(
      normalizedCode as SupportedInterfaceLanguage,
    )
  ) {
    return normalizedCode as SupportedInterfaceLanguage;
  }

  const baseLanguageCode = normalizedCode.split("-")[0];

  if (
    supportedInterfaceLanguages.includes(
      baseLanguageCode as SupportedInterfaceLanguage,
    )
  ) {
    return baseLanguageCode as SupportedInterfaceLanguage;
  }

  return DEFAULT_INTERFACE_LANGUAGE;
}
