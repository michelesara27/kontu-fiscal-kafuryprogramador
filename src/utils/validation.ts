// src/utils/validation.ts
import { z } from 'zod';

export const companySchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome muito longo')
    .transform(val => val.trim()),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .transform(val => val.trim().toLowerCase()),
  
  phone: z.string()
    .min(1, 'Telefone é obrigatório')
    .refine(val => {
      const cleanPhone = val.replace(/\D/g, '');
      return cleanPhone.length >= 10 && cleanPhone.length <= 11;
    }, 'Telefone deve ter 10 ou 11 dígitos')
    .transform(val => val.replace(/\D/g, '')),
  
  cnpj: z.string()
    .min(1, 'CNPJ é obrigatório')
    .refine(val => {
      const cleanCnpj = val.replace(/\D/g, '');
      return cleanCnpj.length === 14;
    }, 'CNPJ deve ter 14 dígitos')
    .transform(val => val.replace(/\D/g, '')),
  
  address_street: z.string()
    .min(3, 'Logradouro deve ter pelo menos 3 caracteres')
    .max(255, 'Logradouro muito longo')
    .transform(val => val.trim()),
  
  address_neighborhood: z.string()
    .min(3, 'Bairro deve ter pelo menos 3 caracteres')
    .max(255, 'Bairro muito longo')
    .transform(val => val.trim()),
  
  address_zip: z.string()
    .min(1, 'CEP é obrigatório')
    .refine(val => {
      const cleanCep = val.replace(/\D/g, '');
      return cleanCep.length === 8;
    }, 'CEP deve ter 8 dígitos')
    .transform(val => val.replace(/\D/g, '')),
  
  address_city: z.string()
    .min(3, 'Cidade deve ter pelo menos 3 caracteres')
    .max(255, 'Cidade muito longo')
    .transform(val => val.trim()),
  
  address_state: z.string()
    .length(2, 'Estado deve ter 2 caracteres')
    .refine(val => estadosBrasil.includes(val), {
      message: 'Estado inválido'
    })
    .transform(val => val.toUpperCase().trim()),
  
  plan: z.string().default('free')
});

export type CompanyFormValues = z.infer<typeof companySchema>;
