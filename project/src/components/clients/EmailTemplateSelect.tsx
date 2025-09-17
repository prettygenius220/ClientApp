import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import Select from '../ui/select';
import type { EmailTemplate } from '../../types/communication';

interface EmailTemplateSelectProps {
  onSelect: (template: EmailTemplate) => void;
}

export default function EmailTemplateSelect({ onSelect }: EmailTemplateSelectProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .order('name');

        if (error) throw error;
        setTemplates(data || []);
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast.error('Failed to load email templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = templates.find(t => t.id === e.target.value);
    if (template) {
      onSelect(template);
    }
  };

  if (loading) {
    return <div>Loading templates...</div>;
  }

  return (
    <Select
      label="Email Template"
      options={[
        { value: '', label: 'Select a template...' },
        ...templates.map(template => ({
          value: template.id,
          label: template.name
        }))
      ]}
      onChange={handleTemplateChange}
    />
  );
}