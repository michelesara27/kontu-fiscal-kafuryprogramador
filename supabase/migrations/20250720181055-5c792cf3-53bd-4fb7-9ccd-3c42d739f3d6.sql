-- Remover valores padrão das colunas que serão alteradas
ALTER TABLE public.obrigacoes ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.obrigacoes ALTER COLUMN frequencia DROP DEFAULT;

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

-- Definir novos valores padrão
ALTER TABLE public.obrigacoes ALTER COLUMN status SET DEFAULT 'pendente'::public.obrigacao_status;
ALTER TABLE public.obrigacoes ALTER COLUMN frequencia SET DEFAULT 'unica'::public.obrigacao_frequencia;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_obrigacoes_status ON public.obrigacoes(status);
CREATE INDEX IF NOT EXISTS idx_obrigacoes_data_vencimento ON public.obrigacoes(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_obrigacoes_cliente_id ON public.obrigacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);