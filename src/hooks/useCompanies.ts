import { useMutation, useQuery } from '@tanstack/react-query';
import { companiesService } from '../services/companiesService';
import { CreateCompanyData } from '../types/company';

export const useCreateCompany = () => {
  return useMutation({
    mutationFn: (companyData: CreateCompanyData) => companiesService.createCompany(companyData),
  });
};

export const useCheckCNPJ = (cnpj: string) => {
  return useQuery({
    queryKey: ['checkCNPJ', cnpj],
    queryFn: () => companiesService.checkCNPJ(cnpj),
    enabled: cnpj.replace(/\D/g, '').length === 14,
    staleTime: 0,
  });
};
