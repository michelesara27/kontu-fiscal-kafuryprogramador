export interface CompanyFormData {
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  address_street: string;
  address_neighborhood: string;
  address_zip: string;
  address_city: string;
  address_state: string;
  plan?: string;
}

export interface Company extends CompanyFormData {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}
