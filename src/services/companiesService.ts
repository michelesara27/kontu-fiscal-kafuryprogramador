import axios from 'axios';

const API_BASE_URL = 'http://kontubd.kafuryprogramador.com.br/';

export const companiesService = {
  createCompany: (data: CompanyFormData) => 
    axios.post(`${API_BASE_URL}companies.php`, data),
  
  checkCnpj: (cnpj: string) => 
    axios.get(`${API_BASE_URL}companies.php?cnpj=${cnpj}`),
  
  getCompany: (id: number) => 
    axios.get(`${API_BASE_URL}companies.php?id=${id}`)
};