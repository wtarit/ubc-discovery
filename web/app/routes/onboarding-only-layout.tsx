import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/lib/auth";

export default function OnboardingOnlyLayout() {
  const { state } = useAuth();

  if (state.status === "loading") return null;
  if (state.status === "anonymous") {
    return <Navigate to="/sign-in" replace />;
  }
  if (state.status === "member") return null;
  return <Outlet />;
}
