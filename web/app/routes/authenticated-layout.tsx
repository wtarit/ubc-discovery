import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/lib/auth";

export default function AuthenticatedLayout() {
  const { state } = useAuth();

  if (state.status === "loading") return null;
  if (state.status === "anonymous") {
    return <Navigate to="/sign-in" replace />;
  }
  return <Outlet />;
}
