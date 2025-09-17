import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const PareceristaHeader = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cultural-primary rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">
            Sistema PNAB - Secretaria de Cultura de Jahu
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
          <User className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">Olá, Parecerista</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};