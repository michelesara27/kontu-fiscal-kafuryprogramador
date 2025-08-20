import React, { useState } from 'react';
import { CompanyRegistrationForm } from '../components/CompanyRegistrationForm';
import { Card } from '../components/ui/Card';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const CompanyRegistration: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSuccess = () => {
    setIsSuccess(true);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card padding="lg" className="max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Empresa Cadastrada!</h2>
          <p className="text-gray-600 mb-6">
            Sua empresa foi cadastrada com sucesso. Você pode começar a usar o sistema.
          </p>
          <Button onClick={() => navigate('/dashboard')} variant="primary">
            Ir para o Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={handleBack}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <CompanyRegistrationForm onSuccess={handleSuccess} onCancel={handleBack} />
      </div>
    </div>
  );
};
