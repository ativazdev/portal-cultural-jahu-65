import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, MessageCircle, Loader2 } from "lucide-react";

interface ContatoSuporte {
  whatsapp?: string;
  email?: string;
  telefone?: string;
  observacoes?: string;
}

interface ModalContatoSuporteProps {
  open: boolean;
  onClose: () => void;
}

export const ModalContatoSuporte = ({ open, onClose }: ModalContatoSuporteProps) => {
  const [contato, setContato] = useState<ContatoSuporte | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      carregarContato();
    }
  }, [open]);

  const carregarContato = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contato_suporte')
        .select('whatsapp, email, telefone, observacoes')
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao carregar contato:', error);
      }

      setContato(data || null);
    } catch (error) {
      console.error('Erro ao carregar contato:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarWhatsApp = (whatsapp?: string) => {
    if (!whatsapp) return '';
    // Remove caracteres não numéricos
    const numeros = whatsapp.replace(/\D/g, '');
    // Formata para link do WhatsApp
    return `https://wa.me/${numeros}`;
  };

  const formatarTelefone = (telefone?: string) => {
    if (!telefone) return '';
    // Remove caracteres não numéricos
    const numeros = telefone.replace(/\D/g, '');
    // Formata para link tel:
    return `tel:${numeros}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contato de Suporte</DialogTitle>
          <DialogDescription>
            Entre em contato conosco através dos canais abaixo para relatar bugs ou solicitar suporte.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {contato ? (
              <>
                {/* WhatsApp */}
                {contato.whatsapp && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                      <p className="text-sm text-gray-600 truncate">{contato.whatsapp}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-shrink-0"
                    >
                      <a
                        href={formatarWhatsApp(contato.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir
                      </a>
                    </Button>
                  </div>
                )}

                {/* Email */}
                {contato.email && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">E-mail</p>
                      <p className="text-sm text-gray-600 truncate">{contato.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-shrink-0"
                    >
                      <a href={`mailto:${contato.email}`}>
                        Enviar
                      </a>
                    </Button>
                  </div>
                )}

                {/* Telefone */}
                {contato.telefone && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Telefone</p>
                      <p className="text-sm text-gray-600 truncate">{contato.telefone}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-shrink-0"
                    >
                      <a href={formatarTelefone(contato.telefone)}>
                        Ligar
                      </a>
                    </Button>
                  </div>
                )}

                {/* Observações */}
                {contato.observacoes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-1">Observações:</p>
                    <p className="text-xs text-gray-600">{contato.observacoes}</p>
                  </div>
                )}

                {!contato.whatsapp && !contato.email && !contato.telefone && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Nenhum contato cadastrado no momento.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Nenhum contato cadastrado no momento.</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

