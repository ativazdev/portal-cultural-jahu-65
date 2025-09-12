import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PareceristaHeader } from "@/components/PareceristaHeader";
import { PareceristaSidebar } from "@/components/PareceristaSidebar";
import { PareceristaMain } from "@/components/PareceristaMain";
import { useAuth } from "@/hooks/useAuth";

const DashboardParecerista = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || profile?.user_type !== "parecerista")) {
      navigate("/");
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.user_type !== "parecerista") {
    return null;
  }
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <PareceristaSidebar />
        <div className="flex-1 flex flex-col">
          <PareceristaHeader />
          <PareceristaMain />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardParecerista;