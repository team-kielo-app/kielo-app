export interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

export interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
