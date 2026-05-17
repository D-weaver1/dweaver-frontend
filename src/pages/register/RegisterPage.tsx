import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/model/useAuth";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await register({ name, email, password });
      navigate("/login");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Помилка реєстрації");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Реєстрація</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Імʼя
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Пароль
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Реєстрація..." : "Зареєструватися"}
          </button>
        </form>

        <p className="auth-link">
          Вже є акаунт? <Link to="/login">Увійти</Link>
        </p>
      </div>
    </section>
  );
}
