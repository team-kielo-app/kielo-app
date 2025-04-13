import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "./types";
import * as CokieLib from "../../lib/cookie";
import { RootState } from "../../store/store"; // Adjust path if needed

// --- Mock Data & API ---
// Replace with actual API calls later
const MOCK_USER: User = {
  id: "user-123",
  email: "test@kielo.app",
  name: "Test User",
};
const MOCK_TOKEN = "fake-jwt-token-12345";

const fetchUserFromApi = async (token: string): Promise<User> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user/${userId}`, { // Need userId or '/me' endpoint
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // if (!response.ok) throw new Error('Failed to fetch user');
  // return await response.json();
  console.log("Mock fetchUserFromApi called with token:", token);
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
  if (token === MOCK_TOKEN) {
    return MOCK_USER;
  }
  throw new Error("Invalid mock token");
};

const loginApi = async (
  email: string /* password */
): Promise<{ token: string; user: User }> => {
  // TODO: Replace with actual API call to your login endpoint
  console.log("Mock loginApi called with email:", email);
  await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay
  if (email === "test@kielo.app") {
    return { token: MOCK_TOKEN, user: MOCK_USER };
  }
  throw new Error("Invalid mock credentials");
};
// --- Async Thunks ---

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // In real app, send email and password
      const { token, user } = await loginApi(email, password);
      CokieLib.setTokenCookie(token);
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// Thunk to initialize auth state from cookie/storage
export const initializeAuth = createAsyncThunk<
  { token: string; user: User } | null, // Return type
  void, // Argument type (none)
  { state: RootState } // ThunkAPI config
>("auth/initializeAuth", async (_, { dispatch, getState, rejectWithValue }) => {
  const token = CokieLib.getTokenCookie();
  if (token) {
    // If we have a token, try to validate it by fetching user data
    try {
      // If user is already in state, maybe skip fetch unless validation needed
      const currentUser = getState().auth.user;
      if (currentUser && getState().auth.token === token) {
        console.log("User already in state, skipping fetch");
        return { token, user: currentUser };
      }

      console.log("Token found, fetching user data...");
      const user = await fetchUserFromApi(token); // Validate token by fetching user
      return { token, user };
    } catch (error) {
      console.error("Token validation failed:", error);
      dispatch(logoutUser()); // Clear invalid token/user state
      return rejectWithValue("Invalid token");
    }
  }
  return null; // No token found
});

// --- Slice Definition ---

const initialState: AuthState = {
  user: null,
  token: null, // Initially check cookie/storage
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      CokieLib.removeTokenCookie();
    },
    // Optional: Set token directly if needed elsewhere
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      if (!action.payload) {
        state.user = null; // Clear user if token is cleared
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
      })
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        // Optional: set a specific status like 'initializing'
        // state.status = 'loading';
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.status = "succeeded"; // Or 'idle' if preferred after init
        } else {
          // No token found or validation failed and logout was dispatched
          state.status = "idle";
        }
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        // Failed to initialize (e.g., fetch user failed)
        state.status = "failed";
        state.error = action.payload as string;
        // Ensure user/token are null if init fails hard
        state.user = null;
        state.token = null;
        CokieLib.removeTokenCookie(); // Ensure cookie is removed on validation fail
      });
  },
});

export const { logoutUser, setToken, clearAuthError } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state: RootState): boolean =>
  !!state.auth.token;
export const selectUser = (state: RootState): User | null => state.auth.user;
export const selectAuthToken = (state: RootState): string | null =>
  state.auth.token;
export const selectAuthStatus = (state: RootState): AuthState["status"] =>
  state.auth.status;
export const selectAuthError = (state: RootState): string | null =>
  state.auth.error;

export default authSlice.reducer;

