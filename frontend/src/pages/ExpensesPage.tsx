import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { getCategories } from "../api/categories";
import {
  createExpense,
  deleteExpense,
  getCategorySummary,
  getExpenses,
  getMonthlySummary,
} from "../api/expenses";
import { useAuth } from "../contexts/AuthContext";
import type { Category } from "../types/category";
import type { CategorySummaryItem, Expense, MonthlySummary } from "../types/expense";

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function formatYen(amount: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ExpensesPage() {
  const { isAuthenticated, currentUser, logout } = useAuth();

  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(
    null
  );
  const [categorySummary, setCategorySummary] = useState<CategorySummaryItem[]>(
    []
  );

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [spentAt, setSpentAt] = useState(getTodayString());
  const [memo, setMemo] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  async function loadExpenseData() {
    setLoading(true);
    setError("");

    try {
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

      const nextMonthDate =
        month === 12
          ? `${year + 1}-01-01`
          : `${year}-${String(month + 1).padStart(2, "0")}-01`;

      const [expenseData, monthlyData, categorySummaryData] = await Promise.all([
        getExpenses({
          start_date: startDate,
          end_date: nextMonthDate,
          limit: 100,
        }),
        getMonthlySummary(year, month),
        getCategorySummary({
          start_date: startDate,
          end_date: nextMonthDate,
        }),
      ]);

      setExpenses(expenseData);
      setMonthlySummary(monthlyData);
      setCategorySummary(categorySummaryData);
    } catch {
      setError("支出データの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const categoryData = await getCategories();
      setCategories(categoryData);
    } catch {
      setError("カテゴリ一覧の取得に失敗しました。");
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadExpenseData();
  }, [year, month]);

  async function handleCreateExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const parsedAmount = Number(amount);
    const trimmedMemo = memo.trim();

    if (!trimmedTitle) {
      setError("タイトルを入力してください。");
      return;
    }

    if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
      setError("金額は1以上の整数で入力してください。");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createExpense({
        title: trimmedTitle,
        amount: parsedAmount,
        spent_at: spentAt,
        memo: trimmedMemo || null,
        category_id: categoryId ? Number(categoryId) : null,
      });

      setTitle("");
      setAmount("");
      setSpentAt(getTodayString());
      setMemo("");
      setCategoryId("");

      await loadExpenseData();
    } catch {
      setError("支出の作成に失敗しました。入力内容を確認してください。");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteExpense(expenseId: number) {
    const confirmed = window.confirm("この支出を削除しますか？");

    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await deleteExpense(expenseId);
      await loadExpenseData();
    } catch {
      setError("支出の削除に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  }

  function getCategoryName(expenseCategoryId: number | null) {
    if (expenseCategoryId === null) {
      return "カテゴリなし";
    }

    const category = categories.find((item) => item.id === expenseCategoryId);

    return category?.name ?? "不明なカテゴリ";
  }

  return (
    <main className="page">
      <section className="card wide-card">
        <div className="header-row">
          <div>
            <h1>Expenses</h1>
            <p className="muted">
              {currentUser?.username} さんの支出を管理します。
            </p>
          </div>

          <div className="button-row">
            <Link to="/dashboard" className="link-button">
              Dashboard
            </Link>
            <Link to="/categories" className="link-button">
              Categories
            </Link>
            <button type="button" className="secondary-button" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <section className="summary-grid">
          <div className="summary-card">
            <p className="muted">Selected Month</p>
            <div className="month-controls">
              <input
                type="number"
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
                min={1900}
                max={2100}
              />
              <select
                value={month}
                onChange={(event) => setMonth(Number(event.target.value))}
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (monthValue) => (
                    <option key={monthValue} value={monthValue}>
                      {monthValue}月
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="summary-card">
            <p className="muted">Monthly Total</p>
            <strong className="summary-amount">
              {monthlySummary ? formatYen(monthlySummary.total_amount) : "-"}
            </strong>
          </div>

          <div className="summary-card">
            <p className="muted">Expense Count</p>
            <strong className="summary-amount">{expenses.length}</strong>
          </div>
        </section>

        <section className="section-block">
          <h2>Add Expense</h2>

          <form onSubmit={handleCreateExpense} className="expense-form">
            <label>
              Title
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="例: lunch"
                maxLength={100}
                required
              />
            </label>

            <label>
              Amount
              <input
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="例: 850"
                min={1}
                required
              />
            </label>

            <label>
              Spent At
              <input
                type="date"
                value={spentAt}
                onChange={(event) => setSpentAt(event.target.value)}
                required
              />
            </label>

            <label>
              Category
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                <option value="">カテゴリなし</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="full-width">
              Memo
              <input
                type="text"
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                placeholder="任意メモ"
                maxLength={1000}
              />
            </label>

            <button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Expense"}
            </button>
          </form>
        </section>

        <section className="section-block">
          <h2>Category Summary</h2>

          {categorySummary.length === 0 ? (
            <p className="muted">この月のカテゴリ別支出はまだありません。</p>
          ) : (
            <div className="summary-list">
              {categorySummary.map((item) => (
                <div
                  key={item.category_id ?? "none"}
                  className="summary-list-item"
                >
                  <span>{item.category_name ?? "カテゴリなし"}</span>
                  <strong>{formatYen(item.total_amount)}</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="section-block">
          <h2>Expense List</h2>

          {loading ? (
            <p className="muted">Loading expenses...</p>
          ) : expenses.length === 0 ? (
            <p className="muted">この月の支出はまだありません。</p>
          ) : (
            <div className="list">
              {expenses.map((expense) => (
                <div key={expense.id} className="list-item expense-item">
                  <div>
                    <strong>{expense.title}</strong>
                    <p className="muted small-text">
                      {expense.spent_at} / {getCategoryName(expense.category_id)}
                    </p>
                    {expense.memo && (
                      <p className="muted small-text">{expense.memo}</p>
                    )}
                  </div>

                  <div className="expense-actions">
                    <strong>{formatYen(expense.amount)}</strong>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleDeleteExpense(expense.id)}
                      disabled={submitting}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}