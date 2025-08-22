import { z } from 'zod';

export const companySchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  cnpj: z.string().min(14, 'CNPJ deve ter 14 dígitos').max(18, 'CNPJ deve ter 14 dígitos'),
  address_street: z.string().min(3, 'Logradouro obrigatório'),
  address_neighborhood: z.string().min(2, 'Bairro obrigatório'),
  address_zip: z.string().min(8, 'CEP deve ter 8 dígitos').max(9, 'CEP deve ter 8 dígitos'),
  address_city: z.string().min(2, 'Cidade obrigatória'),
  address_state: z.string().length(2, 'Selecione um estado'),
  plan: z.enum(['free', 'premium'])
});

export const contactSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres')
});

export type CompanyFormData = z.infer<typeof companySchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
