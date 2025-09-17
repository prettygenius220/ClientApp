import { Database } from './supabase';

export type Communication = Database['public']['Tables']['communications']['Row'];
export type CommunicationInsert = Database['public']['Tables']['communications']['Insert'];

export type EmailTemplate = Database['public']['Tables']['email_templates']['Row'];
export type EmailTemplateInsert = Database['public']['Tables']['email_templates']['Insert'];

export type CommunicationType = 'email' | 'sms';
export type CommunicationStatus = 'sent' | 'delivered' | 'failed';