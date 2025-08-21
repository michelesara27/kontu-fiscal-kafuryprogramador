 // src/hooks/useCompanyMutation.ts
import { useState } from 'react';
import { companyAPI } from '../services/companiesService';
import { CompanyFormData } from '../types/company';
import { useToast } from './useToast';

export const useCompanyMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const mutate = async (data: CompanyFormData) => {
    setIsLoading(true);
    try {
      // Limpar formatação dos campos
      const companyData = {
        ...data,
        phone: data.phone.replace(/\D/g, ''),
        cnpj: data.cnpj.replace(/\D/g, ''),
        address_zip: data.address_zip.replace(/\D/g, '')
      };

      const response = await companyAPI.createCompany(companyData);
      
      if (response.data.success) {
        showToast('success', 'Empresa cadastrada com sucesso!');
        // Limpar formulário ou redirecionar
        return response.data;
      } else {
        throw new Error(response.data.error || 'Erro ao cadastrar empresa');
      }
    } catch (error: any) {
      console.error('Erro ao cadastrar empresa:', error);
      
      let errorMessage = 'Erro ao cadastrar empresa';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast('error', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
};