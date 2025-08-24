'use client';
import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function AddCertificateForm({ vesselId, onCertificateAdded }) {
  const [certName, setCertName] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('certificates').insert([
      {
        vessel_id: vesselId,
        cert_name: certName,
        issue_date: issueDate,
        expiry_date: expiryDate,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error('Error adding certificate:', error.message);
    } else {
      setCertName('');
      setIssueDate('');
      setExpiryDate('');
      onCertificateAdded(); // Trigger refresh
    }
  };

  return (
    <form onSubmit={handleAdd} className="space-y-4 mt-4 bg-white p-4 rounded shadow">
      <h3 className="text-md font-semibold">Add Certificate</h3>
      <input
        type="text"
        placeholder="Certificate Name"
        value={certName}
        onChange={(e) => setCertName(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="date"
        value={issueDate}
        onChange={(e) => setIssueDate(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="date"
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Adding...' : 'Add Certificate'}
      </button>
    </form>
  );
}