'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    password: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    setError('');

    if (!formData.company_name.trim()) {
      setError('Company name is required');
      return false;
    }

    if (!formData.contact_email.trim()) {
      setError('Contact email is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      setError('Invalid email address');
      return false;
    }

    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    if (formData.password.length < 12) {
      setError('Password must be at least 12 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.contact_email,
          password: formData.password,
          company_name: formData.company_name,
          contact_name: formData.contact_name || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create client');
        setLoading(false);
        return;
      }

      toast.success('Client created successfully');
      router.push('/admin/clients');
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-va-text">Create New Client</h1>
        <p className="text-va-text-secondary font-body mt-2">
          Add a new client account to the platform.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <Input
            label="Company Name"
            type="text"
            placeholder="Acme Corp"
            value={formData.company_name}
            onChange={(e) => handleChange('company_name', e.target.value)}
            required
          />

          {/* Contact Name */}
          <Input
            label="Contact Name"
            type="text"
            placeholder="John Doe"
            value={formData.contact_name}
            onChange={(e) => handleChange('contact_name', e.target.value)}
          />

          {/* Contact Email */}
          <Input
            label="Contact Email"
            type="email"
            placeholder="john@acme.com"
            value={formData.contact_email}
            onChange={(e) => handleChange('contact_email', e.target.value)}
            required
          />

          {/* Password */}
          <Input
            label="Password (min. 12 characters)"
            type="password"
            placeholder="••••••••••••"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required
          />

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-va-red/10 border border-va-red/30 rounded-card">
              <p className="text-sm font-body text-va-red">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-va-border">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              className="flex-1"
            >
              Create Client
            </Button>
            <a href="/admin/clients" className="flex-1">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                Cancel
              </Button>
            </a>
          </div>
        </form>
      </Card>
    </div>
  );
}
