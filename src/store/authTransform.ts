// src/store/authTransform.ts
import { createTransform } from 'redux-persist'
import { AuthState } from '@features/auth/types' // Your AuthState type

// This transform will only save and load 'userId' and 'initialAuthChecked' from the auth state.
// 'status' and 'error' will be omitted during persistence and will revert to their
// initialSate values upon rehydration if not explicitly handled.
const AuthTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState: AuthState, key) => {
    // We only want to persist userId and initialAuthChecked
    return {
      userId: inboundState.userId,
      initialAuthChecked: inboundState.initialAuthChecked
      // status and error are omitted
    }
  },
  // transform state being rehydrated
  (outboundState: any, key) => {
    // When rehydrating, ensure status and error are reset or set to sensible defaults.
    // The authReducer's initialState will handle this if these fields are undefined.
    // So, just return the persisted parts. If you wanted to explicitly set them to
    // initial values here, you could.
    return {
      ...outboundState, // This will have userId and initialAuthChecked
      status: 'idle', // Explicitly reset status on rehydration
      error: null // Explicitly reset error on rehydration
    }
  },
  // define which reducer this transform is applied to
  { whitelist: ['auth'] }
)

export default AuthTransform
