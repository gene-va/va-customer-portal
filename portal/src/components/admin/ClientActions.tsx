'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ClientActionsProps {
  clientId: string;
  clientName: string;
}

export default function ClientActions({
  clientId,
  clientName,
}: ClientActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete client');
        setIsDeleting(false);
        return;
      }

      toast.success('Client deleted successfully');
      router.push('/admin/clients');
    } catch (error) {
      toast.error('An error occurred');
      setIsDeleting(false);
    }
  };

  return (
    <>
      {!showDeleteConfirm ? (
        <Button
          variant="danger"
          size="lg"
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2"
        >
          <Trash2 size={20} />
          Delete Client
        </Button>
      ) : (
        <div className="bg-va-red/10 border border-va-red/25 rounded-lg p-6 max-w-sm">
          <h3 className="font-semibold text-red-900 mb-2">Delete Client?</h3>
          <p className="text-sm text-va-red mb-4">
            Are you sure you want to delete <strong>{clientName}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              size="sm"
              loading={isDeleting}
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
