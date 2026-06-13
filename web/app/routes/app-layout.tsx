import { Outlet } from "react-router";
import { MobileHeader } from "~/components/MobileHeader";
import { TopNav } from "~/components/TopNav";
import { BottomTabs } from "~/components/BottomTabs";
import { useAuth } from "~/lib/auth";

export default function AppLayout() {
  const { state } = useAuth();
  const memberName =
    state.status === "member" ? state.profile.preferred_name : undefined;

  return (
    <div className="min-h-screen bg-bg text-ink">
      <MobileHeader memberName={memberName} />
      <TopNav memberName={memberName} />
      <main className="pb-24 md:pb-0">
        <Outlet />
      </main>
      <BottomTabs />
    </div>
  );
}
