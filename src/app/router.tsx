import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "@/app/layouts/MainLayout";
import { HomePage } from "@/pages/home/HomePage";
import { LoginPage } from "@/pages/login/LoginPage";
import { RegisterPage } from "@/pages/register/RegisterPage";
import { MaterialsPage } from "@/pages/materials/MaterialsPage";
import { LanguagePairSettingsPage } from "@/features/user-language-pairs/ui/LanguagePairSettingsPage";
import { MaterialLevelSelectPage } from "@/features/material-reading/ui/MaterialLevelSelectPage";
import { MaterialReadingPage } from "@/features/material-reading/ui/MaterialReadingPage";
import { AdminAiAnalysisPage } from "@/pages/admin-ai-analysis/AdminAiAnalysisPage";
import { AdminLanguagesPage } from "@/pages/admin-languages/AdminLanguagesPage";
import { Quizzes } from "@/pages/quizzes/Quizzes";
import { Quiz } from "@/pages/quiz/Quiz";
import { Dictionary } from "@/pages/dictionary/Dictionary";
import { AdminTemplatesPage } from "@/pages/admin-templates/AdminTemplatesPage";

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
        path: "admin/ai-analysis",
        element: <AdminAiAnalysisPage />,
      },
      {
        path: "admin/languages",
        element: <AdminLanguagesPage />,
      },
      {
        path: "admin/templates",
        element: <AdminTemplatesPage />,
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
      {
        path: "/materials/:materialId",
        element: <MaterialLevelSelectPage />,
      },
      {
        path: "/materials/:materialId/levels/:levelId",
        element: <MaterialReadingPage />,
      },
      {
        path: "/dictionary",
        element: <Dictionary />,
      },
      {
        path: "/quizzes",
        element: <Quizzes />,
      },
      {
        path: "/quizzes/:quizId",
        element: <Quiz />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
