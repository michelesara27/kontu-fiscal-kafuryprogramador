-- Criar enum para status das obrigações
CREATE TYPE public.obrigacao_status AS ENUM ('pendente', 'concluida', 'atrasada');

-- Criar enum para frequência das obrigações  
CREATE TYPE public.obrigacao_frequencia AS ENUM ('unica', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual');

-- Renomear tabela atual para backup
ALTER TABLE public.obrigacoes RENAME TO obrigacoes_backup;

-- Criar nova tabela obrigacoes com a estrutura correta
CREATE TABLE public.obrigacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    cliente_id UUID NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_vencimento DATE NOT NULL,
    status public.obrigacao_status NOT NULL DEFAULT 'pendente',
    frequencia public.obrigacao_frequencia NOT NULL DEFAULT 'unica',
    data_conclusao DATE,
    observacoes TEXT,
    prioridade INTEGER DEFAULT 1 CHECK (prioridade >= 1 AND prioridade <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.obrigacoes ENABLE ROW LEVEL SECURITY;

-- Recriar políticas RLS
CREATE POLICY "Users can create their own obligations" 
ON public.obrigacoes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own obligations" 
ON public.obrigacoes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own obligations" 
ON public.obrigacoes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own obligations" 
ON public.obrigacoes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Atualizar tabela clientes com campos adicionais
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS endereco TEXT,
ADD COLUMN IF NOT EXISTS contato_responsavel TEXT;

-- Adicionar índices para performance
CREATE INDEX idx_obrigacoes_status ON public.obrigacoes(status);
CREATE INDEX idx_obrigacoes_data_vencimento ON public.obrigacoes(data_vencimento);
CREATE INDEX idx_obrigacoes_cliente_id ON public.obrigacoes(cliente_id);
CREATE INDEX idx_clientes_user_id ON public.clientes(user_id);

-- Trigger para updated_at
CREATE TRIGGER update_obrigacoes_updated_at
    BEFORE UPDATE ON public.obrigacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();