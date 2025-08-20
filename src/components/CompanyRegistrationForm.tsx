import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCompany, useCheckCNPJ } from '../hooks/useCompanies';
import { companiesService } from '../services/companiesService';
import { CreateCompanyData, AddressData } from '../types/company';
import { brazilianStates } from '../data/brazilianStates';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Loader2, MapPin, Building2, AlertCircle, CheckCircle } from 'lucide-react';

const companySchema = z.object({
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

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CompanyRegistrationForm: React.FC<CompanyRegistrationFormProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [cnpjStatus, setCnpjStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      plan: 'free'
    }
  });

  const createMutation = useCreateCompany();
  const cnpjValue = watch('cnpj');
  const cepValue = watch('address_zip');

  const cnpjCheck = useCheckCNPJ(cnpjValue);

  // Verificar CNPJ em tempo real
  useEffect(() => {
    const checkCNPJ = async () => {
      const cleanCNPJ = cnpjValue?.replace(/\D/g, '');
      if (cleanCNPJ?.length === 14) {
        setCnpjStatus('checking');
        const isValid = await trigger('cnpj');
        if (isValid) {
          const { data } = await cnpjCheck.refetch();
          if (data?.exists) {
            setCnpjStatus('invalid');
          } else {
            setCnpjStatus('valid');
          }
        } else {
          setCnpjStatus('invalid');
        }
      } else {
        setCnpjStatus('idle');
      }
    };

    const timeoutId = setTimeout(checkCNPJ, 500);
    return () => clearTimeout(timeoutId);
  }, [cnpjValue, trigger]);

  // Buscar endereço por CEP
  useEffect(() => {
    const fetchAddress = async () => {
      const cleanCEP = cepValue?.replace(/\D/g, '');
      if (cleanCEP?.length === 8) {
        setIsLoadingCEP(true);
        const addressData = await companiesService.getAddressByCEP(cleanCEP);
        
        if (addressData && !addressData.erro) {
          setValue('address_street', addressData.logradouro);
          setValue('address_neighborhood', addressData.bairro);
          setValue('address_city', addressData.localidade);
          setValue('address_state', addressData.uf);
        }
        setIsLoadingCEP(false);
      }
    };

    const timeoutId = setTimeout(fetchAddress, 800);
    return () => clearTimeout(timeoutId);
  }, [cepValue, setValue]);

  const formatCNPJ = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 14) {
      return cleanValue
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 18);
    }
    return cleanValue.slice(0, 14);
  };

  const formatPhone = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 11) {
      return cleanValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15);
    }
    return cleanValue.slice(0, 11);
  };

  const formatCEP = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 8) {
      return cleanValue
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 9);
    }
    return cleanValue.slice(0, 8);
  };

  const onSubmit = async (data: CompanyFormData) => {
    const companyData: CreateCompanyData = {
      ...data,
      cnpj: data.cnpj.replace(/\D/g, ''),
      phone: data.phone.replace(/\D/g, ''),
      address_zip: data.address_zip.replace(/\D/g, '')
    };

    createMutation.mutate(companyData, {
      onSuccess: () => {
        onSuccess?.();
      }
    });
  };

  const getCnpjStatusIcon = () => {
    switch (cnpjStatus) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'invalid':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card padding="lg">
      <div className="flex items-center mb-6">
        <Building2 className="w-8 h-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Cadastro da Empresa</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome da Empresa *"
            {...register('name')}
            error={errors.name?.message}
            placeholder="Digite o nome completo da empresa"
          />

          <Input
            label="Email *"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="empresa@email.com"
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              CNPJ *
              {cnpjValue && (
                <span className="ml-2 inline-flex items-center">
                  {getCnpjStatusIcon()}
                </span>
              )}
            </label>
            <input
              {...register('cnpj')}
              onChange={(e) => {
                const formatted = formatCNPJ(e.target.value);
                e.target.value = formatted;
                register('cnpj').onChange(e);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="00.000.000/0000-00"
            />
            {errors.cnpj && (
              <p className="text-sm text-red-600">{errors.cnpj.message}</p>
            )}
            {cnpjStatus === 'invalid' && cnpjValue?.replace(/\D/g, '').length === 14 && (
              <p className="text-sm text-red-600">CNPJ já cadastrado ou inválido</p>
            )}
          </div>

          <Input
            label="Telefone *"
            {...register('phone')}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value);
              e.target.value = formatted;
              register('phone').onChange(e);
            }}
            error={errors.phone?.message}
            placeholder="(11) 99999-9999"
          />
        </div>

        {/* Endereço */}
        <div className="border-t pt-6">
          <div className="flex items-center mb-4">
            <MapPin className="w-6 h-6 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <Input
                label="CEP *"
                {...register('address_zip')}
                onChange={(e) => {
                  const formatted = formatCEP(e.target.value);
                  e.target.value = formatted;
                  register('address_zip').onChange(e);
                }}
                error={errors.address_zip?.message}
                placeholder="00000-000"
                suffix={isLoadingCEP && <Loader2 className="w-4 h-4 animate-spin" />}
              />
            </div>

            <div className="md:col-span-3">
              <Input
                label="Logradouro *"
                {...register('address_street')}
                error={errors.address_street?.message}
                placeholder="Rua, Avenida, etc."
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Bairro *"
                {...register('address_neighborhood')}
                error={errors.address_neighborhood?.message}
                placeholder="Nome do bairro"
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Cidade *"
                {...register('address_city')}
                error={errors.address_city?.message}
                placeholder="Nome da cidade"
              />
            </div>

            <div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Estado *</label>
                <select
                  {...register('address_state')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Selecione</option>
                  {brazilianStates.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
                {errors.address_state && (
                  <p className="text-sm text-red-600">{errors.address_state.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Plano */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plano</h3>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                {...register('plan')}
                value="free"
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Free</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                {...register('plan')}
                value="premium"
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Premium</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={createMutation.isPending}
            disabled={cnpjStatus === 'invalid' || cnpjStatus === 'checking'}
          >
            Cadastrar Empresa
          </Button>
        </div>
      </form>
    </Card>
  );
};
