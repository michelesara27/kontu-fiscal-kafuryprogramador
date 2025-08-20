import React, { useState } from 'react';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '../hooks/useClients';
import { Client, CreateClientData } from '../types/client';
import { ClientsTable } from '../components/ClientsTable';
import { ClientForm } from '../components/ClientForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Plus, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Clients: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const { data, isLoading, refetch } = useClients(page, search, sortBy, sortOrder);
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  const clients = data?.data || [];
  const pagination = data?.pagination;

  const handleCreate = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleView = (client: Client) => {
    // Implementar visualização de detalhes
    console.log('View client:', client);
  };

  const handleSubmit = (formData: CreateClientData) => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-2">
            Gerencie todos os clientes do seu escritório
          </p>
        </div>
        <Button onClick={handleCreate} variant="primary">
          <Plus className="w-5 h-5 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total de Clientes</p>
            <p className="text-2xl font-bold text-gray-900">{pagination?.total_items || 0}</p>
          </div>
        </div>
      </Card>

      {/* Clients Table */}
      <Card padding="lg">
        <ClientsTable
          clients={clients}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          isLoading={isLoading}
          currentPage={page}
          totalPages={pagination?.total_pages || 1}
          onPageChange={setPage}
          onSearch={setSearch}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </Card>

      {/* Client Form Modal */}
      {isFormOpen && (
        <ClientForm
          client={editingClient || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingClient(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
};
