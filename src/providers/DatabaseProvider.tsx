import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClientes } from '@/hooks/useClientes';
import { useObrigacoes } from '@/hooks/useObrigacoes';
import { useProfile } from '@/hooks/useProfile';
import { useTiposObrigacao } from '@/hooks/useTiposObrigacao';

interface DatabaseContextType {
  clientes: ReturnType<typeof useClientes>;
  obrigacoes: ReturnType<typeof useObrigacoes>;
  profile: ReturnType<typeof useProfile>;
  tiposObrigacao: ReturnType<typeof useTiposObrigacao>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id || '';

  const clientes = useClientes(userId);
  const obrigacoes = useObrigacoes(userId);
  const profile = useProfile(userId);
  const tiposObrigacao = useTiposObrigacao();

  return (
    <DatabaseContext.Provider value={{ clientes, obrigacoes, profile, tiposObrigacao }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
