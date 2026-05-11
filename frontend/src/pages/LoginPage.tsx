import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("test2@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login({
        email,
        password,
      });

      navigate("/dashboard");
    } catch {
      setError("ログインに失敗しました。メールアドレスまたはパスワードを確認してください。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Login</h1>
        <p className="muted">Personal Expense Tracker にログインします。</p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
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
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="muted">
          アカウントがない場合は <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}