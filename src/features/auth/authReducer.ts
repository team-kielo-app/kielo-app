import * as actionTypes from './authActionTypes'
import { AuthState } from './types'
import { AuthAction } from './authActionTypes'

const initialState: AuthState = {
  userId: null,
  initialAuthChecked: false,
  status: 'idle',
  error: null
}

const authReducer = (state = initialState, action: AuthAction): AuthState => {
  switch (action.type) {
    case actionTypes.LOGIN_REQUEST:
    case actionTypes.SOCIAL_LOGIN_REQUEST:
    case actionTypes.REGISTER_REQUEST:
      return {
        ...initialState,
        ...state,
        status: 'loading',
        error: null
      }

    case actionTypes.INITIALIZE_AUTH_REQUEST:
      return {
        ...state,
        status: 'loading',
        initialAuthChecked: false,
        error: null
      }

    case actionTypes.LOGIN_SUCCESS:
    case actionTypes.SOCIAL_LOGIN_SUCCESS:
      return {
        ...state,
        userId: action.payload.userId,
        status: 'succeeded',
        initialAuthChecked: true,
        error: null
      }

    case actionTypes.INITIALIZE_AUTH_SUCCESS:
      return {
        ...state,
        userId: action.payload?.newUserData?.userId || state.userId,
        initialAuthChecked: true,
        status: 'succeeded',
        error: null
      }

    case actionTypes.SET_REFRESHED_TOKENS:
      return {
        ...state,
        status: 'succeeded',
        error: null
      }

    case actionTypes.LOGIN_FAILURE:
    case actionTypes.SOCIAL_LOGIN_FAILURE:
    case actionTypes.REGISTER_FAILURE:
    case actionTypes.INITIALIZE_AUTH_FAILURE:
      return {
        ...state,
        status:
          action.type === actionTypes.INITIALIZE_AUTH_FAILURE
            ? 'sessionInvalid'
            : 'failed',
        initialAuthChecked: true,
        error: action.payload
      }

    case actionTypes.LOGOUT_USER:
      return {
        ...initialState,
        initialAuthChecked: true
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
