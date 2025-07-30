import { useAuth } from '@/hooks/useAuth';
import { useObrigacoes } from '@/hooks/useObrigacoes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function Obrigacoes() {
  const { user } = useAuth();
  const { obrigacoes, loading, error, addObrigacao } = useObrigacoes(user?.id || '');
  const [newObrigacao, setNewObrigacao] = useState({
    titulo: '',
    descricao: '',
    dataVencimento: '',
    status: 'pendente'
  });

  const handleAddObrigacao = async (e: React.FormEvent) => {
    e.preventDefault();
    await addObrigacao(newObrigacao);
    setNewObrigacao({
      titulo: '',
      descricao: '',
      dataVencimento: '',
      status: 'pendente'
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setNewObrigacao(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Obrigações</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddObrigacao} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={newObrigacao.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={newObrigacao.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                <Input
                  id="dataVencimento"
                  type="date"
                  value={newObrigacao.dataVencimento}
                  onChange={(e) => handleInputChange('dataVencimento', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={newObrigacao.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="pendente">Pendente</option>
                  <option value="concluido">Concluído</option>
                  <option value="atrasado">Atrasado</option>
                </select>
              </div>
            </div>
            <Button type="submit">Adicionar Obrigação</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Obrigações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Carregando...</div>
          ) : error ? (
            <div className="text-destructive">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {obrigacoes.map((obrigacao) => (
                  <TableRow key={obrigacao.id}>
                    <TableCell>{obrigacao.titulo}</TableCell>
                    <TableCell>{obrigacao.descricao}</TableCell>
                    <TableCell>{new Date(obrigacao.dataVencimento).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        obrigacao.status === 'concluido' 
                          ? 'bg-green-100 text-green-800' 
                          : obrigacao.status === 'atrasado' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {obrigacao.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
