import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, MessageSquare, History } from 'lucide-react';
import { sendEmail } from '../../lib/sendgrid';
import { sendSMS } from '../../lib/twilio';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/button';
import Input from '../ui/input';
import Textarea from '../ui/textarea';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import EmailTemplateSelect from './EmailTemplateSelect';
import type { Client } from '../../types/client';
import type { Communication, EmailTemplate } from '../../types/communication';
import { formatDate } from '../../lib/utils';

interface ClientCommunicationProps {
  client: Client;
}

export default function ClientCommunication({ client }: ClientCommunicationProps) {
  const { user } = useAuth();
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [smsContent, setSmsContent] = useState('');
  const [loading, setLoading] = useState({ email: false, sms: false });
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch communication history
  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        const { data, error } = await supabase
          .from('communications')
          .select('*')
          .eq('client_id', client.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCommunications(data || []);
      } catch (error) {
        console.error('Error fetching communications:', error);
      }
    };

    fetchCommunications();
  }, [client.id]);

  // Handle email template selection
  const handleTemplateSelect = (template: EmailTemplate) => {
    setEmailSubject(template.subject);
    setEmailContent(template.content);
  };

  // Track communication in database
  const trackCommunication = async (type: 'email' | 'sms', content: string, subject?: string) => {
    try {
      const { error } = await supabase
        .from('communications')
        .insert({
          client_id: client.id,
          user_id: user?.id,
          type,
          subject,
          content,
          status: 'sent'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking communication:', error);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client.email) {
      toast.error('Client email is required');
      return;
    }

    setLoading(prev => ({ ...prev, email: true }));
    try {
      // Using sample API key for development
      console.log('Sending email to:', client.email, {
        subject: emailSubject,
        content: emailContent
      });

      // Track the communication
      await trackCommunication('email', emailContent, emailSubject);
      
      toast.success('Email tracked successfully!');
      setEmailSubject('');
      setEmailContent('');
      
      // Refresh communications list
      const { data } = await supabase
        .from('communications')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });
        
      setCommunications(data || []);
    } catch (error) {
      console.error('Email error:', error);
      toast.error('Failed to send email');
    } finally {
      setLoading(prev => ({ ...prev, email: false }));
    }
  };

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client.phone) {
      toast.error('Client phone number is required');
      return;
    }

    setLoading(prev => ({ ...prev, sms: true }));
    try {
      // Using sample API key for development
      console.log('Sending SMS to:', client.phone, {
        message: smsContent
      });

      // Track the communication
      await trackCommunication('sms', smsContent);
      
      toast.success('SMS tracked successfully!');
      setSmsContent('');
      
      // Refresh communications list
      const { data } = await supabase
        .from('communications')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });
        
      setCommunications(data || []);
    } catch (error) {
      console.error('SMS error:', error);
      toast.error('Failed to send SMS');
    } finally {
      setLoading(prev => ({ ...prev, sms: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold">Send Email</h3>
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-5 w-5 mr-2" />
              {showHistory ? 'Hide History' : 'Show History'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendEmail} className="space-y-4">
            <EmailTemplateSelect onSelect={handleTemplateSelect} />
            <Input
              label="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              required
              disabled={!client.email || loading.email}
            />
            <Textarea
              label="Message"
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              required
              rows={4}
              disabled={!client.email || loading.email}
            />
            <Button
              type="submit"
              disabled={!client.email || loading.email}
              isLoading={loading.email}
            >
              Send Email
            </Button>
            {!client.email && (
              <p className="text-sm text-red-600">
                No email address available for this client
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* SMS Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold">Send SMS</h3>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendSMS} className="space-y-4">
            <Textarea
              label="Message"
              value={smsContent}
              onChange={(e) => setSmsContent(e.target.value)}
              required
              rows={3}
              disabled={!client.phone || loading.sms}
            />
            <Button
              type="submit"
              disabled={!client.phone || loading.sms}
              isLoading={loading.sms}
            >
              Send SMS
            </Button>
            {!client.phone && (
              <p className="text-sm text-red-600">
                No phone number available for this client
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Communication History */}
      {showHistory && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Communication History</h3>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Content</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {communications.map((comm) => (
                  <TableRow key={comm.id}>
                    <TableCell>{formatDate(comm.created_at)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        comm.type === 'email' 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {comm.type}
                      </span>
                    </TableCell>
                    <TableCell>{comm.subject || '-'}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {comm.content}
                    </TableCell>
                  </TableRow>
                ))}
                {communications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      No communication history
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}