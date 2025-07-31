import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { X, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Login } from './Login';
import { Register } from './Register';

const features = [
  {
    title: 'Gestão Simplificada',
    description: 'Controle todas as obrigações fiscais em um só lugar',
    icon: '📊'
  },
  {
    title: 'Alertas Inteligentes',
    description: 'Notificações automáticas para prazos importantes',
    icon: '🔔'
  },
  {
    title: 'Colaboração Eficiente',
    description: 'Compartilhamento seguro com sua equipe',
    icon: '👥'
  }
];

export const Landing = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-blue-600">Kontu</h1>
          </div>
          <Button 
            variant="primary" 
            size="md"
            onClick={() => setShowAuthModal(true)}
          >
            Entrar / Criar Conta
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Controle fiscal simplificado
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Gerencie todas as obrigações fiscais da sua empresa em um só lugar
            </p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2"
            >
              Comece agora <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg" 
              alt="Dashboard do Kontu" 
              className="rounded-xl shadow-lg w-full max-w-md mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Como o Kontu ajuda sua empresa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} padding="lg" className="hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Kontu</h3>
              <p className="text-gray-400">Soluções fiscais inteligentes para sua empresa</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Recursos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Preços</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Sobre nós</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Carreiras</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">contato@kontu.com.br</li>
                <li className="text-gray-400">+55 11 98765-4321</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Kontu. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-8">
              <div className="flex border-b mb-6">
                <button
                  className={`pb-4 px-4 font-medium ${authMode === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                  onClick={() => setAuthMode('login')}
                >
                  Entrar
                </button>
                <button
                  className={`pb-4 px-4 font-medium ${authMode === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                  onClick={() => setAuthMode('register')}
                >
                  Criar Conta
                </button>
              </div>

              {authMode === 'login' ? (
                <Login onSuccess={() => setShowAuthModal(false)} />
              ) : (
                <Register onSuccess={() => setShowAuthModal(false)} />
              )}

              <div className="mt-6 text-center text-sm text-gray-500">
                {authMode === 'login' ? (
                  <>
                    <a href="/forgot-password" className="text-blue-600 hover:underline">Esqueceu sua senha?</a>
                    <span className="mx-2">•</span>
                    <button 
                      onClick={() => setAuthMode('register')}
                      className="text-blue-600 hover:underline"
                    >
                      Criar uma conta
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setAuthMode('login')}
                    className="text-blue-600 hover:underline"
                  >
                    Já tem uma conta? Entre
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
