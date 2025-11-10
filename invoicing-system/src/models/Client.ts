export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateClientDto = {
  name: string;
  email: string;
  phone?: string;
  address: string;
};

export type UpdateClientDto = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
};
