import { useState } from 'react';
import { ViaCepResponse } from '../types/company';

export const useCepApi = () => {
  const [loading, setLoading] = useState(false);

  const fetchAddress = async (cep: string) => {
    if (cep.replace(/\D/g, '').length !== 8) return null;
    
    setLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: ViaCepResponse = await response.json();
      
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }
      
      return {
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf
      };
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchAddress, loading };
};
