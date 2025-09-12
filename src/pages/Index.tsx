import { useState } from "react";
import LoginTabs from "@/components/LoginTabs";
import PrefeituraLoginForm from "@/components/PrefeituraLoginForm";
import ProponenteLoginForm from "@/components/ProponenteLoginForm";
import PareceristaLoginForm from "@/components/PareceristaLoginForm";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"prefeitura" | "proponente" | "parecerista">("prefeitura");

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
