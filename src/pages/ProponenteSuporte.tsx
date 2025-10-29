import { ProponenteLayout } from "@/components/layout/ProponenteLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export const ProponenteSuporte = () => {
  return (
    <ProponenteLayout 
      title="Suporte"
      description="Entre em contato com o suporte para dúvidas e solicitações"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            Sistema de Suporte
          </CardTitle>
          <CardDescription>
            Esta funcionalidade está em desenvolvimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Em breve você poderá enviar dúvidas e solicitações para a prefeitura através desta página.
          </p>
        </CardContent>
      </Card>
    </ProponenteLayout>
  );
};

