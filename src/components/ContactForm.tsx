import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/Form/Input';
import { Button } from './ui/Form/Button';
import { contactSchema, ContactFormData } from '../utils/validation';

export const ContactForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('https://eo8dzc8medtbpo4.m.pipedream.net', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        reset();
      } else {
        alert('Erro ao enviar mensagem. Tente novamente.');
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Mensagem Enviada!
          </h2>
          <p className="text-gray-600 mb-6">
            Obrigado pelo seu contato. Retornaremos em breve.
          </p>
          <Button
            onClick={() => setSubmitSuccess(false)}
            variant="primary"
          >
            Enviar Nova Mensagem
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Entre em Contato
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome"
          type="text"
          placeholder="Seu nome completo"
          error={errors.name?.message}
          {...register('name')}
        />
        
        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensagem
          </label>
          <textarea
            className={`
              w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              min-h-[120px] resize-vertical
              ${errors.message ? 'border-red-300' : 'border-gray-300'}
            `}
            placeholder="Digite sua mensagem aqui..."
            {...register('message')}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
        </div>

        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          variant="primary"
        >
          {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
        </Button>
      </form>
    </div>
  );
};
