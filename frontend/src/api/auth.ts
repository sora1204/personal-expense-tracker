import { apiClient } from "./client";
import type { LoginRequest, RegisterRequest, TokenResponse } from "../types/auth";
import type { User } from "../types/user";

export async function registerUser(data: RegisterRequest): Promise<User> {
  const response = await apiClient.post<User>("/auth/register", data);
  return response.data;
}

export async function loginUser(data: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>("/auth/login", data);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>("/users/me");
  return response.data;
}