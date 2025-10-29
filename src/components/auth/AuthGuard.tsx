import { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  // Por enquanto, sempre permitir acesso
  // TODO: Implementar verificação de autenticação adequada
  return <>{children}</>;
};
