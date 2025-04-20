import { useSelector } from "react-redux";
import { useRouter, usePathname } from "expo-router";
import { useCallback } from "react";
import { selectIsAuthenticated } from "@features/auth/authSelectors";
import { Alert } from "react-native";

/**
 * Hook to guard actions that require authentication.
 * If the user is authenticated, it returns the provided callback.
 * If not authenticated, it shows an alert and then redirects the user
 * to the login screen (in the auth group) with a redirect query parameter
 * pointing back to the current page within the main group.
 *
 * @param actionCallback The function to execute if the user is authenticated.
 * @param message Optional message to show before redirecting.
 * @returns A function that either executes the action or triggers the login redirect.
 */
export function useRequireAuthAction<T extends (...args: any[]) => any>(
  actionCallback: T,
  message: string = "You need to be logged in to perform this action."
): (...args: Parameters<T>) => void {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();
  const pathname = usePathname(); // Get the current path (e.g., /main/article/123)

  const guardedAction = useCallback(
    (...args: Parameters<T>) => {
      if (isAuthenticated) {
        actionCallback(...args);
      } else {
        Alert.alert("Authentication Required", message, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Login",
            onPress: () => {
              console.log(
                `[useRequireAuthAction] Redirecting to login from ${pathname}`
              );
              // Redirect to login within the auth group, passing the current path
              router.push(
                `/(auth)/login?redirect=${encodeURIComponent(pathname)}`
              );
            },
          },
        ]);
      }
    },
    [isAuthenticated, actionCallback, router, pathname, message]
  );

  return guardedAction;
}
