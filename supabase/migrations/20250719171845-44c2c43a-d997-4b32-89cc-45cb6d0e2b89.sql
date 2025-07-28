-- Criar enum para status das obrigações
CREATE TYPE public.obrigacao_status AS ENUM ('pendente', 'concluida', 'atrasada');

-- Criar enum para frequência das obrigações
CREATE TYPE public.obrigacao_frequencia AS ENUM ('unica', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual');

-- Atualizar tabela clientes com campos adicionais
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS endereco TEXT,
ADD COLUMN IF NOT EXISTS contato_responsavel TEXT;

-- Atualizar tabela obrigacoes para usar os novos enums e campos
ALTER TABLE public.obrigacoes 
ALTER COLUMN status TYPE public.obrigacao_status USING status::public.obrigacao_status,
ALTER COLUMN frequencia TYPE public.obrigacao_frequencia USING frequencia::public.obrigacao_frequencia,
ADD COLUMN IF NOT EXISTS data_conclusao DATE,
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS prioridade INTEGER DEFAULT 1 CHECK (prioridade >= 1 AND prioridade <= 5);

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_obrigacoes_status ON public.obrigacoes(status);
CREATE INDEX IF NOT EXISTS idx_obrigacoes_data_vencimento ON public.obrigacoes(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_obrigacoes_cliente_id ON public.obrigacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);

-- Função para atualizar status das obrigações automaticamente
CREATE OR REPLACE FUNCTION public.update_obrigacao_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Se foi marcada como concluída, definir data de conclusão
  IF NEW.status = 'concluida' AND OLD.status != 'concluida' THEN
    NEW.data_conclusao = CURRENT_DATE;
  END IF;
  
  -- Se foi desmarcada como concluída, remover data de conclusão
  IF NEW.status != 'concluida' AND OLD.status = 'concluida' THEN
    NEW.data_conclusao = NULL;
  END IF;
  
  -- Atualizar status para atrasada se venceu e não foi concluída
  IF NEW.data_vencimento < CURRENT_DATE AND NEW.status = 'pendente' THEN
    NEW.status = 'atrasada';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar status automaticamente
DROP TRIGGER IF EXISTS trigger_update_obrigacao_status ON public.obrigacoes;
CREATE TRIGGER trigger_update_obrigacao_status
  BEFORE UPDATE ON public.obrigacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_obrigacao_status();

-- Função para verificar obrigações vencidas (pode ser usada em cron job)
CREATE OR REPLACE FUNCTION public.mark_overdue_obrigacoes()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.obrigacoes 
  SET status = 'atrasada'
  WHERE data_vencimento < CURRENT_DATE 
    AND status = 'pendente';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;
