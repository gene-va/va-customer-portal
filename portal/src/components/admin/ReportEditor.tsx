'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Upload, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface Report {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  report_data: Record<string, unknown>;
}

export default function ReportEditor({ report }: { report: Report }) {
  const [title, setTitle] = useState(report.title);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(
    report.status
  );
  const [reportJson, setReportJson] = useState(
    JSON.stringify(report.report_data, null, 2)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [jsonError, setJsonError] = useState('');

  const validateJSON = (json: string): boolean => {
    try {
      JSON.parse(json);
      setJsonError('');
      return true;
    } catch (err) {
      setJsonError((err as Error).message);
      return false;
    }
  };

  const handleJsonChange = (value: string) => {
    setReportJson(value);
    if (value.trim()) {
      validateJSON(value);
    }
  };

  const handleSave = async () => {
    // Validate JSON
    if (!validateJSON(reportJson)) {
      return;
    }

    setIsSaving(true);

    try {
      const reportData = JSON.parse(reportJson);

      const response = await fetch('/api/reports/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_id: report.id,
          title,
          status,
          report_data: reportData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to save report');
        setIsSaving(false);
        return;
      }

      toast.success('Report saved successfully');
      setIsSaving(false);
    } catch (err) {
      toast.error('An error occurred while saving');
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metadata Card */}
      <Card>
        <h3 className="text-lg font-semibold text-va-text mb-6">
          Report Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block mb-2 text-sm font-medium text-va-text-secondary">
              Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as 'draft' | 'published' | 'archived')
              }
              className="w-full px-4 py-2 border border-va-border rounded-lg focus:ring-2 focus:ring-va-accent/30 focus:border-va-accent/50 transition-colors"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </Card>

      {/* JSON Editor */}
      <Card>
        <h3 className="text-lg font-semibold text-va-text mb-6">
          Report Data (JSON)
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-va-text-secondary">
              JSON Content
            </label>
            <textarea
              value={reportJson}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={`w-full h-96 px-4 py-3 font-mono text-sm border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                jsonError
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-va-border focus:ring-va-accent'
              }`}
              placeholder="Enter valid JSON..."
            />
            {jsonError && (
              <p className="mt-2 text-sm text-red-600">
                JSON Error: {jsonError}
              </p>
            )}
          </div>

          <div className="bg-va-blue/10 border border-va-blue/25 rounded-lg p-4">
            <p className="text-sm text-va-blue">
              Edit the JSON data directly or upload a new JSON file below.
            </p>
          </div>
        </div>
      </Card>

      {/* File Upload */}
      <Card>
        <h3 className="text-lg font-semibold text-va-text mb-6">
          Upload Report Data
        </h3>

        <div className="relative">
          <div
            className="border-2 border-dashed border-va-border rounded-lg p-8 text-center hover:border-va-accent/50 transition-colors cursor-pointer"
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'rgb(79, 70, 229)';
              e.currentTarget.style.backgroundColor = 'rgb(239, 246, 255)';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgb(209, 213, 219)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'rgb(209, 213, 219)';
              e.currentTarget.style.backgroundColor = 'transparent';

              const files = e.dataTransfer.files;
              if (files.length > 0) {
                const file = files[0];
                if (file.type === 'application/json' || file.name.endsWith('.json')) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const content = event.target?.result as string;
                    try {
                      JSON.parse(content);
                      setReportJson(JSON.stringify(JSON.parse(content), null, 2));
                      toast.success('JSON file loaded successfully');
                    } catch (err) {
                      toast.error('Invalid JSON file');
                    }
                  };
                  reader.readAsText(file);
                } else {
                  toast.error('Please upload a .json file');
                }
              }
            }}
            onClick={(e) => {
              const input = document.getElementById(`json-file-input-${report.id}`) as HTMLInputElement;
              if (input) input.click();
            }}
          >
            <Upload className="mx-auto mb-3 text-va-text-muted" size={32} />
            <p className="text-va-text-secondary font-medium">
              Drag and drop a JSON file here
            </p>
            <p className="text-va-text-secondary text-sm mt-1">or click to select a file</p>
          </div>
          <input
            id={`json-file-input-${report.id}`}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const content = event.target?.result as string;
                  try {
                    const parsed = JSON.parse(content);
                    setReportJson(JSON.stringify(parsed, null, 2));
                    toast.success('JSON file loaded successfully');
                  } catch (err) {
                    toast.error('Invalid JSON file');
                  }
                };
                reader.readAsText(file);
              }
            }}
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="primary"
          size="lg"
          loading={isSaving}
          onClick={handleSave}
          disabled={isSaving || !!jsonError}
          className="flex items-center gap-2"
        >
          Save Report
        </Button>
        <a href={`/reports/${report.id}`} target="_blank" rel="noopener noreferrer">
          <Button
            variant="secondary"
            size="lg"
            className="flex items-center gap-2"
          >
            <Eye size={20} />
            Preview
          </Button>
        </a>
      </div>
    </div>
  );
}
