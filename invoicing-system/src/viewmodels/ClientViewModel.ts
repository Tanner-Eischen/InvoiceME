'use client';

import { useState, useCallback } from 'react';
import { clientAPI } from '@/lib/api';
import { Client, CreateClientDto, UpdateClientDto } from '@/models/Client';
import { toast } from 'sonner';

export const useClientViewModel = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all clients
  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await clientAPI.getAll();
      setClients(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      toast.error('Failed to load clients');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch a client by ID
  const fetchClientById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await clientAPI.getById(id);
      setSelectedClient(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch client');
      toast.error('Failed to load client details');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search clients by name
  const searchClients = useCallback(async (name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await clientAPI.search(name);
      setClients(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search clients');
      toast.error('Search failed');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new client
  const createClient = useCallback(async (clientData: CreateClientDto) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await clientAPI.create(clientData);
      setClients(prev => [...prev, data]);
      toast.success('Client created successfully');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
      toast.error('Failed to create client');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing client
  const updateClient = useCallback(async (id: string, clientData: UpdateClientDto) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await clientAPI.update(id, clientData);
      setClients(prev => prev.map(client => client.id === id ? data : client));
      setSelectedClient(data);
      toast.success('Client updated successfully');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client');
      toast.error('Failed to update client');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a client
  const deleteClient = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await clientAPI.delete(id);
      setClients(prev => prev.filter(client => client.id !== id));
      if (selectedClient?.id === id) {
        setSelectedClient(null);
      }
      toast.success('Client deleted successfully');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
      toast.error('Failed to delete client');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedClient]);

  return {
    clients,
    selectedClient,
    isLoading,
    error,
    fetchClients,
    fetchClientById,
    searchClients,
    createClient,
    updateClient,
    deleteClient
  };
};
