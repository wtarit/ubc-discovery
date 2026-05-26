import { Outlet } from "react-router";
import { MobileHeader } from "~/components/mobile-header";
import { TopNav } from "~/components/top-nav";
import { BottomTabs } from "~/components/bottom-tabs";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <MobileHeader />
      <TopNav />
      <main className="pb-24 md:pb-0">
        <Outlet />
      </main>
      <BottomTabs />
    </div>
  );
}
