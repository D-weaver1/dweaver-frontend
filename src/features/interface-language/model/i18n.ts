import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  DEFAULT_INTERFACE_LANGUAGE,
  interfaceLanguageResources,
  supportedInterfaceLanguages,
} from "./interfaceLanguage.helpers";

void i18n.use(initReactI18next).init({
  resources: interfaceLanguageResources,

  lng: DEFAULT_INTERFACE_LANGUAGE,
  fallbackLng: DEFAULT_INTERFACE_LANGUAGE,

  supportedLngs: supportedInterfaceLanguages,

  ns: ["common"],
  defaultNS: "common",

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },
});

export default i18n;
