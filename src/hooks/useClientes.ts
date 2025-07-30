import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export function useClientes(userId: string) {
  const [clientes, setClientes] = useState<Tables<'clientes'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setClientes(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchClientes();
  }, [userId]);

  const addCliente = async (cliente: Omit<TablesInsert<'clientes'>, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert({
          ...cliente,
          user_id: userId
        })
        .select();

      if (error) throw error;
      if (data) setClientes(prev => [data[0], ...prev]);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  return { clientes, loading, error, addCliente };
}
