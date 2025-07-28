import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Obrigacao {
  id: string;
  titulo: string;
  descricao: string | null;
  data_vencimento: string;
  status: 'pendente' | 'concluida' | 'atrasada';
  frequencia: 'unica' | 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual';
  cliente_id: string;
  clientes?: {
    nome: string;
    cnpj: string;
  } | null;
}

interface DashboardStats {
  total_clientes: number;
  total_obrigacoes: number;
  pendentes: number;
  atrasadas: number;
  concluidas: number;
}

export function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [obrigacoes, setObrigacoes] = useState<Obrigacao[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_clientes: 0,
    total_obrigacoes: 0,
    pendentes: 0,
    atrasadas: 0,
    concluidas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Buscar obrigações com informações do cliente
      const { data: obrigacoesData, error: obrigacoesError } = await supabase
        .from('obrigacoes')
        .select(`
          *,
          clientes (
            nome,
            cnpj
          )
        `)
        .eq('user_id', user?.id)
        .order('data_vencimento', { ascending: true })
        .limit(10);

      if (obrigacoesError) throw obrigacoesError;

      // Buscar estatísticas dos clientes
      const { count: clientesCount } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Buscar estatísticas das obrigações
      const { data: obrigacoesStats } = await supabase
        .from('obrigacoes')
        .select('status')
        .eq('user_id', user?.id);

      const statsCalc = {
        total_clientes: clientesCount || 0,
        total_obrigacoes: obrigacoesStats?.length || 0,
        pendentes: obrigacoesStats?.filter(o => o.status === 'pendente').length || 0,
        atrasadas: obrigacoesStats?.filter(o => o.status === 'atrasada').length || 0,
        concluidas: obrigacoesStats?.filter(o => o.status === 'concluida').length || 0,
      };

      setObrigacoes((obrigacoesData as any) || []);
      setStats(statsCalc);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateObrigacaoStatus = async (id: string, status: 'pendente' | 'concluida' | 'atrasada') => {
    try {
      const { error } = await supabase
        .from('obrigacoes')
        .update({ 
          status,
          data_conclusao: status === 'concluida' ? new Date().toISOString().split('T')[0] : null
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "Obrigação atualizada com sucesso!",
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total_clientes}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-status-pending/5 to-status-pending/10 border-status-pending/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-pending">{stats.pendentes}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-status-overdue/5 to-status-overdue/10 border-status-overdue/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-overdue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-overdue">{stats.atrasadas}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-status-completed/5 to-status-completed/10 border-status-completed/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-status-completed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-completed">{stats.concluidas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Obligations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Próximas Obrigações</CardTitle>
            <CardDescription>
              Obrigações que precisam de atenção
            </CardDescription>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Obrigação
          </Button>
        </CardHeader>
        <CardContent>
          {obrigacoes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma obrigação encontrada</p>
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Criar primeira obrigação
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {obrigacoes.map((obrigacao) => (
                <div
                  key={obrigacao.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-foreground">{obrigacao.titulo}</h4>
                      <StatusBadge status={obrigacao.status} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Cliente: {obrigacao.clientes?.nome} ({obrigacao.clientes?.cnpj})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vencimento: {new Date(obrigacao.data_vencimento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {obrigacao.status !== 'concluida' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateObrigacaoStatus(obrigacao.id, 'concluida')}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Concluir
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
