import axios from 'axios';
import { Company, CreateCompanyData } from '../types/company';

const API_BASE_URL = 'http://kontubd.kafuryprogramador.com.br';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const companiesService = {
  // Criar empresa
  async createCompany(companyData: CreateCompanyData) {
    const response = await api.post<{ success: boolean; data: Company }>('/companies.php', companyData);
    return response.data;
  },

  // Verificar CNPJ
  async checkCNPJ(cnpj: string) {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    const response = await api.get<{ success: boolean; exists: boolean }>(`/companies.php?cnpj=${cleanCNPJ}`);
    return response.data;
  },

  // Buscar endereço por CEP (ViaCEP)
  async getAddressByCEP(cep: string) {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return null;
    
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  }
};
