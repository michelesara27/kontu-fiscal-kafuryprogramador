import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fantasyName: '',
    email: '',
    phone: '',
    cnpj: '',
    street: '',
    neighborhood: '',
    zipCode: '',
    city: '',
    state: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fantasyName) newErrors.fantasyName = 'Nome Fantasia é obrigatório';
    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    if (!formData.phone) newErrors.phone = 'Telefone é obrigatório';
    if (!formData.cnpj) newErrors.cnpj = 'CNPJ é obrigatório';
    if (!formData.street) newErrors.street = 'Logradouro é obrigatório';
    if (!formData.neighborhood) newErrors.neighborhood = 'Bairro é obrigatório';
    if (!formData.zipCode) newErrors.zipCode = 'CEP é obrigatório';
    if (!formData.city) newErrors.city = 'Cidade é obrigatória';
    if (!formData.state) newErrors.state = 'Estado é obrigatório';
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
		console.log('enviando formulario ...');
    
    if (!validateForm()) return;
    
    setLoading(true);
		console.log('setLoading true ...');
    try {
      const success = await register({
        fantasyName: formData.fantasyName,
        email: formData.email,
        phone: formData.phone,
        cnpj: formData.cnpj,
        address: {
          street: formData.street,
          neighborhood: formData.neighborhood,
          zipCode: formData.zipCode,
          city: formData.city,
          state: formData.state
        },
        password: formData.password
      });
      
      if (!success) {
        setErrors({ general: 'Erro ao criar conta. Tente novamente.' });
				console.log('erro ao criar conta ...');
      }
    } catch (error) {
      setErrors({ general: 'Erro ao criar conta. Tente novamente.' });
			console.log('erro ao criar conta ...');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Kontu</h1>
          <p className="text-gray-600">Crie sua conta e cadastre seu escritório</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">
              Cadastrar Empresa
            </h2>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* Dados da Empresa */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Dados da Empresa
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome Fantasia"
                  name="fantasyName"
                  value={formData.fantasyName}
                  onChange={handleChange}
                  error={errors.fantasyName}
                  required
                  placeholder="Escritório Contábil XYZ"
                />
                
                <Input
                  label="CNPJ"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  error={errors.cnpj}
                  required
                  placeholder="12.345.678/0001-90"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="E-mail"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  placeholder="contato@escritorio.com"
                />
                
                <Input
                  label="Telefone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Endereço
              </h3>
              
              <Input
                label="Logradouro"
                name="street"
                value={formData.street}
                onChange={handleChange}
                error={errors.street}
                required
                placeholder="Rua das Flores, 123"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Bairro"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  error={errors.neighborhood}
                  required
                  placeholder="Centro"
                />
                
                <Input
                  label="CEP"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  error={errors.zipCode}
                  required
                  placeholder="12345-678"
                />
                
                <Input
                  label="Estado"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  error={errors.state}
                  required
                  placeholder="SP"
                />
              </div>

              <Input
                label="Cidade"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                required
                placeholder="São Paulo"
              />
            </div>

            {/* Senha */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Acesso
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Senha"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  placeholder="••••••••"
                />
                
                <Input
                  label="Confirmar Senha"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Criar Conta e Empresa
            </Button>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
