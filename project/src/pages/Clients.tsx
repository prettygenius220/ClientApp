import { useState } from 'react';
import ClientForm from '../components/clients/ClientForm';
import ClientList from '../components/clients/ClientList';
import ClientDetails from '../components/clients/ClientDetails';
import type { Client } from '../types/client';

export default function Clients() {
  const [key, setKey] = useState(0);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Client Management
        </h1>
        <p className="text-gray-600">
          Manage your client information and communications
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <ClientForm onSuccess={() => {
            setKey(prev => prev + 1);
            setSelectedClient(null);
          }} />
        </div>
        <div className="md:col-span-2 space-y-6">
          {selectedClient ? (
            <ClientDetails client={selectedClient} />
          ) : (
            <ClientList
              key={key}
              onSelectClient={setSelectedClient}
            />
          )}
        </div>
      </div>
    </div>
  );
}