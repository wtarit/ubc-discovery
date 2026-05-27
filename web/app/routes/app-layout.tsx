import { Outlet } from "react-router";
import { MobileHeader } from "~/components/MobileHeader";
import { TopNav } from "~/components/TopNav";
import { BottomTabs } from "~/components/BottomTabs";
import { useAuth } from "~/lib/auth";

export default function AppLayout() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-bg text-ink">
      <MobileHeader memberName={profile?.preferred_name} />
      <TopNav memberName={profile?.preferred_name} />
      <main className="pb-24 md:pb-0">
        <Outlet />
      </main>
      <BottomTabs />
    </div>
  );
}
