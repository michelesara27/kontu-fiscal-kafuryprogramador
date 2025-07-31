import React from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { 
  FileText, 
  Users, 
  Bell, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Clock
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Clientes Ativos',
      value: '127',
      change: '+12%',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Obrigações Pendentes',
      value: '23',
      change: '-8%',
      icon: FileText,
      color: 'orange'
    },
    {
      title: 'Vencendo Hoje',
      value: '5',
      change: '+2',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Concluídas este mês',
      value: '89',
      change: '+15%',
      icon: CheckCircle,
      color: 'green'
    }
  ];

  const recentObligations = [
    { client: 'ABC Construções Ltda', obligation: 'DCTF Web', dueDate: '2025-01-20', status: 'pending' },
    { client: 'XYZ Comércio', obligation: 'DAS MEI', dueDate: '2025-01-22', status: 'completed' },
    { client: 'Tech Solutions', obligation: 'DEFIS', dueDate: '2025-01-25', status: 'pending' },
    { client: 'Padaria do João', obligation: 'PGDAS-D', dueDate: '2025-01-28', status: 'overdue' }
  ];

  const upcomingReminders = [
    { client: 'ABC Construções Ltda', message: 'DCTF Web vence em 2 dias', type: 'warning' },
    { client: 'Loja da Maria', message: 'Documentos pendentes há 5 dias', type: 'danger' },
    { client: 'Consultoria Beta', message: 'Reunião agendada para amanhã', type: 'info' }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Visão geral das obrigações fiscais e atividades do escritório
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} este mês
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  stat.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                  stat.color === 'red' ? 'bg-red-100 text-red-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Obligations */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Obrigações Recentes</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {recentObligations.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.client}</p>
                    <p className="text-sm text-gray-600">{item.obligation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{item.dueDate}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status === 'completed' ? 'Concluída' :
                       item.status === 'overdue' ? 'Atrasada' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Reminders */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Lembretes Próximos</h2>
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {upcomingReminders.map((reminder, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-1 rounded-full mt-1 ${
                    reminder.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    reminder.type === 'danger' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {reminder.type === 'warning' ? 
                      <AlertTriangle className="w-4 h-4" /> :
                      reminder.type === 'danger' ?
                      <Clock className="w-4 h-4" /> :
                      <Bell className="w-4 h-4" />
                    }
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{reminder.client}</p>
                    <p className="text-sm text-gray-600">{reminder.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <Users className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Novo Cliente</p>
                <p className="text-sm text-gray-600">Cadastrar novo cliente</p>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <FileText className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Nova Obrigação</p>
                <p className="text-sm text-gray-600">Adicionar obrigação fiscal</p>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Relatórios</p>
                <p className="text-sm text-gray-600">Ver relatórios gerenciais</p>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
