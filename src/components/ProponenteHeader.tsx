import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
// import { useAuthState } from "@/hooks/useAuthCustom";
// import { usePrefeitura } from "@/contexts/PrefeituraContext";
import { useNavigate } from "react-router-dom";

export const ProponenteHeader = () => {
  // const { user, logout } = useAuthState();
  // const { prefeitura } = usePrefeitura();
  const navigate = useNavigate();
  const user = { nome: "Usuário Teste" };
  const prefeitura = { nome: "Prefeitura Teste" };

  const handleLogout = async () => {
    // logout();
    navigate("/");
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cultural-primary rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {prefeitura?.municipio?.charAt(0) || 'C'}
            </span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Sistema PNAB - {prefeitura?.nome || 'Prefeitura'}
            </h1>
            <p className="text-xs text-gray-500">
              {prefeitura?.municipio} - {prefeitura?.estado}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
          <User className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">
            Olá, {user?.nome || 'Proponente'}
          </span>
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
