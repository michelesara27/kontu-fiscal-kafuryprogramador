// src/pages/Register.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySchema, CompanyFormValues } from '../utils/validation';
import { masks } from '../utils/masks';
import { estadosBrasil } from '../utils/constants';
import { useCepApi } from '../hooks/useCepApi';
import { useCompanyMutation } from '../hooks/useCompanyMutation';
import { Input } from '../components/ui/Form/Input';
import { Select } from '../components/ui/Form/Select';
import { Button } from '../components/ui/Button';

export const Register = () => {
  const { 
    register, 
    handleSubmit, 
    formState, 
    setValue, 
    watch, 
    setError,
    reset
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      plan: 'free'
    }
  });
  
  const { fetchAddress, loading: cepLoading } = useCepApi();
  const { mutate, isLoading } = useCompanyMutation();
  const cepValue = watch('address_zip');

  const handleCepBlur = async () => {
    if (!cepValue) return;
    
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    
    const address = await fetchAddress(cleanCep);
    if (address) {
      setValue('address_street', address.street);
      setValue('address_neighborhood', address.neighborhood);
      setValue('address_city', address.city);
      setValue('address_state', address.state);
    } else {
      setError('address_zip', { 
        message: 'CEP não encontrado' 
      });
    }
  };

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      await mutate(data);
      // Limpar formulário após sucesso
      reset();
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cadastro de Empresa
            </h1>
            <p className="text-gray-600">
              Preencha os dados da sua empresa para começar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados Básicos */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Dados da Empresa
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome da Empresa *"
                  {...register('name')}
                  error={formState.errors.name?.message}
                  placeholder="Digite o nome da empresa"
                />
                
                <Input
                  label="Email *"
                  type="email"
                  {...register('email')}
                  error={formState.errors.email?.message}
                  placeholder="email@empresa.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Telefone *"
                  {...register('phone')}
                  onChange={(e) => {
                    setValue('phone', masks.phone(e.target.value));
                  }}
                  error={formState.errors.phone?.message}
                  placeholder="(11) 99999-9999"
                />
                
                <Input
                  label="CNPJ *"
                  {...register('cnpj')}
                  onChange={(e) => {
                    setValue('cnpj', masks.cnpj(e.target.value));
                  }}
                  error={formState.errors.cnpj?.message}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Endereço
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="CEP *"
                  {...register('address_zip')}
                  onChange={(e) => {
                    setValue('address_zip', masks.cep(e.target.value));
                  }}
                  onBlur={handleCepBlur}
                  error={formState.errors.address_zip?.message}
                  loading={cepLoading}
                  placeholder="00000-000"
                />
                
                <Select
                  label="Estado *"
                  {...register('address_state')}
                  options={estadosBrasil.map(uf => ({ value: uf, label: uf }))}
                  error={formState.errors.address_state?.message}
                  placeholder="Selecione o estado"
                />
              </div>

              <Input
                label="Logradouro *"
                {...register('address_street')}
                error={formState.errors.address_street?.message}
                placeholder="Rua, Avenida, etc."
                className="mt-4"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Bairro *"
                  {...register('address_neighborhood')}
                  error={formState.errors.address_neighborhood?.message}
                  placeholder="Nome do bairro"
                />
                
                <Input
                  label="Cidade *"
                  {...register('address_city')}
                  error={formState.errors.address_city?.message}
                  placeholder="Nome da cidade"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={isLoading}
              disabled={!formState.isValid || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium"
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar Empresa'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};