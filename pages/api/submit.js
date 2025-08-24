import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://zliywqoxpdeaeyhpkybr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsaXl3cW94cGRlYWV5aHBreWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMDgzOTQsImV4cCI6MjA2NjU4NDM5NH0.LH19x_-4db8KIl4XkbVrJy3bpdgd0Fe_sFmCAIU48dE"
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { vessel_name, cert_name, expiry_date } = req.body;

    const { data, error } = await supabase.from("certificates").insert([
      { vessel_name, cert_name, expiry_date },
    ]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: "Success", data });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
