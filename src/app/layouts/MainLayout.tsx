import { useEffect, useRef, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/model/useAuth";
import { LanguagePairSelect } from "@/features/user-language-pairs/ui/LanguagePairSelect";
import { useTranslation } from "react-i18next";

export function MainLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const avatarLetter =
    user?.name?.trim().charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";
  const { t } = useTranslation();
  async function handleLogout() {
    setIsProfileMenuOpen(false);
    await logout();
  }

  function toggleProfileMenu() {
    setIsProfileMenuOpen((prev) => !prev);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div>
      <header className="app-header">
        <Link to="/" className="app-logo">
          d-weaver
        </Link>

        <nav className="app-nav">
          {isLoading ? null : isAuthenticated ? (
            <>
              <LanguagePairSelect />

              <div className="profile-menu" ref={profileMenuRef}>
                <button
                  type="button"
                  className="user-avatar-button"
                  onClick={toggleProfileMenu}
                  aria-label={t("profile.openProfileMenu")}
                  aria-expanded={isProfileMenuOpen}
                >
                  {avatarLetter}
                </button>

                {isProfileMenuOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-info">
                      <div className="profile-dropdown-name">
                        {user?.name || t("profile.user")}
                      </div>

                      {user?.email && (
                        <div className="profile-dropdown-email">
                          {user.email}
                        </div>
                      )}
                    </div>

                    <Link
                      to="/settings/language-pairs"
                      className="profile-dropdown-button"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      {t("profile.settings")}
                    </Link>

                    <button
                      type="button"
                      className="profile-dropdown-button"
                      onClick={handleLogout}
                    >
                      {t("auth.logout")}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Registration</Link>
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
