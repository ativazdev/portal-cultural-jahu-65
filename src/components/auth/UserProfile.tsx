import { useState, useEffect } from 'react';
import { usePrefeituraAuth } from '@/hooks/usePrefeituraAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, LogOut } from 'lucide-react';

export const UserProfile = () => {
  const { profile, prefeitura, logout, updateProfile } = usePrefeituraAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cargo: '',
    telefone: '',
  });

  // Atualizar formData quando profile mudar
  useEffect(() => {
    if (profile) {
      setFormData({
        nome: profile.nome || '',
        cargo: profile.cargo || '',
        telefone: profile.telefone || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
      setIsProfileOpen(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nome: profile?.nome || '',
      cargo: profile?.cargo || '',
      telefone: profile?.telefone || '',
    });
    setIsEditing(false);
  };

  if (!profile) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar_url} alt={profile.nome} />
            <AvatarFallback>
              {profile.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile.nome}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile.cargo}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {prefeitura?.nome}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
          <User className="mr-2 h-4 w-4" />
          <span>Meu Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Meu Perfil</DialogTitle>
            <DialogDescription>
              Visualize e edite suas informações pessoais.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              {isEditing ? (
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  className="col-span-3"
                />
              ) : (
                <span className="col-span-3">{profile.nome}</span>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cargo" className="text-right">
                Cargo
              </Label>
              {isEditing ? (
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                  className="col-span-3"
                />
              ) : (
                <span className="col-span-3">{profile.cargo}</span>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefone" className="text-right">
                Telefone
              </Label>
              {isEditing ? (
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  className="col-span-3"
                />
              ) : (
                <span className="col-span-3">{profile.telefone}</span>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Email
              </Label>
              <span className="col-span-3 text-sm text-muted-foreground">
                {profile.user_id} {/* Aqui seria o email do usuário */}
              </span>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  Salvar
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
};
