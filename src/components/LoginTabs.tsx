import { useState } from "react";
import { cn } from "@/lib/utils";

interface LoginTabsProps {
  activeTab: "prefeitura" | "proponente" | "parecerista";
  onTabChange: (tab: "prefeitura" | "proponente" | "parecerista") => void;
}

const LoginTabs = ({ activeTab, onTabChange }: LoginTabsProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex rounded-lg bg-muted p-1">
        <button
          onClick={() => onTabChange("prefeitura")}
          className={cn(
            "flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all",
            activeTab === "prefeitura"
              ? "bg-prefeitura-primary text-prefeitura-primary-foreground shadow-prefeitura"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Login Prefeitura
        </button>
        <button
          onClick={() => onTabChange("proponente")}
          className={cn(
            "flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all",
            activeTab === "proponente"
              ? "bg-cultural-primary text-cultural-primary-foreground shadow-cultural"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Login Proponente
        </button>
        <button
          onClick={() => onTabChange("parecerista")}
          className={cn(
            "flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all",
            activeTab === "parecerista"
              ? "bg-parecerista-primary text-parecerista-primary-foreground shadow-parecerista"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Login Parecerista
        </button>
      </div>
    </div>
  );
};

export default LoginTabs;