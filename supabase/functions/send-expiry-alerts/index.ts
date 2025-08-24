// supabase/functions/send-expiry-alerts/index.ts
// This Edge Function checks for expiring certificates and sends email alerts.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { Resend } from 'https://esm.sh/resend@1.1.0';

console.log('Edge Function: send-expiry-alerts started.');

// Initialize Resend with API key from Supabase Secrets
// Ensure RESEND_API_KEY is set in Supabase Dashboard -> Edge Functions -> Secrets
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

// Initialize Supabase client with the Service Role Key
// This allows the function to bypass Row Level Security and access auth.users table.
// Ensure SUPABASE_SERVICE_ROLE_KEY is set in Supabase Dashboard -> Edge Functions -> Secrets
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper function to format date for email content
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return dateString;
  }
};

serve(async (req) => {
  try {
    console.log('Edge Function triggered: Checking for expiring certificates.');

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day UTC

    // Calculate dates for various alert windows
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);

    const oneDayFromNow = new Date(today);
    oneDayFromNow.setDate(today.getDate() + 1);

    const oneDayAgo = new Date(today);
    oneDayAgo.setDate(today.getDate() - 1);

    // Query certificates that are expiring within the next 30 days, or are expired by 1 day,
    // AND where the respective alert flag has NOT been sent yet.
    const { data: expiringCerts, error: certsError } = await supabase
      .from('certificates')
      .select(`
        id,
        name,
        expiry_date,
        vessel_id,
        alert_30_days_sent,
        alert_7_days_sent,
        alert_3_days_sent,
        alert_2_days_sent,
        alert_1_day_sent,
        alert_expired_sent,
        vessels (
          name,
          owner_id
        )
      `)
      .or(`
        and(expiry_date.lte.${thirtyDaysFromNow.toISOString().split('T')[0]},expiry_date.gt.${today.toISOString().split('T')[0]},alert_30_days_sent.is.false),
        and(expiry_date.lte.${sevenDaysFromNow.toISOString().split('T')[0]},expiry_date.gt.${today.toISOString().split('T')[0]},alert_7_days_sent.is.false),
        and(expiry_date.lte.${threeDaysFromNow.toISOString().split('T')[0]},expiry_date.gt.${today.toISOString().split('T')[0]},alert_3_days_sent.is.false),
        and(expiry_date.lte.${twoDaysFromNow.toISOString().split('T')[0]},expiry_date.gt.${today.toISOString().split('T')[0]},alert_2_days_sent.is.false),
        and(expiry_date.lte.${oneDayFromNow.toISOString().split('T')[0]},expiry_date.gt.${today.toISOString().split('T')[0]},alert_1_day_sent.is.false),
        and(expiry_date.lte.${today.toISOString().split('T')[0]},expiry_date.gt.${oneDayAgo.toISOString().split('T')[0]},alert_expired_sent.is.false)
      `);


    if (certsError) {
      console.error('Error fetching expiring certificates:', certsError.message);
      return new Response(JSON.stringify({ error: certsError.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!expiringCerts || expiringCerts.length === 0) {
      console.log('No certificates found expiring soon or alerts already sent for current windows.');
      return new Response(JSON.stringify({ message: 'No certificates found expiring soon or alerts already sent for current windows.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`Found ${expiringCerts.length} potential expiring certificates for alerts.`);

    for (const cert of expiringCerts) {
      const ownerId = cert.vessels.owner_id;
      const vesselName = cert.vessels.name;
      const certName = cert.name;
      const expiryDateStr = cert.expiry_date;
      const expiryDate = new Date(expiryDateStr);
      expiryDate.setHours(0, 0, 0, 0);

      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let subject = '';
      let alertFlagToUpdate = '';
      let shouldSendEmail = false;
      let urgencyColor = '#007bff'; // Default color

      // Determine which alert to send based on days remaining and if already sent
      // Order matters here: check most urgent first
      if (diffDays === 0 && !cert.alert_1_day_sent) { // Expires today, use 1-day flag to prevent spam
        subject = `ACTION REQUIRED: Certificate for ${vesselName} (${certName}) expires TODAY!`;
        alertFlagToUpdate = 'alert_1_day_sent'; // Mark 1-day alert sent if it's today
        shouldSendEmail = true;
        urgencyColor = '#dc3545'; // Red
      } else if (diffDays === -1 && !cert.alert_expired_sent) { // Expired yesterday
        subject = `URGENT: Certificate for ${vesselName} (${certName}) expired yesterday!`;
        alertFlagToUpdate = 'alert_expired_sent';
        shouldSendEmail = true;
        urgencyColor = '#dc3545'; // Red
      } else if (diffDays <= 1 && diffDays > 0 && !cert.alert_1_day_sent) { // 1 day left
        subject = `URGENT: Certificate for ${vesselName} (${certName}) expires in ${diffDays} day!`;
        alertFlagToUpdate = 'alert_1_day_sent';
        shouldSendEmail = true;
        urgencyColor = '#dc3545'; // Red
      } else if (diffDays <= 2 && diffDays > 0 && !cert.alert_2_days_sent) { // 2 days left
        subject = `REMINDER: Certificate for ${vesselName} (${certName}) expires in ${diffDays} days!`;
        alertFlagToUpdate = 'alert_2_days_sent';
        shouldSendEmail = true;
        urgencyColor = '#ffc107'; // Orange
      } else if (diffDays <= 3 && diffDays > 0 && !cert.alert_3_days_sent) { // 3 days left
        subject = `REMINDER: Certificate for ${vesselName} (${certName}) expires in ${diffDays} days.`;
        alertFlagToUpdate = 'alert_3_days_sent';
        shouldSendEmail = true;
        urgencyColor = '#ffc107'; // Orange
      } else if (diffDays <= 7 && diffDays > 0 && !cert.alert_7_days_sent) { // 7 days left
        subject = `REMINDER: Certificate for ${vesselName} (${certName}) expires in ${diffDays} days.`;
        alertFlagToUpdate = 'alert_7_days_sent';
        shouldSendEmail = true;
        urgencyColor = '#ffc107'; // Orange
      } else if (diffDays <= 30 && diffDays > 0 && !cert.alert_30_days_sent) { // 30 days left
        subject = `Heads Up: Certificate for ${vesselName} (${certName}) expires in ${diffDays} days.`;
        alertFlagToUpdate = 'alert_30_days_sent';
        shouldSendEmail = true;
        urgencyColor = '#28a745'; // Greenish
      }


      if (shouldSendEmail) {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(ownerId);

        if (userError || !userData?.user?.email) {
          console.error(`Could not fetch email for owner ${ownerId}:`, userError?.message || 'Email not found');
          continue;
        }

        const ownerEmail = userData.user.email;
        const formattedExpiryDate = formatDate(expiryDateStr);
        const daysLeftMessage = diffDays > 0 ? `It expires in ${diffDays} day${diffDays !== 1 ? 's' : ''}.` : `It expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago.`;


        const htmlContent = `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <h1 style="color: #007bff; text-align: center; margin-bottom: 20px;">MemoryDeck Certificate Expiry Alert</h1>
            <p style="margin-bottom: 15px;">Dear User,</p>
            <p style="margin-bottom: 15px;">This is an automated alert from MemoryDeck regarding a certificate for your vessel <strong>${vesselName}</strong>.</p>
            <p style="margin-bottom: 15px;">The certificate <strong>${certName}</strong> is expiring on <strong>${formattedExpiryDate}</strong>.</p>
            <p style="margin-bottom: 15px; font-weight: bold; color: ${urgencyColor};">
              ${daysLeftMessage}
            </p>
            <p style="margin-bottom: 15px;">Please log in to MemoryDeck to review and update your certificates to ensure compliance.</p>
            <p style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:3000/vessels/${cert.vessel_id}" style="display: inline-block; padding: 12px 25px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px;">
                View Vessel Certificates
              </a>
            </p>
            <p style="margin-top: 30px; font-size: 0.9em; color: #777;">Best regards,<br/>The MemoryDeck Team</p>
          </div>
        `;

        const { data: emailData, error: emailError } = await resend.emails.send({
          from: 'MemoryDeck Alerts <alerts@yourverifieddomain.com>', // IMPORTANT: Replace with your VERIFIED Resend domain email
          to: [ownerEmail],
          subject: subject,
          html: htmlContent,
        });

        if (emailError) {
          console.error(`Failed to send email for certificate ${cert.id} to ${ownerEmail}:`, emailError.message);
        } else {
          console.log(`Email sent for certificate ${cert.id} to ${ownerEmail}.`);

          if (alertFlagToUpdate) {
            const { error: updateFlagError } = await supabase
              .from('certificates')
              .update({ [alertFlagToUpdate]: true })
              .eq('id', cert.id);

            if (updateFlagError) {
              console.error(`Failed to update alert flag '${alertFlagToUpdate}' for certificate ${cert.id}:`, updateFlagError.message);
            } else {
              console.log(`Alert flag '${alertFlagToUpdate}' updated for certificate ${cert.id}.`);
            }
          }
        }
      } else {
        console.log(`Skipping alert for certificate ${cert.id} (already sent or not in current alert window).`);
      }
    }

    return new Response(JSON.stringify({ message: 'Expiry alert check completed.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Unhandled error in Edge Function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});