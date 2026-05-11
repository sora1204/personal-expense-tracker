import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function DashboardPage() {
  const { currentUser, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="page">
      <section className="card">
        <div className="header-row">
          <div>
            <h1>Dashboard</h1>
            <p className="muted">ログイン中ユーザー情報を表示しています。</p>
          </div>

          <button type="button" className="secondary-button" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="user-box">
          <p>
            <strong>ID:</strong> {currentUser?.id}
          </p>
          <p>
            <strong>Username:</strong> {currentUser?.username}
          </p>
          <p>
            <strong>Email:</strong> {currentUser?.email}
          </p>
          <p>
            <strong>Created at:</strong> {currentUser?.created_at}
          </p>
        </div>

        <p className="muted">
          次のStepで、ここに支出一覧・作成フォーム・集計カードを追加します。
        </p>
      </section>
    </main>
  );
}