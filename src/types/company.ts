export interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  address_street: string;
  address_neighborhood: string;
  address_zip: string;
  address_city: string;
  address_state: string;
  plan: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyData {
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  address_street: string;
  address_neighborhood: string;
  address_zip: string;
  address_city: string;
  address_state: string;
  plan: 'free' | 'premium';
}

export interface AddressData {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}
