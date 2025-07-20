import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User, Building2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title = "Dashboard" }: LayoutProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary-soft/20">
      <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">Kontu</h1>
                  <p className="text-xs text-muted-foreground">Gestão Fiscal Inteligente</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-foreground">
                    {user?.user_metadata?.nome || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">Contador</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground mt-2">
            Mantenha seus clientes em dia com suas obrigações fiscais
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}