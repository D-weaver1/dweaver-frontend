import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AuthProvider } from "../features/auth/model/AuthProvider";
import { LanguagePairProvider } from "../features/user-language-pairs/model/LanguagePairProvider";

const queryClient = new QueryClient();

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguagePairProvider>{children}</LanguagePairProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
