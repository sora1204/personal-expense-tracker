import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [username, setUsername] = useState("testuser");
  const [email, setEmail] = useState("test@example.com");
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
      await register({
        username,
        email,
        password,
      });

      navigate("/dashboard");
    } catch {
      setError("登録に失敗しました。すでに同じメールアドレスが使われている可能性があります。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Register</h1>
        <p className="muted">新しいアカウントを作成します。</p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              maxLength={50}
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
            {submitting ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="muted">
          すでにアカウントがある場合は <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}