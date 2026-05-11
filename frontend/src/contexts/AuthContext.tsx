import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser, loginUser, registerUser } from "../api/auth";
import type { LoginRequest, RegisterRequest } from "../types/auth";
import type { User } from "../types/user";

type AuthContextValue = {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = currentUser !== null;

  useEffect(() => {
    async function loadCurrentUser() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch {
        localStorage.removeItem("access_token");
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  async function login(data: LoginRequest) {
    const tokenResponse = await loginUser(data);
    localStorage.setItem("access_token", tokenResponse.access_token);

    const user = await getCurrentUser();
    setCurrentUser(user);
  }

  async function register(data: RegisterRequest) {
    await registerUser(data);
    await login({
      email: data.email,
      password: data.password,
    });
  }

  function logout() {
    localStorage.removeItem("access_token");
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}