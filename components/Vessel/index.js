'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import Link from 'next/link';

export default function VesselList() {
  const [vessels, setVessels] = useState([]);

  useEffect(() => {
    fetchVessels();
  }, []);

  async function fetchVessels() {
    const {
      data,
      error
    } = await supabase.from('vessels').select('*');

    if (error) {
      console.error('Error fetching vessels:', error);
    } else {
      setVessels(data);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Vessels</h2>
      <ul>
        {vessels.length === 0 ? (
          <li>No vessels added yet.</li>
        ) : (
          vessels.map((vessel) => (
            <li key={vessel.id}>
              <Link
                href={`/vessels/${vessel.id}`}
                className="block p-3 mb-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                <span className="font-medium">{vessel.name}</span>
                <span className="text-sm block">IMO: {vessel.imo_number}</span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}