'use client';
import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function AddVesselForm({ onVesselAdded }) {
  const [vessel, setVessel] = useState({ name: '', imo_number: '' });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const user = await supabase.auth.getUser();
    const userId = user.data?.user?.id;

    const { data, error } = await supabase.from('vessels').insert([
      {
        name: vessel.name,
        imo_number: vessel.imo_number,
        owner_id: userId, // must match RLS policy
      },
    ]);

    if (error) {
      console.error('Error adding vessel:', error.message);
      setError('Failed to add vessel.');
    } else {
      setVessel({ name: '', imo_number: '' });
      setError('');
      if (onVesselAdded) onVesselAdded();
    }
  };

  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Vessel Name"
        className="border px-3 py-2 mr-2"
        value={vessel.name}
        onChange={(e) => setVessel({ ...vessel, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="IMO Number"
        className="border px-3 py-2 mr-2"
        value={vessel.imo_number}
        onChange={(e) =>
          setVessel({ ...vessel, imo_number: e.target.value })
        }
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add Vessel
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}