import { useState, useEffect } from "react";
import LoginTabs from "@/components/LoginTabs";
import PrefeituraLoginForm from "@/components/PrefeituraLoginForm";
import ProponenteLoginForm from "@/components/ProponenteLoginForm";
import PareceristaLoginForm from "@/components/PareceristaLoginForm";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"prefeitura" | "proponente" | "parecerista">("prefeitura");
  const { user, profile, loading, getDashboardRoute } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      navigate(getDashboardRoute(profile.user_type));
    }
  }, [user, profile, loading, navigate, getDashboardRoute]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Acesso ao Sistema PNAB
          </h1>
          <p className="text-muted-foreground">
            Sistema de Gestão Cultural
          </p>
        </div>

        <LoginTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "prefeitura" ? (
          <PrefeituraLoginForm />
        ) : activeTab === "proponente" ? (
          <ProponenteLoginForm />
        ) : (
          <PareceristaLoginForm />
        )}
      </div>
    </div>
  );
};

export default Index;
