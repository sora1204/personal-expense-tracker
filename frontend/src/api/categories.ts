import { apiClient } from "./client";
import type {
  Category,
  CategoryCreateRequest,
  CategoryUpdateRequest,
} from "../types/category";

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>("/categories");
  return response.data;
}

export async function createCategory(
  data: CategoryCreateRequest
): Promise<Category> {
  const response = await apiClient.post<Category>("/categories", data);
  return response.data;
}

export async function updateCategory(
  categoryId: number,
  data: CategoryUpdateRequest
): Promise<Category> {
  const response = await apiClient.put<Category>(`/categories/${categoryId}`, data);
  return response.data;
}

export async function deleteCategory(categoryId: number): Promise<void> {
  await apiClient.delete(`/categories/${categoryId}`);
}