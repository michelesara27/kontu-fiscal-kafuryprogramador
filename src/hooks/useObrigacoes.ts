import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export function useObrigacoes(userId: string) {
  const [obrigacoes, setObrigacoes] = useState<Tables<'obrigacoes'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchObrigacoes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('obrigacoes')
          .select('*, clientes(*)')
          .eq('user_id', userId)
          .order('data_vencimento', { ascending: true });

        if (error) throw error;
        setObrigacoes(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchObrigacoes();
  }, [userId]);

  const addObrigacao = async (obrigacao: Omit<TablesInsert<'obrigacoes'>, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('obrigacoes')
        .insert({
          ...obrigacao,
          user_id: userId
        })
        .select();

      if (error) throw error;
      if (data) setObrigacoes(prev => [...prev, data[0]]);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  const updateObrigacaoStatus = async (id: string, status: 'pendente' | 'concluida' | 'atrasada') => {
    try {
      const { data, error } = await supabase
        .from('obrigacoes')
        .update({ status })
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data) {
        setObrigacoes(prev => 
          prev.map(obr => obr.id === id ? { ...obr, status } : obr)
        );
      }
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  return { obrigacoes, loading, error, addObrigacao, updateObrigacaoStatus };
}
