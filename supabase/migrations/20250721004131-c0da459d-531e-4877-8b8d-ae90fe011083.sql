-- Add foreign key relationship between obrigacoes and clientes tables
ALTER TABLE public.obrigacoes 
ADD CONSTRAINT fk_obrigacoes_cliente_id 
FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;
