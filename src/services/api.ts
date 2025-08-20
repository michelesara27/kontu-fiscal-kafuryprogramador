import axios from 'axios';
import { Client, ClientsResponse, CreateClientData, UpdateClientData } from '../types/client';

const API_BASE_URL = 'http://kontubd.kafuryprogramador.com.br';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const clientService = {
  // Listar clientes com paginação
  async getClients(page: number = 1, search: string = '', sortBy: string = 'name', sortOrder: 'asc' | 'desc' = 'asc') {
    const params = new URLSearchParams({
      page: page.toString(),
      ...(search && { search }),
      sort_by: sortBy,
      sort_order: sortOrder,
    });

    const response = await api.get<ClientsResponse>(`/clients.php?${params}`);
    return response.data;
  },

  // Buscar cliente por ID
  async getClientById(id: number) {
    const response = await api.get<{ success: boolean; data: Client }>(`/clients.php?id=${id}`);
    return response.data;
  },

  // Criar cliente
  async createClient(clientData: CreateClientData) {
    const response = await api.post<{ success: boolean; data: Client }>('/clients.php', clientData);
    return response.data;
  },

  // Atualizar cliente
  async updateClient(id: number, clientData: CreateClientData) {
    const response = await api.put<{ success: boolean; data: Client }>(`/clients.php?id=${id}`, clientData);
    return response.data;
  },

  // Deletar cliente
  async deleteClient(id: number) {
    const response = await api.delete<{ success: boolean; message: string }>(`/clients.php?id=${id}`);
    return response.data;
  },
};
