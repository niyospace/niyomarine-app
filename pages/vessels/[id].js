import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../utils/supabaseClient";
import { FiEdit, FiTrash, FiCalendar, FiFile } from "react-icons/fi";

export default function VesselCertificates() {
  const router = useRouter();
  const { id } = router.query;

  const [certificates, setCertificates] = useState([]);
  const [vessel, setVessel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ name: "", expiry_date: "", file: null });
  const [initialForm, setInitialForm] = useState(form);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(null);
      fetchVessel();
      fetchCertificates().finally(() => setLoading(false));
    }
  }, [id]);

  async function fetchVessel() {
    const { data, error } = await supabase
      .from("vessels")
      .select("name, imo_number")
      .eq("id", id)
      .single();

    if (data) {
      setVessel(data);
    } else if (error) {
      console.error("Error fetching vessel:", error.message);
      setError("Failed to load vessel details.");
    }
  }

  async function fetchCertificates() {
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("vessel_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch certificates error:", error);
      setError("Failed to load certificates.");
    }

    if (data) {
      console.log("Fetched certificates (raw):", data);
      setCertificates(data);
    }
  }

  async function handleAddCertificate(e) {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.expiry_date) {
        alert("Please fill in all required fields: Certificate Name and Expiry Date.");
        return;
    }

    let file_url = "";

    if (form.file) {
      const fileExt = form.file.name.split(".").pop();
      const filePath = `${Date.now()}.${fileExt}`;

      const { data: storageData, error: uploadError } = await supabase.storage
        .from("certs")
        .upload(filePath, form.file);

      if (uploadError) {
        console.error("File upload failed:", uploadError.message);
        setError("Failed to upload file.");
        return;
      }

      const { data: publicURL } = supabase.storage.from("certs").getPublicUrl(filePath);
      file_url = publicURL.publicUrl;
    }

    if (editId) {
      if (!file_url) {
        const existingCert = certificates.find((c) => c.id === editId);
        file_url = existingCert?.file_url || "";
      }

      const { data: updatedCertData, error: updateError } = await supabase
        .from("certificates")
        .update({
          name: form.name,
          cert_name: form.name,
          expiry_date: form.expiry_date,
          file_url: file_url,
        })
        .eq("id", editId)
        .select(); // THIS IS REQUIRED TO GET DATA BACK

      if (!updateError && updatedCertData && updatedCertData.length > 0) {
        setCertificates((prevCerts) =>
          prevCerts.map((cert) =>
            cert.id === editId ? updatedCertData[0] : cert
          )
        );
      } else {
        console.error("Update error:", updateError || "No data returned on update.");
        setError("Failed to update certificate.");
      }
    } else {
      const { data: newCertData, error: insertError } = await supabase
        .from("certificates")
        .insert({
          vessel_id: id,
          name: form.name,
          cert_name: form.name,
          expiry_date: form.expiry_date,
          file_url: file_url,
        })
        .select();

      if (!insertError && newCertData && newCertData.length > 0) {
        setCertificates((prevCerts) => [newCertData[0], ...prevCerts]);
      } else {
        console.error("Insert error:", insertError || "No data returned on insert.");
        setError("Failed to add certificate.");
      }
    }

    setForm({ name: "", expiry_date: "", file: null });
    setEditId(null);
    setInitialForm({ name: "", expiry_date: "", file: null });
  }

  async function handleDelete(certId) {
    setError(null);
    const { error: deleteError } = await supabase
      .from("certificates")
      .delete()
      .eq("id", certId);

    if (!deleteError) {
      setCertificates((prevCerts) => prevCerts.filter((cert) => cert.id !== certId));
    } else {
        console.error("Delete error:", deleteError);
        setError("Failed to delete certificate.");
    }
  }

  function handleEdit(cert) {
    console.log("Edit clicked for certificate:", cert);
    if (!cert) {
        console.error("handleEdit: 'cert' object is null or undefined.");
        alert("Cannot edit: Certificate data is missing.");
        return;
    }
    if (!cert.id) {
        console.error("handleEdit: 'cert.id' is missing for cert:", cert);
        alert("Cannot edit: Certificate ID is missing.");
        return;
    }

    const certName = cert.name || cert.cert_name || ''; 
    const certExpiryDate = typeof cert.expiry_date === 'string' ? cert.expiry_date : '';

    const newFormState = {
      name: certName,
      expiry_date: certExpiryDate,
      file: null,
    };
    setForm(newFormState);
    setInitialForm(newFormState);
    setEditId(cert.id);
    console.log("Form state updated for edit:", { name: certName, expiry_date: certExpiryDate, file: null });
    console.log("editId set to:", cert.id);
  }

  const getCertificateStatusAndDays = (expiryDateString) => {
    let status = "unknown";
    let diffDays = null;

    if (expiryDateString) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiry = new Date(expiryDateString);
      expiry.setHours(0, 0, 0, 0);

      const diffTime = expiry.getTime() - today.getTime();
      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        status = "expired";
      } else if (diffDays <= 7) {
        status = "critical";
      } else if (diffDays <= 30) {
        status = "warning";
      } else {
        status = "active";
      }
    }
    return { status, diffDays };
  };

  const filteredCertificates = certificates.filter((cert) => {
    const nameToFilter = cert.name || cert.cert_name;
    if (!cert || typeof nameToFilter !== 'string') { 
      console.warn("Skipping malformed certificate in filter (cert_name issue):", cert);
      return false;
    }
    return nameToFilter.toLowerCase().includes(searchTerm.toLowerCase()); 
  });
  
  const isFormChanged = form.name !== initialForm.name || 
                        form.expiry_date !== initialForm.expiry_date || 
                        form.file !== initialForm.file;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      {vessel && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h2>
            🚢 {vessel.name} (IMO: {vessel.imo_number})
          </h2>
          <input
            type="text"
            placeholder="🔍 Search Certificate"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "6px", height: "30px" }}
          />
        </div>
      )}

      <button
        onClick={() => router.back()}
        style={{
          padding: "8px 16px",
          backgroundColor: "#f0f0f0",
          color: "black",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        ← Go Back
      </button>

      <hr style={{ margin: "20px 0" }} />

      {error && <p style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</p>}
      {loading && <p>Loading certificates...</p>}

      <form onSubmit={handleAddCertificate}>
        <h3>{editId ? "✏ Edit Certificate" : "📄 Add New Certificate"}</h3>
        <input
          type="text"
          placeholder="Certificate Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{ width: "100%", padding: "8px", margin: "6px 0" }}
        />
        <input
          type="date"
          value={form.expiry_date}
          onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
          required
          style={{ width: "100%", padding: "8px", margin: "6px 0" }}
        />
        <input
          type="file"
          onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
          style={{ margin: "6px 0" }}
        />
        <button
          type="submit"
          disabled={editId && !isFormChanged}
          style={{
            padding: "8px 16px",
            backgroundColor: (editId && !isFormChanged) ? "#ccc" : "black",
            color: (editId && !isFormChanged) ? "#666" : "white",
            border: "none",
            cursor: (editId && !isFormChanged) ? "not-allowed" : "pointer",
          }}
        >
          {editId ? "Update Certificate" : "Add Certificate"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm({ name: "", expiry_date: "", file: null });
              setError(null);
            }}
            style={{
              marginLeft: "10px",
              padding: "8px 16px",
              backgroundColor: "#ccc",
              color: "black",
              border: "none",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <hr style={{ margin: "20px 0" }} />

      <div>
        <h3>📁 Certificate List</h3>
        {!loading && filteredCertificates.length === 0 ? (
          <p>No certificates found for this vessel. Add one above!</p>
        ) : (
          filteredCertificates.map((cert) => {
            const { status, diffDays } = getCertificateStatusAndDays(cert.expiry_date);
            let bgColor = "#FFFFFF";
            let daysLeftTextColor = "black";

            switch (status) {
              case "expired":
                bgColor = "#FF5252";
                daysLeftTextColor = "#CC0000";
                break;
              case "critical":
                bgColor = "#FF8C00";
                daysLeftTextColor = "#CC6600";
                break;
              case "warning":
                bgColor = "#FFD700";
                daysLeftTextColor = "#CC9900";
                break;
              case "active":
                bgColor = "#C8E6C9";
                daysLeftTextColor = "#006600";
                break;
              default:
                bgColor = "#F0F0F0";
                daysLeftTextColor = "gray";
            }

            let daysLeftText = "";
            if (status === "expired") {
              daysLeftText = `Expired (${Math.abs(diffDays)} days ago)`;
            } else if (status === "unknown" || diffDays === null) {
              daysLeftText = "Expiry Unknown";
            } else if (diffDays === 0) {
              daysLeftText = "Expires Today!";
            } else if (diffDays > 0) {
              daysLeftText = `Expires in ${diffDays} days`;
            }

            return (
              <div
                key={cert.id}
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #ccc",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  backgroundColor: bgColor,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ marginBottom: '5px' }}>
                  <strong>📄 {cert.name || cert.cert_name || "N/A"}</strong>
                </div>
                <div style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                  <FiCalendar style={{ marginRight: '5px' }} /> <strong>Expiry Date:</strong> {cert.expiry_date || "N/A"}
                </div>
                {cert.expiry_date && (
                    <div style={{ marginBottom: '5px', fontWeight: 'bold', color: daysLeftTextColor }}>
                        {daysLeftText}
                    </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FiFile style={{ marginRight: '5px' }} /> <strong>File:</strong>{" "}
                  {cert.file_url ? (
                    <a href={cert.file_url} target="_blank" rel="noopener noreferrer">View File</a>
                  ) : (
                    "N/A"
                  )}
                </div>
                <div style={{ marginTop: '10px', alignSelf: 'flex-end' }}>
                  <FiEdit
                    onClick={() => handleEdit(cert)}
                    style={{ cursor: "pointer", marginRight: "10px" }}
                  />
                  <FiTrash
                    onClick={() => handleDelete(cert.id)}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}