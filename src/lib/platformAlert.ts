import { Alert, Platform } from 'react-native'
import type { AlertButton } from 'react-native'

/**
 * Shows a platform-appropriate alert.
 * On Web, uses window.alert for 0/1 button cases and window.confirm for 2-button cases.
 * Logs a warning for more than 2 buttons on web.
 * On Native, uses React Native's Alert.alert.
 *
 * @param title The alert title.
 * @param message Optional alert message.
 * @param buttons Optional array of alert buttons.
 * @param options Optional alert options (only effective on native).
 */
export const showPlatformAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: { cancelable?: boolean }
): void => {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons, options)
    return
  }

  const effectiveMessage = `${title}${message ? '\n\n' + message : ''}`

  if (!buttons || buttons.length === 0 || buttons.length === 1) {
    window.alert(effectiveMessage)
    if (buttons && buttons.length === 1 && buttons[0].onPress) {
      buttons[0].onPress()
    }
    return
  }

  if (buttons.length === 2) {
    const cancelButton = buttons.find(b => b.style === 'cancel') || buttons[0]
    const confirmButton = cancelButton === buttons[0] ? buttons[1] : buttons[0]

    if (window.confirm(effectiveMessage)) {
      if (confirmButton.onPress) {
        confirmButton.onPress()
      }
    } else {
      if (cancelButton.onPress) {
        cancelButton.onPress()
      }
    }
    return
  }

  if (buttons.length > 2) {
    console.warn(
      `showPlatformAlert: Alerts with more than two buttons have limited functionality on web. Displaying basic alert for "${title}".`
    )
    window.alert(effectiveMessage)
    if (buttons[0].onPress) {
      console.log(
        `showPlatformAlert: Triggering action for button "${buttons[0].text}" as fallback.`
      )
      buttons[0].onPress()
    }
    return
  }
}
