import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "expo-router";
import {
  selectIsAuthenticated,
  selectAuthStatus,
} from "@features/auth/authSelectors";

/**
 * Hook to protect a route. If the user is not authenticated
 * (after the initial auth check is complete), it redirects
 * them to the login screen within the (auth) group,
 * including a redirect query parameter.
 */
export function useProtectedRoute() {
  const router = useRouter();
  const pathname = usePathname(); // Get the current path (will be like /main/profile)
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector(selectAuthStatus); // 'idle', 'loading', 'succeeded', 'failed'

  useEffect(() => {
    // Wait until the initial auth check is done
    if (authStatus === "idle" || authStatus === "loading") {
      return;
    }

    // If auth check finished and user is not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log(
        `[useProtectedRoute] Not authenticated on ${pathname}, redirecting to login.`
      );
      router.replace(`/(auth)/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, authStatus, router, pathname]);

  // Return loading/auth state, useful for conditionally rendering a loading spinner
  // while the check is happening or before redirection occurs.
  return {
    isLoading: authStatus === "loading" || authStatus === "idle",
    isAuthenticated: isAuthenticated, // Pass auth status back if needed
  };
}
