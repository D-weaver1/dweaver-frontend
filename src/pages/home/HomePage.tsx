import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/model/useAuth";
import { useTranslation } from "react-i18next";

export function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  return (
    <section className="home-page">
      <h1>d-weaver</h1>
      <p>{t("home.title")}</p>

      <div className="home-page__buttons">
        {!isLoading && isAuthenticated && (
          <Link to="/materials" className="primary-button">
            {t("nav.startLearning")}
          </Link>
        )}
        {!isLoading && isAuthenticated && (
          <Link to="/quizzes" className="primary-button">
            {t("nav.startQuizzes")}
          </Link>
        )}
      </div>
    </section>
  );
}
