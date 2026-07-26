import { ReactNode } from "react";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import SyncStatusNotice from "@/components/sync/SyncStatusNotice";
import Sidebar from "./Sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({
  children,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex flex-1 flex-col">
          <main className="flex-1 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-0">
            {children}

            <SyncStatusNotice />
          </main>

          <BottomNavigation />
        </div>
      </div>
    </div>
  );
}