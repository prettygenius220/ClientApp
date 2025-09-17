import { useState } from 'react';
import { User, Building2, Phone, Mail, FileText } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/card';
import ClientCommunication from './ClientCommunication';
import type { Client } from '../../types/client';

interface ClientDetailsProps {
  client: Client;
}

export default function ClientDetails({ client }: ClientDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Client Info Card */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Client Details</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="font-medium">{client.name}</span>
            </div>
            {client.company && (
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-400" />
                <span>{client.company}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-400" />
                <a
                  href={`mailto:${client.email}`}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {client.email}
                </a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-400" />
                <a
                  href={`tel:${client.phone}`}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {client.phone}
                </a>
              </div>
            )}
            {client.notes && (
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-gray-400 mt-1" />
                <p className="text-gray-600 whitespace-pre-line">{client.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Communication Section */}
      <ClientCommunication client={client} />
    </div>
  );
}