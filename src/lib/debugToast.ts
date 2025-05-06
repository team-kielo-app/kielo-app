// src/lib/debugToast.ts
import Toast from 'react-native-toast-message'

type ToastType = 'success' | 'error' | 'info'

/**
 * Shows a short debug toast message globally.
 * Intended for temporary debugging of authentication flows.
 *
 * @param type - 'success', 'error', or 'info'
 * @param title - The main title of the toast
 * @param message - Optional longer message body
 */
export const showAuthDebugToast = (
  type: ToastType,
  title: string,
  message?: string
) => {
  console.log(
    `[AuthDebugToast - ${type.toUpperCase()}] ${title}${
      message ? `: ${message}` : ''
    }`
  ) // Also log to console

  // Ensure Toast is called on the main thread if triggered from background tasks (less likely here but good practice)
  // setTimeout(() => { // Often not needed if called from React components/hooks/thunks
  Toast.show({
    type: type, // 'success', 'error', 'info'
    text1: title,
    text2: message,
    position: 'bottom', // Or 'top'
    visibilityTime: 4000, // 4 seconds
    autoHide: true,
    bottomOffset: 60 // Adjust if needed
  })
  // }, 0);
}
