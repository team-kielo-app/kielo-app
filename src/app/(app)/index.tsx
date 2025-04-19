import { Redirect } from "expo-router";

export default function StartPage() {
  // This page typically redirects immediately based on auth state.
  // The logic is handled in the root _layout.tsx, so this component
  // might not even be rendered if redirection happens fast enough.
  // If needed, you could add a loading indicator here, but _layout is better.

  // Redirecting to a screen within the (app) group. The root layout will
  // handle checking auth and redirecting to (auth) if needed.
  return <Redirect href="/(app)/(tabs)" />;
}

