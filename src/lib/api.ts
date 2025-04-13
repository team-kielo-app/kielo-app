import { selectAuthToken } from "../features/auth/authSlice";
import { store } from "../store/store"; // Be careful with direct store imports outside React components

const getAuthHeader = (): HeadersInit => {
  const token = selectAuthToken(store.getState()); // Get token from Redux state
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }
  return {
    "Content-Type": "application/json",
  };
};

// Generic fetch wrapper (example)
export const apiClient = {
  get: async <T>(url: string): Promise<T> => {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeader(),
    });
    if (!response.ok) {
      // More sophisticated error handling needed here
      const errorData = await response.text(); // or response.json() if error details are JSON
      console.error("API Error:", response.status, errorData);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorData}`
      );
    }
    return response.json() as Promise<T>;
  },

  // Add post, put, delete methods as needed
  // post: async <T>(url: string, data: any): Promise<T> => { ... }
};
