export interface Client {
  id: number;
  company_id: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  created_at: string;
  updated_at: string;
}

export interface ClientsResponse {
  success: boolean;
  data: Client[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  };
}

export interface CreateClientData {
  name: string;
  email: string;
  phone: string;
  document: string;
}

export interface UpdateClientData extends CreateClientData {
  id: number;
}
