import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import * as actionTypes from "./authActionTypes";
import { AuthState, User, LoginResponse, SocialLoginPayload } from "./types"; // Ensure LoginResponse has user if backend updated
import { apiClient } from "@lib/api"; // Use alias
import * as CookieLib from "@lib/cookie"; // Use alias
import { RootState, AppDispatch } from "@store/store"; // Use alias

type AuthThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;

// --- Sync Action Creators (No change needed) ---
// ... loginRequest, loginSuccess, loginFailure etc. ...
export const loginRequest = (): actionTypes.LoginRequestAction => ({
  type: actionTypes.LOGIN_REQUEST,
});
export const loginSuccess = (
  payload: actionTypes.LoginSuccessAction["payload"]
): actionTypes.LoginSuccessAction => ({
  type: actionTypes.LOGIN_SUCCESS,
  payload,
});
export const loginFailure = (
  error: string
): actionTypes.LoginFailureAction => ({
  type: actionTypes.LOGIN_FAILURE,
  payload: error,
});

export const socialLoginRequest = (): actionTypes.SocialLoginRequestAction => ({
  type: actionTypes.SOCIAL_LOGIN_REQUEST,
});
export const socialLoginSuccess = (
  payload: actionTypes.SocialLoginSuccessAction["payload"]
): actionTypes.SocialLoginSuccessAction => ({
  type: actionTypes.SOCIAL_LOGIN_SUCCESS,
  payload,
});
export const socialLoginFailure = (
  error: string
): actionTypes.SocialLoginFailureAction => ({
  type: actionTypes.SOCIAL_LOGIN_FAILURE,
  payload: error,
});
export const initializeAuthRequest =
  (): actionTypes.InitializeAuthRequestAction => ({
    type: actionTypes.INITIALIZE_AUTH_REQUEST,
  });
export const initializeAuthSuccess = (
  payload: actionTypes.InitializeAuthSuccessAction["payload"]
): actionTypes.InitializeAuthSuccessAction => ({
  type: actionTypes.INITIALIZE_AUTH_SUCCESS,
  payload,
});
export const initializeAuthFailure = (
  error: string
): actionTypes.InitializeAuthFailureAction => ({
  type: actionTypes.INITIALIZE_AUTH_FAILURE,
  payload: error,
});
export const setRefreshedTokens = (
  payload: actionTypes.SetRefreshedTokensAction["payload"]
): actionTypes.SetRefreshedTokensAction => ({
  type: actionTypes.SET_REFRESHED_TOKENS,
  payload,
});
export const logoutUser = (): actionTypes.LogoutUserAction => {
  CookieLib.removeTokensCookie();
  return { type: actionTypes.LOGOUT_USER };
};
export const clearAuthError = (): actionTypes.ClearAuthErrorAction => ({
  type: actionTypes.CLEAR_AUTH_ERROR,
});

// --- Async Thunk Action Creators (Updated) ---

export const loginUserThunk =
  (credentials: {
    email: string;
    password: string;
  }): AuthThunk<Promise<void>> =>
  async (dispatch: AppDispatch) => {
    dispatch(loginRequest());
    try {
      // Assume loginData now contains the user object from the backend
      const loginData = await apiClient.post<LoginResponse>(
        "/auth/login/email",
        credentials,
        dispatch
      );

      // REMOVED: No need to call /auth/me here
      // const user = await apiClient.get<User>('/auth/me', dispatch);

      const expiresAt = Date.now() + loginData.expires_in * 1000;
      CookieLib.setTokensCookie(
        loginData.access_token,
        loginData.refresh_token,
        expiresAt
      );

      dispatch(
        loginSuccess({
          token: loginData.access_token,
          refreshToken: loginData.refresh_token,
          user: loginData.user, // Use user data directly from login response
          expiresAt: expiresAt,
        })
      );
      console.log(
        "Login successful, user data received directly:",
        loginData.user?.email
      );
    } catch (error: any) {
      const message = error?.data?.error || error.message || "Login failed";
      dispatch(loginFailure(message));
    }
  };

export const loginWithSocialThunk =
  (payload: SocialLoginPayload): AuthThunk<Promise<void>> =>
  async (dispatch: AppDispatch) => {
    dispatch(socialLoginRequest());
    try {
      // Assume loginData now contains the user object from the backend
      const loginData = await apiClient.post<LoginResponse>(
        "/auth/login/social",
        payload,
        dispatch
      );

      // REMOVED: No need to call /auth/me here
      // const user = await apiClient.get<User>('/auth/me', dispatch);

      const expiresAt = Date.now() + loginData.expires_in * 1000;
      CookieLib.setTokensCookie(
        loginData.access_token,
        loginData.refresh_token,
        expiresAt
      );

      dispatch(
        socialLoginSuccess({
          token: loginData.access_token,
          refreshToken: loginData.refresh_token,
          user: loginData.user, // Use user data directly from login response
          expiresAt: expiresAt,
        })
      );
      console.log(
        "Social login successful, user data received directly:",
        loginData.user?.email
      );
    } catch (error: any) {
      const message =
        error?.data?.error || error.message || "Social login failed";
      dispatch(socialLoginFailure(message));
    }
  };

// --- initializeAuthThunk (Remains the same, still needs /auth/me) ---
export const initializeAuthThunk =
  (): AuthThunk<Promise<void>> =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(initializeAuthRequest()); // Sets status to 'loading'

    const token = CookieLib.getTokenCookie();
    const refreshToken = CookieLib.getRefreshTokenCookie();
    const expiresAt = CookieLib.getExpiryCookie();

    if (token && refreshToken && expiresAt) {
      console.log("InitializeAuth: Tokens found in storage.");
      // --- PRE-POPULATE STATE ---
      // Dispatch synchronous action to load tokens into state *before* API call
      dispatch(setInitialTokens({ token, refreshToken, expiresAt }));
      // Now apiClient will read these from the state when called below

      try {
        // --- VALIDATE VIA API ---
        console.log(
          "InitializeAuth: Attempting to fetch /auth/me to validate session..."
        );
        // apiClient.get reads from state (now populated) and handles refresh if needed
        const user = await apiClient.get<User>("/auth/me", dispatch);
        console.log("InitializeAuth: /auth/me fetch successful.");

        // After successful fetch/refresh, get the *potentially updated* token info from state
        const currentState = getState().auth;
        dispatch(
          initializeAuthSuccess({
            token: currentState.token!, // Use validated/refreshed token
            refreshToken: currentState.refreshToken!,
            user: user,
            expiresAt: currentState.expiresAt!,
          })
        );
        console.log("InitializeAuth: Auth initialized successfully.");
      } catch (error: any) {
        // This catch block handles failures in apiClient.get('/auth/me')
        // including cases where the initial token was invalid AND refresh failed.
        console.error(
          "InitializeAuth: /auth/me fetch or subsequent refresh failed.",
          error
        );
        const message =
          error?.data?.error || error.message || "Session invalid or expired.";
        dispatch(initializeAuthFailure(message));
        // Ensure logout action is dispatched to clean up potentially bad state/cookies
        dispatch(logoutUser());
        console.log("InitializeAuth: Failure, user logged out.");
      }
    } else {
      // --- NO TOKENS FOUND ---
      console.log("InitializeAuth: No tokens found in storage.");
      // Dispatch success with null payload to signify no session
      // This also implicitly sets status away from 'loading' (reducer handles this)
      dispatch(initializeAuthFailure("no session found"));
      console.log("InitializeAuth: Finished (no session).");
    }
  };

export const setInitialTokens = (
  payload: actionTypes.SetInitialTokensAction["payload"]
): actionTypes.SetInitialTokensAction => ({
  type: actionTypes.SET_INITIAL_TOKENS,
  payload,
});

