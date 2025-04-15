// src/features/auth/authReducer.ts
import * as actionTypes from "./authActionTypes";
import { AuthState } from "./types";
import { AuthAction } from "./authActionTypes";

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  expiresAt: null,
  status: "idle",
  error: null,
};

const authReducer = (state = initialState, action: AuthAction): AuthState => {
  switch (action.type) {
    // Login Request States
    case actionTypes.LOGIN_REQUEST:
    case actionTypes.SOCIAL_LOGIN_REQUEST:
      return {
        ...state,
        status: "loading",
        error: null,
      };

    case actionTypes.SET_INITIAL_TOKENS: // Add this case
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt,
        status: "loading", // Keep status as loading while we validate
        error: null,
      };

    // Modify INITIALIZE_AUTH_REQUEST to also set status to loading
    case actionTypes.INITIALIZE_AUTH_REQUEST:
      return {
        ...state,
        status: "loading",
        error: null,
      };

    // Login Success States
    case actionTypes.LOGIN_SUCCESS:
    case actionTypes.SOCIAL_LOGIN_SUCCESS:
      // Login implies initialization is complete (or wasn't needed)
      return {
        ...state,
        status: "succeeded",
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt,
        error: null,
      };

    // Login Failure States
    case actionTypes.LOGIN_FAILURE:
    case actionTypes.SOCIAL_LOGIN_FAILURE:
      // Failed login also means initialization check is done (it failed)
      return {
        ...initialState, // Reset other state
        status: "failed",
        error: action.payload,
      };
    case actionTypes.INITIALIZE_AUTH_FAILURE:
      // Explicitly handle init failure
      return {
        ...initialState,
        status: "failed",
        error: action.payload,
      };

    // Initialize Auth Success
    case actionTypes.INITIALIZE_AUTH_SUCCESS:
      return {
        ...state, // Keep potential intermediate state if needed? Or reset? Let's keep.
        status: "succeeded",
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt,
        error: null,
      };

    // Handle Token Refresh Success
    case actionTypes.SET_REFRESHED_TOKENS:
      // Refresh implies initialization was already done
      return {
        ...state,
        token: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt,
        status: "succeeded",
        error: null,
      };

    // Logout
    case actionTypes.LOGOUT_USER:
      return {
        ...initialState,
        status: "failed",
      };

    // Clear Error
    case actionTypes.CLEAR_AUTH_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

export default authReducer;

