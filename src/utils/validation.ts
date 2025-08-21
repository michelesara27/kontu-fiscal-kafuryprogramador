 import { z } from 'zod';

export const companySchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome muito longo'),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  
  phone: z.string()
    .min(10, 'Telefone inválido')
    .max(11, 'Telefone muito longo')
    .refine(val => /^[0-9]{10,11}$/.test(val), {
      message: 'Telefone deve conter apenas números'
    }),
  
  cnpj: z.string()
    .length(14, 'CNPJ deve ter 14 dígitos')
    .refine(val => /^[0-9]{14}$/.test(val), {
      message: 'CNPJ deve conter apenas números'
    }),
  
  address_street: z.string()
    .min(3, 'Logradouro deve ter pelo menos 3 caracteres')
    .max(255, 'Logradouro muito longo'),
  
  address_neighborhood: z.string()
    .min(3, 'Bairro deve ter pelo menos 3 caracteres')
    .max(255, 'Bairro muito longo'),
  
  address_zip: z.string()
    .length(8, 'CEP deve ter 8 dígitos')
    .refine(val => /^[0-9]{8}$/.test(val), {
      message: 'CEP deve conter apenas números'
    }),
  
  address_city: z.string()
    .min(3, 'Cidade deve ter pelo menos 3 caracteres')
    .max(255, 'Cidade muito longo'),
  
  address_state: z.string()
    .length(2, 'Estado deve ter 2 caracteres')
    .refine(val => estadosBrasil.includes(val), {
      message: 'Estado inválido'
    }),
  
  plan: z.string().default('free')
});

export type CompanyFormValues = z.infer<typeof companySchema>;