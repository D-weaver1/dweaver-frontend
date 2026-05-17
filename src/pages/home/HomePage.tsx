import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/model/useAuth";

export function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <section className="home-page">
      <h1>d-weaver</h1>
      <p>Головна сторінка</p>

      {!isLoading && isAuthenticated && (
        <Link to="/materials" className="primary-button">
          Почати навчання
        </Link>
      )}
    </section>
  );
}
