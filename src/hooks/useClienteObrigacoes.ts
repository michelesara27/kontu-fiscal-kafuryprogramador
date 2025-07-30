import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export function useClienteObrigacoes(clienteId: string) {
  const [obrigacoes, setObrigacoes] = useState<Tables<'obrigacoes'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchObrigacoes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('obrigacoes')
          .select('*')
          .eq('cliente_id', clienteId)
          .order('data_vencimento', { ascending: true });

        if (error) throw error;
        setObrigacoes(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (clienteId) fetchObrigacoes();
  }, [clienteId]);

  return { obrigacoes, loading, error };
}
