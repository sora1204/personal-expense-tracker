export type Expense = {
  id: number;
  title: string;
  amount: number;
  spent_at: string;
  memo: string | null;
  category_id: number | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
};

export type ExpenseCreateRequest = {
  title: string;
  amount: number;
  spent_at: string;
  memo?: string | null;
  category_id?: number | null;
};

export type ExpenseUpdateRequest = {
  title?: string;
  amount?: number;
  spent_at?: string;
  memo?: string | null;
  category_id?: number | null;
};

export type MonthlySummary = {
  year: number;
  month: number;
  total_amount: number;
};

export type CategorySummaryItem = {
  category_id: number | null;
  category_name: string | null;
  total_amount: number;
};

export type GetExpensesParams = {
  start_date?: string;
  end_date?: string;
  category_id?: number;
  skip?: number;
  limit?: number;
};