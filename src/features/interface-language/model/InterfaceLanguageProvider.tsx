import { useEffect, type ReactNode } from "react";
import { useLanguagePair } from "@/features/user-language-pairs/model/useLanguagePair";
import i18n from "./i18n";
import { resolveSupportedInterfaceLanguage } from "./interfaceLanguage.helpers";

type InterfaceLanguageProviderProps = {
  children: ReactNode;
};

export function InterfaceLanguageProvider({
  children,
}: InterfaceLanguageProviderProps) {
  const { currentLanguagePair, isLoading } = useLanguagePair();

  const sourceLanguageCode = currentLanguagePair?.sourceLanguage?.code ?? null;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const nextInterfaceLanguage =
      resolveSupportedInterfaceLanguage(sourceLanguageCode);

    const currentInterfaceLanguage = i18n.resolvedLanguage ?? i18n.language;

    if (currentInterfaceLanguage !== nextInterfaceLanguage) {
      void i18n.changeLanguage(nextInterfaceLanguage);
    }
  }, [isLoading, sourceLanguageCode]);

  return <>{children}</>;
}
