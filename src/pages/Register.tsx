// src/pages/Register.tsx
import { useForm, useController, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySchema, CompanyFormValues } from '../utils/validation';
import { masks } from '../utils/masks';
import { estadosBrasil } from '../utils/constants';
import { useCepApi } from '../hooks/useCepApi';
import { useCompanyMutation } from '../hooks/useCompanyMutation';
import { Input } from '../components/ui/Form/Input';
import { Select } from '../components/ui/Form/Select';
import { Button } from '../components/ui/Form/Button';
import { useEffect } from 'react';

import { TestForm } from '../components/TestForm';

const { control, handleSubmit, formState, watch, setValue, trigger } = useForm<CompanyFormValues>({
  resolver: zodResolver(companySchema),
  mode: 'onChange',
  defaultValues: {
    plan: 'free',
    name: '',
    email: '',
    phone: '',
    cnpj: '',
    address_street: '',
    address_neighborhood: '',
    address_zip: '',
    address_city: '',
    address_state: ''
  }
});
  
  const { fetchAddress, loading: cepLoading } = useCepApi();
  const { mutate, isLoading } = useCompanyMutation();
  
  // Watch all fields for debugging
  const formValues = watch();
  
  // Debug: log form state
		useEffect(() => {
		  console.log('=== DEBUG FORM STATE ===');
		  console.log('isValid:', formState.isValid);
		  console.log('isDirty:', formState.isDirty);
		  console.log('errors:', formState.errors);
		  
		  // Log cada campo individualmente
		  const fields = [
		    'name', 'email', 'phone', 'cnpj', 
		    'address_street', 'address_neighborhood', 
		    'address_zip', 'address_city', 'address_state'
		  ];
		  
		  fields.forEach(field => {
		    const value = formValues[field as keyof CompanyFormValues];
		    const error = formState.errors[field as keyof CompanyFormValues];
		    console.log(`${field}:`, value, '| error:', error?.message);
		  });
		}, [formState, formValues]);

    const handleCepBlur = async () => {
    const cepValue = formValues.address_zip;
    if (!cepValue) return;
    
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    
    const address = await fetchAddress(cleanCep);
    if (address) {
      setValue('address_street', address.street, { shouldValidate: true });
      setValue('address_neighborhood', address.neighborhood, { shouldValidate: true });
      setValue('address_city', address.city, { shouldValidate: true });
      setValue('address_state', address.state, { shouldValidate: true });
    } else {
      setError('address_zip', { 
        message: 'CEP não encontrado' 
      }, { shouldFocus: true });
    }
  };

	// Substitua as funções de máscara por estas versões corrigidas
	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	  const rawValue = e.target.value.replace(/\D/g, '');
	  const formatted = masks.phone(rawValue);
	  setValue('phone', formatted, { shouldValidate: true });
	};
	
	const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	  const rawValue = e.target.value.replace(/\D/g, '');
	  const formatted = masks.cnpj(rawValue);
	  setValue('cnpj', formatted, { shouldValidate: true });
	};
	
	const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	  const rawValue = e.target.value.replace(/\D/g, '');
	  const formatted = masks.cep(rawValue);
	  setValue('address_zip', formatted, { shouldValidate: true });
	};	

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      await mutate(data);
      reset();
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

  // Função para forçar validação quando campos mudam
  useEffect(() => {
    const subscription = watch(() => trigger());
    return () => subscription.unsubscribe();
  }, [watch, trigger]);

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

          {/* Debug info */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Debug:</strong> isValid: {formState.isValid ? 'true' : 'false'} | 
              Errors: {Object.keys(formState.errors).length}
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
                  onChange={(e) => {
                    setValue('name', e.target.value, { shouldValidate: true });
                  }}
                />
                
                <Input
                  label="Email *"
                  type="email"
                  {...register('email')}
                  error={formState.errors.email?.message}
                  placeholder="email@empresa.com"
                  onChange={(e) => {
                    setValue('email', e.target.value, { shouldValidate: true });
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
							<Controller
							  name="phone"
							  control={control}
							  render={({ field, fieldState }) => (
							    <Input
							      label="Telefone *"
							      value={field.value}
							      onChange={(e) => {
							        const rawValue = e.target.value.replace(/\D/g, '');
							        const formatted = masks.phone(rawValue);
							        field.onChange(formatted);
							      }}
							      error={fieldState.error?.message}
							      placeholder="(11) 99999-9999"
							    />
							  )}
							/>
                
							<Controller
							  name="cnpj"
							  control={control}
							  render={({ field, fieldState }) => (
							    <Input
							      label="CNPJ *"
							      value={field.value}
							      onChange={(e) => {
							        const rawValue = e.target.value.replace(/\D/g, '');
							        const formatted = masks.cnpj(rawValue);
							        field.onChange(formatted);
							      }}
							      error={fieldState.error?.message}
							      placeholder="00.000.000/0000-00"
							    />
							  )}
							/>

            {/* Endereço */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Endereço
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<Input
								  label="CEP *"
								  value={formValues.address_zip || ''}
								  onChange={handleCepChange}
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
                  onChange={(e) => {
                    setValue('address_state', e.target.value, { shouldValidate: true });
                  }}
                />
              </div>

              <Input
                label="Logradouro *"
                {...register('address_street')}
                error={formState.errors.address_street?.message}
                placeholder="Rua, Avenida, etc."
                className="mt-4"
                onChange={(e) => {
                  setValue('address_street', e.target.value, { shouldValidate: true });
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Bairro *"
                  {...register('address_neighborhood')}
                  error={formState.errors.address_neighborhood?.message}
                  placeholder="Nome do bairro"
                  onChange={(e) => {
                    setValue('address_neighborhood', e.target.value, { shouldValidate: true });
                  }}
                />
                
                <Input
                  label="Cidade *"
                  {...register('address_city')}
                  error={formState.errors.address_city?.message}
                  placeholder="Nome da cidade"
                  onChange={(e) => {
                    setValue('address_city', e.target.value, { shouldValidate: true });
                  }}
                />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Dica:</strong> Preencha todos os campos obrigatórios (*) para habilitar o botão.
                {!formState.isValid && ' Verifique se todos os campos estão preenchidos corretamente.'}
              </p>
            </div>

            <Button
              type="submit"
              loading={isLoading}
              disabled={!formState.isValid || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar Empresa'}
            </Button>

            {/* Mostrar erros específicos */}
            {Object.keys(formState.errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Corrija os seguintes erros:
                </h3>
                <ul className="text-sm text-red-700 list-disc list-inside">
                  {Object.entries(formState.errors).map(([field, error]) => (
                    <li key={field}>
                      {field}: {error?.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
		<TestForm />
  );
};
