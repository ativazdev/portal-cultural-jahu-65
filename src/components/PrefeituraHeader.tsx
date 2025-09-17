import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, Settings, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const PrefeituraHeader = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="flex h-16 items-center px-6">
        <SidebarTrigger className="mr-4" />
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-prefeitura-primary rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-prefeitura-primary">PNAB</h1>
            <p className="text-xs text-prefeitura-muted">Painel Administrativo</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/*<Button variant="ghost" size="icon" className="text-prefeitura-muted hover:text-prefeitura-primary">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-prefeitura-muted hover:text-prefeitura-primary">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-prefeitura-muted hover:text-prefeitura-primary">
            <User className="h-5 w-5" />
          </Button>*/}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};