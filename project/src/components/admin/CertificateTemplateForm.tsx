import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CertificateTemplateFormProps {
  courseId: string;
  onSuccess: () => void;
}

export default function CertificateTemplateForm({
  courseId,
  onSuccess
}: CertificateTemplateFormProps) {
  const [templateName, setTemplateName] = useState('');
  const [templateHtml, setTemplateHtml] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('certificate_templates')
        .insert({
          course_id: courseId,
          template_name: templateName,
          template_html: templateHtml
        });

      if (error) throw error;

      toast.success('Certificate template saved successfully');
      setTemplateName('');
      setTemplateHtml('');
      onSuccess();
    } catch (error) {
      console.error('Error saving certificate template:', error);
      toast.error('Failed to save certificate template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-indigo-600" />
        <h3 className="text-lg font-semibold">Create Certificate Template</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="templateName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Template Name
          </label>
          <input
            id="templateName"
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label 
            htmlFor="templateHtml"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Template HTML
          </label>
          <textarea
            id="templateHtml"
            value={templateHtml}
            onChange={(e) => setTemplateHtml(e.target.value)}
            rows={10}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
            required
            placeholder={`<div class="certificate">
  <h1>{{course_title}}</h1>
  <p>This certifies that</p>
  <h2>{{participant_name}}</h2>
  <p>has completed {{ce_hours}} hours of continuing education</p>
  <p>Course Number: {{certificate_number}}</p>
  <p>Instructor: {{instructor}}</p>
  <p>School: {{school_name}}</p>
</div>`}
          />
          <p className="mt-1 text-sm text-gray-500">
            Use {{variable}} syntax for dynamic content
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            'Save Template'
          )}
        </button>
      </form>
    </div>
  );
}