import { Link, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/model/useAuth";

export function MainLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const avatarLetter =
    user?.name?.trim().charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";

  async function handleLogout() {
    await logout();
  }

  return (
    <div>
      <header className="app-header">
        <Link to="/" className="app-logo">
          d-weaver
        </Link>

        <nav className="app-nav">
          {isLoading ? null : isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={handleLogout}
                className="nav-button"
              >
                Вийти
              </button>

              <div className="user-avatar">{avatarLetter}</div>
            </>
          ) : (
            <>
              <Link to="/login">Вхід</Link>
              <Link to="/register">Реєстрація</Link>
            </>
          )}
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
