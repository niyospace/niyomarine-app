'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function CertificateList({ vesselId }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vesselId) {
      fetchCertificates();
    }
  }, [vesselId]);

  async function fetchCertificates() {
    setLoading(true);
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('vessel_id', vesselId);

    if (error) {
      console.error('Error fetching certificates:', error.message);
    } else {
      setCertificates(data);
    }

    setLoading(false);
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Certificates</h2>
      {loading ? (
        <p>Loading...</p>
      ) : certificates.length === 0 ? (
        <p className="text-gray-500">No certificates found for this vessel.</p>
      ) : (
        <ul className="space-y-2">
          {certificates.map((cert) => (
            <li key={cert.id} className="border p-3 rounded bg-white shadow">
              <div className="font-medium">{cert.cert_name}</div>
              <div className="text-sm text-gray-500">
                Issue Date: {cert.issue_date} | Expiry: {cert.expiry_date}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}