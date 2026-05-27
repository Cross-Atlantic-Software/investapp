'use client';

import React, { useEffect, useState, useCallback } from 'react';

type Draft = {
  id: number;
  admin_user_id: string;
  draft_data: any;
  current_step: number;
  created_at?: string;
  updated_at?: string;
};

interface DraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const DraftsModal: React.FC<DraftsModalProps> = ({ isOpen, onClose, onContinue }) => {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDraft = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('adminToken') || '';
      const res = await fetch('/api/admin/stock-drafts', {
        headers: { 'token': token },
      });
      const data = await res.json();
      if (data.success) {
        const drafts = data.data?.drafts || [];
        setDraft(drafts.length > 0 ? drafts[0] : null);
      } else {
        setError(data.message || 'Failed to load drafts');
      }
    } catch (e) {
      setError('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) loadDraft();
  }, [isOpen, loadDraft]);

  const handleDelete = async () => {
    if (!draft) return;
    if (!confirm('Delete this draft? This action cannot be undone.')) return;
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const res = await fetch(`/api/admin/stock-drafts/${draft.id}`, {
        method: 'DELETE',
        headers: { 'token': token },
      });
      const data = await res.json();
      if (data.success) {
        setDraft(null);
      } else {
        alert(data.message || 'Failed to delete draft');
      }
    } catch (e) {
      alert('Failed to delete draft');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[70]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-themeTealLighter" onClick={(e) => e.stopPropagation()}>
        <div className="bg-themeTeal text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Drafts</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl font-bold transition duration-300">×</button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-themeTeal">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-600 text-sm">{error}</div>
          ) : !draft ? (
            <div className="text-center text-themeTealLighter text-sm">No drafts found.</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded border border-themeTealLighter p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-themeTealLighter">Draft ID</div>
                    <div className="text-themeTeal font-semibold">{draft.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-themeTealLighter">Current Step</div>
                    <div className="text-themeTeal font-semibold">{draft.current_step}</div>
                  </div>
                  <div>
                    <div className="text-sm text-themeTealLighter">Updated</div>
                    <div className="text-themeTeal font-semibold">{draft.updated_at ? new Date(draft.updated_at).toLocaleString() : '-'}</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-themeTealLighter break-words">
                  {/* Optional preview of company_name if present */}
                  {draft.draft_data?.company_name && (
                    <div>Company: <span className="text-themeTeal font-medium">{draft.draft_data.company_name}</span></div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button onClick={handleDelete} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition duration-300 cursor-pointer">Delete</button>
                <button onClick={onContinue} className="px-4 py-2 rounded bg-themeTeal text-white hover:bg-themeTealLight transition duration-300 cursor-pointer">Continue</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DraftsModal;


