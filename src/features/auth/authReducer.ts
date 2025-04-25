import * as actionTypes from './authActionTypes'
import { AuthState } from './types'
import { AuthAction } from './authActionTypes'

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  expiresAt: null,
  status: 'idle',
  error: null
}

const authReducer = (state = initialState, action: AuthAction): AuthState => {
  switch (action.type) {
    case actionTypes.LOGIN_REQUEST:
    case actionTypes.SOCIAL_LOGIN_REQUEST:
    case actionTypes.REGISTER_REQUEST:
    case actionTypes.INITIALIZE_AUTH_REQUEST:
      return {
        ...state,
        status: 'loading',
        error: null
      }

    case actionTypes.SET_INITIAL_TOKENS:
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt,
        status: 'loading',
        error: null
      }

    case actionTypes.LOGIN_SUCCESS:
    case actionTypes.SOCIAL_LOGIN_SUCCESS:
    case actionTypes.INITIALIZE_AUTH_SUCCESS:
      return {
        ...state,
        status: 'succeeded',
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt,
        error: null
      }

    case actionTypes.SET_REFRESHED_TOKENS:
      return {
        ...state,
        token: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt,
        status: 'succeeded',
        error: null
      }

    case actionTypes.LOGIN_FAILURE:
    case actionTypes.SOCIAL_LOGIN_FAILURE:
    case actionTypes.REGISTER_FAILURE:
    case actionTypes.INITIALIZE_AUTH_FAILURE:
      return {
        ...initialState,
        status: 'failed',
        error: action.payload
      }

    case actionTypes.LOGOUT_USER:
      return {
        ...initialState,
        status: 'idle'
      }

    case actionTypes.CLEAR_AUTH_ERROR:
      return {
        ...state,
        error: null
      }

    default:
      return state
  }
}

export default authReducer
