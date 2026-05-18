import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "@/app/layouts/MainLayout";
import { HomePage } from "@/pages/home/HomePage";
import { LoginPage } from "@/pages/login/LoginPage";
import { RegisterPage } from "@/pages/register/RegisterPage";
import { MaterialsPage } from "@/pages/materials/MaterialsPage";
import { LanguagePairSettingsPage } from "@/features/user-language-pairs/ui/LanguagePairSettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "materials",
        element: <MaterialsPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "/settings/language-pairs",
        element: <LanguagePairSettingsPage />,
      },
    ],
  },
]);
