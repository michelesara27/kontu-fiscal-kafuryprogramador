import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export function useHistorico(obrigacaoId: string) {
  const [historico, setHistorico] = useState<Tables<'historicos'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('historicos')
          .select('*')
          .eq('obrigacao_id', obrigacaoId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHistorico(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (obrigacaoId) fetchHistorico();
  }, [obrigacaoId]);

  return { historico, loading, error };
}
