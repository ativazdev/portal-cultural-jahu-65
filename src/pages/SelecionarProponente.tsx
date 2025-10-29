import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SelecionarProponente } from "@/components/SelecionarProponente";

const SelecionarProponentePage = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <SelecionarProponente />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SelecionarProponentePage;
