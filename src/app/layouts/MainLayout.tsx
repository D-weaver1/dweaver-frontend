import { Link, Outlet } from "react-router-dom";

export function MainLayout() {
  return (
    <div>
      <header className="app-header">
        <Link to="/" className="app-logo">
          d-weaver
        </Link>

        <nav className="app-nav">
          <Link to="/login">Вхід</Link>
          <Link to="/register">Реєстрація</Link>
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
