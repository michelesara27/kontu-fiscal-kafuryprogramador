/*
# Esquema Completo do Banco de Dados

1. Tabelas Principais
  - `users`: Armazena informações básicas de usuários (gerenciado pelo Supabase Auth)
  - `profiles`: Informações complementares dos usuários
  - `clientes`: Cadastro de clientes/empresas
  - `obrigacoes`: Obrigações fiscais dos clientes
  - `tipos_obrigacao`: Catálogo de tipos de obrigações
  - `historicos`: Registro de alterações nas obrigações

2. Segurança
  - Todas as tabelas com RLS habilitado
  - Políticas de acesso específicas para cada tabela
*/

-- Tabela de perfis de usuário (extensão da tabela auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  cpf TEXT UNIQUE,
  telefone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Tabela de clientes/empresas
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT NOT NULL UNIQUE,
  inscricao_estadual TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  contato_responsavel TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own clients" 
ON public.clientes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own clients" 
ON public.clientes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
ON public.clientes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
ON public.clientes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Tabela de tipos de obrigação (catálogo)
CREATE TABLE IF NOT EXISTS public.tipos_obrigacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  frequencia_padrao TEXT NOT NULL, -- 'mensal', 'trimestral', etc.
  dias_prazo_padrao INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tipos_obrigacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" 
ON public.tipos_obrigacao 
FOR SELECT 
USING (true);

-- Tabela de obrigações
CREATE TABLE IF NOT EXISTS public.obrigacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo_obrigacao_id UUID REFERENCES public.tipos_obrigacao(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluida', 'atrasada')),
  frequencia TEXT NOT NULL DEFAULT 'unica' CHECK (frequencia IN ('unica', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual')),
  data_conclusao DATE,
  observacoes TEXT,
  prioridade INTEGER DEFAULT 1 CHECK (prioridade >= 1 AND prioridade <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.obrigacoes ENABLE ROW LEVEL SECURITY;

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

-- Tabela de histórico de alterações
CREATE TABLE IF NOT EXISTS public.historicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obrigacao_id UUID NOT NULL REFERENCES public.obrigacoes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  acao TEXT NOT NULL CHECK (acao IN ('criacao', 'atualizacao', 'conclusao', 'reabertura')),
  detalhes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.historicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view history of their obligations" 
ON public.historicos 
FOR SELECT 
USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_obrigacoes_status ON public.obrigacoes(status);
CREATE INDEX IF NOT EXISTS idx_obrigacoes_data_vencimento ON public.obrigacoes(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_obrigacoes_cliente_id ON public.obrigacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_historicos_obrigacao_id ON public.historicos(obrigacao_id);

-- Função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_obrigacoes_updated_at
  BEFORE UPDATE ON public.obrigacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tipos_obrigacao_updated_at
  BEFORE UPDATE ON public.tipos_obrigacao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para registrar histórico automaticamente
CREATE OR REPLACE FUNCTION public.registrar_historico_obrigacao()
RETURNS TRIGGER AS $$
DECLARE
  acao_text TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    acao_text := 'criacao';
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'concluida' AND OLD.status != 'concluida' THEN
      acao_text := 'conclusao';
    ELSIF NEW.status != 'concluida' AND OLD.status = 'concluida' THEN
      acao_text := 'reabertura';
    ELSE
      acao_text := 'atualizacao';
    END IF;
  END IF;
  
  INSERT INTO public.historicos (
    obrigacao_id,
    user_id,
    acao,
    detalhes
  ) VALUES (
    NEW.id,
    NEW.user_id,
    acao_text,
    jsonb_build_object(
      'status_anterior', OLD.status,
      'status_novo', NEW.status,
      'data_vencimento_anterior', OLD.data_vencimento,
      'data_vencimento_novo', NEW.data_vencimento
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar histórico
CREATE TRIGGER trigger_registrar_historico
  AFTER INSERT OR UPDATE ON public.obrigacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_historico_obrigacao();
