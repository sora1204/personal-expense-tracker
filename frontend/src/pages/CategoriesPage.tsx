import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api/categories";
import { useAuth } from "../contexts/AuthContext";
import type { Category } from "../types/category";

export function CategoriesPage() {
  const { isAuthenticated, currentUser, logout } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      setError("カテゴリ一覧の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleCreateCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = newCategoryName.trim();

    if (!name) {
      setError("カテゴリ名を入力してください。");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const createdCategory = await createCategory({ name });
      setCategories((prevCategories) => [...prevCategories, createdCategory]);
      setNewCategoryName("");
    } catch {
      setError("カテゴリの作成に失敗しました。同じ名前のカテゴリがある可能性があります。");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(category: Category) {
    setEditingCategoryId(category.id);
    setEditingName(category.name);
    setError("");
  }

  function cancelEdit() {
    setEditingCategoryId(null);
    setEditingName("");
  }

  async function handleUpdateCategory(categoryId: number) {
    const name = editingName.trim();

    if (!name) {
      setError("カテゴリ名を入力してください。");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const updatedCategory = await updateCategory(categoryId, { name });

      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === categoryId ? updatedCategory : category
        )
      );

      setEditingCategoryId(null);
      setEditingName("");
    } catch {
      setError("カテゴリの更新に失敗しました。同じ名前のカテゴリがある可能性があります。");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCategory(categoryId: number) {
    const confirmed = window.confirm("このカテゴリを削除しますか？");

    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await deleteCategory(categoryId);

      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== categoryId)
      );
    } catch {
      setError("カテゴリの削除に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <section className="card wide-card">
        <div className="header-row">
          <div>
            <h1>Categories</h1>
            <p className="muted">
              {currentUser?.username} さんの支出カテゴリを管理します。
            </p>
          </div>

          <div className="button-row">
            <Link to="/dashboard" className="link-button">
              Dashboard
            </Link>
            <button type="button" className="secondary-button" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleCreateCategory} className="inline-form">
          <input
            type="text"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            placeholder="例: food, transport, book"
            maxLength={50}
          />
          <button type="submit" disabled={submitting}>
            Add
          </button>
        </form>

        {loading ? (
          <p className="muted">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="muted">まだカテゴリがありません。</p>
        ) : (
          <div className="list">
            {categories.map((category) => (
              <div key={category.id} className="list-item">
                {editingCategoryId === category.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      maxLength={50}
                    />

                    <div className="button-row">
                      <button
                        type="button"
                        onClick={() => handleUpdateCategory(category.id)}
                        disabled={submitting}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={cancelEdit}
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <strong>{category.name}</strong>
                      <p className="muted small-text">
                        ID: {category.id} / Created: {category.created_at}
                      </p>
                    </div>

                    <div className="button-row">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => startEdit(category)}
                        disabled={submitting}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={submitting}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}