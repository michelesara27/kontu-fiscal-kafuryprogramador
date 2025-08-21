// src/utils/constants.ts
export const estadosBrasil = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

export const planos = [
  { value: 'free', label: 'Free', description: 'Plano gratuito' },
  { value: 'premium', label: 'Premium', description: 'Plano pago básico' },
  { value: 'enterprise', label: 'Enterprise', description: 'Plano corporativo' }
];
