// src/components/layout/AppLayout.tsx

import { Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks/redux";
import { selectTheme, selectSidebarOpen } from "@/store/slices/uiSlice";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DeleteModal from "@/pages/expenses/DeleteModal";
import { cn } from "@/utils";

export default function AppLayout() {
  const theme = useAppSelector(selectTheme);
  const sidebarOpen = useAppSelector(selectSidebarOpen);

  return (
    <div className={cn("min-h-screen bg-background text-text font-sans", theme)}>
      <Sidebar />

      <div
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col",
          sidebarOpen ? "lg:pl-64" : "lg:pl-20"
        )}
      >
        <Header />

        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <DeleteModal />
    </div>
  );
}