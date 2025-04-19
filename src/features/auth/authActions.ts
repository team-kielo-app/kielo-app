import * as actionTypes from "./authActionTypes";
import type {
  AuthState,
  User,
  LoginResponse,
  SocialLoginPayload,
} from "./types";
import { apiClient } from "@lib/api";
import { RootState, AppDispatch, AppThunk } from "@store/store";
import * as tokenStorage from "@lib/tokenStorage";

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
  payload?: actionTypes.InitializeAuthSuccessAction["payload"]
): actionTypes.InitializeAuthSuccessAction => ({
  type: actionTypes.INITIALIZE_AUTH_SUCCESS,
  payload,
});
export const initializeAuthFailure = (
  error?: string | null
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
export const logoutUser = (): AppThunk => async (dispatch) => {
  await tokenStorage.removeStoredTokens();

  dispatch(logoutUserSuccess());
};
export const logoutUserSuccess = (): actionTypes.LogoutUserAction => {
  return { type: actionTypes.LOGOUT_USER };
};
export const clearAuthError = (): actionTypes.ClearAuthErrorAction => ({
  type: actionTypes.CLEAR_AUTH_ERROR,
});

export const loginUserThunk =
  (credentials: { email: string; password: string }): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch) => {
    dispatch(loginRequest());
    try {
      const loginData = await apiClient.post<LoginResponse>(
        "/auth/login/email",
        credentials,
        dispatch
      );

      const expiresAt = Date.now() + loginData.expires_in * 1000;
      await tokenStorage.setStoredTokens(
        loginData.access_token,
        loginData.refresh_token,
        expiresAt
      );

      dispatch(
        loginSuccess({
          token: loginData.access_token,
          refreshToken: loginData.refresh_token,
          user: loginData.user,
          expiresAt: expiresAt,
        })
      );
    } catch (error: any) {
      const message = error?.data?.error || error.message || "Login failed";
      dispatch(loginFailure(message));
    }
  };

export const loginWithSocialThunk =
  (payload: SocialLoginPayload): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch) => {
    dispatch(socialLoginRequest());
    try {
      const loginData = await apiClient.post<LoginResponse>(
        "/auth/login/social",
        payload,
        dispatch
      );

      const expiresAt = Date.now() + loginData.expires_in * 1000;
      await tokenStorage.setStoredTokens(
        loginData.access_token,
        loginData.refresh_token,
        expiresAt
      );

      dispatch(
        socialLoginSuccess({
          token: loginData.access_token,
          refreshToken: loginData.refresh_token,
          user: loginData.user,
          expiresAt: expiresAt,
        })
      );
    } catch (error: any) {
      const message =
        error?.data?.error || error.message || "Social login failed";
      dispatch(socialLoginFailure(message));
    }
  };

export const initializeAuthThunk =
  (): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(initializeAuthRequest());

    const storedData = await tokenStorage.getStoredTokens();
    const { token, refreshToken, expiresAt } = storedData;

    if (token && refreshToken && expiresAt && expiresAt > Date.now()) {
      console.log("InitializeAuth: Tokens found in storage and not expired.");

      dispatch(setInitialTokens({ token, refreshToken, expiresAt }));

      try {
        console.log("InitializeAuth: Attempting to fetch /auth/me...");
        const user = await apiClient.get<User>("/auth/me", dispatch);
        console.log("InitializeAuth: /auth/me fetch successful.");

        const currentState = getState().auth;
        dispatch(
          initializeAuthSuccess({
            token: currentState.token!,
            refreshToken: currentState.refreshToken!,
            user: user,
            expiresAt: currentState.expiresAt!,
          })
        );
        console.log("InitializeAuth: Auth initialized successfully.");
      } catch (error: any) {
        console.error(
          "InitializeAuth: /auth/me fetch or refresh failed.",
          error
        );
        const message =
          error?.data?.error || error.message || "Session invalid or expired.";
        dispatch(initializeAuthFailure(message));

        dispatch(logoutUser());
        console.log("InitializeAuth: Failure, ensuring user is logged out.");
      }
    } else {
      if (!token || !refreshToken || !expiresAt) {
        console.log("InitializeAuth: No tokens found in storage.");
      } else {
        console.log("InitializeAuth: Tokens found but expired.");
        await tokenStorage.removeStoredTokens();
      }
      dispatch(initializeAuthFailure());
      console.log("InitializeAuth: Finished (no valid session).");
    }
  };

export const setInitialTokens = (
  payload: actionTypes.SetInitialTokensAction["payload"]
): actionTypes.SetInitialTokensAction => ({
  type: actionTypes.SET_INITIAL_TOKENS,
  payload,
});

