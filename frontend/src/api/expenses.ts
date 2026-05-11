import { apiClient } from "./client";
import type {
  CategorySummaryItem,
  Expense,
  ExpenseCreateRequest,
  ExpenseUpdateRequest,
  GetExpensesParams,
  MonthlySummary,
} from "../types/expense";

export async function getExpenses(
  params?: GetExpensesParams
): Promise<Expense[]> {
  const response = await apiClient.get<Expense[]>("/expenses", {
    params,
  });

  return response.data;
}

export async function createExpense(
  data: ExpenseCreateRequest
): Promise<Expense> {
  const response = await apiClient.post<Expense>("/expenses", data);
  return response.data;
}

export async function getExpense(expenseId: number): Promise<Expense> {
  const response = await apiClient.get<Expense>(`/expenses/${expenseId}`);
  return response.data;
}

export async function updateExpense(
  expenseId: number,
  data: ExpenseUpdateRequest
): Promise<Expense> {
  const response = await apiClient.put<Expense>(`/expenses/${expenseId}`, data);
  return response.data;
}

export async function deleteExpense(expenseId: number): Promise<void> {
  await apiClient.delete(`/expenses/${expenseId}`);
}

export async function getMonthlySummary(
  year: number,
  month: number
): Promise<MonthlySummary> {
  const response = await apiClient.get<MonthlySummary>(
    "/expenses/summary/monthly",
    {
      params: {
        year,
        month,
      },
    }
  );

  return response.data;
}

export async function getCategorySummary(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<CategorySummaryItem[]> {
  const response = await apiClient.get<CategorySummaryItem[]>(
    "/expenses/summary/by-category",
    {
      params,
    }
  );

  return response.data;
}