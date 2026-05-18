import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AuthProvider } from "../features/auth/model/AuthProvider";
import { LanguagePairProvider } from "../features/user-language-pairs/model/LanguagePairProvider";
import { InterfaceLanguageProvider } from "@/features/interface-language/model/InterfaceLanguageProvider";

const queryClient = new QueryClient();

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguagePairProvider>
          <InterfaceLanguageProvider>{children}</InterfaceLanguageProvider>
        </LanguagePairProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
