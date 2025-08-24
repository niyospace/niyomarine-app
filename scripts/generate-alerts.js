require('dotenv').config({ path: '.env.local' }); // Load environment variables from .env.local

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service_role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY; // Your Resend API Key

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
    process.exit(1); // Exit if critical env variables are missing
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        persistSession: false,
    },
});

// Helper function for exponential backoff for fetch calls (e.g., to Resend)
async function fetchWithExponentialBackoff(url, options, retries = 5, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.status === 429) { // Too Many Requests
                console.warn(`Rate limit hit. Retrying in ${delay / 1000}ms...`);
                await new Promise(res => setTimeout(res, delay));
                delay *= 2; // Exponential backoff
                continue;
            }
            return response;
        } catch (error) {
            console.error(`Fetch attempt ${i + 1} failed:`, error);
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay));
                delay *= 2;
            } else {
                throw error; // Re-throw if all retries fail
            }
        }
    }
    throw new Error('All fetch retries failed.');
}

async function generateAlerts() {
    try {
        console.log('Starting alert generation script...');

        // Fetch all certificates, now only selecting user_id as email is not directly on certs
        const { data: certificates, error: fetchError } = await supabase
            .from('certificates')
            .select('*, user_id'); // Removed user_email from direct select

        if (fetchError) {
            console.error('Error fetching certificates:', fetchError);
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        const notificationsToCreate = [];
        const certificatesToUpdate = [];

        for (const cert of certificates) {
            // Fetch user email using auth.admin.getUserById
            let userEmail = null;
            if (cert.user_id) {
                const { data: userData, error: userError } = await supabase.auth.admin.getUserById(cert.user_id);
                if (userError) {
                    console.error(`Error fetching user email for user_id ${cert.user_id}:`, userError.message);
                } else if (userData && userData.user && userData.user.email) {
                    userEmail = userData.user.email;
                }
            }


            const expiryDate = new Date(cert.expiry_date);
            expiryDate.setHours(0, 0, 0, 0); // Normalize to start of day

            const diffTime = expiryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let alertMessage = '';
            let alertType = '';
            let updateField = null;

            // Check for 30-day alert
            if (diffDays === 30 && !cert.alert_30_days_sent) {
                alertMessage = `Certificate '${cert.certificate_name}' for vessel '${cert.vessel_name}' expires in 30 days on ${expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}.`;
                alertType = 'expiry_30_days';
                updateField = 'alert_30_days_sent';
            }
            // Check for 7-day alert
            else if (diffDays === 7 && !cert.alert_7_days_sent) {
                alertMessage = `Certificate '${cert.certificate_name}' for vessel '${cert.vessel_name}' expires in 7 days on ${expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}.`;
                alertType = 'expiry_7_days';
                updateField = 'alert_7_days_sent';
            }
            // Check for 1-day alert
            else if (diffDays === 1 && !cert.alert_1_day_sent) {
                alertMessage = `Certificate '${cert.certificate_name}' for vessel '${cert.vessel_name}' expires in 1 day on ${expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}.`;
                alertType = 'expiry_1_day';
                updateField = 'alert_1_day_sent';
            }
            // Check for expired alert
            else if (diffDays < 0 && !cert.alert_expired_sent) { // Already expired
                alertMessage = `Certificate '${cert.certificate_name}' for vessel '${cert.vessel_name}' expired on ${expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}. Please renew immediately.`;
                alertType = 'expired';
                updateField = 'alert_expired_sent';
            }

            if (alertMessage && cert.user_id && cert.id) { // Ensure required fields are present
                // Prepare in-app notification record
                notificationsToCreate.push({
                    user_id: cert.user_id,
                    certificate_id: cert.id,
                    message: alertMessage,
                    type: alertType,
                    is_read: false, // New notifications are unread by default
                });

                // Prepare certificate update to mark alert as sent
                certificatesToUpdate.push({
                    id: cert.id,
                    updateField: updateField, // Store the field name to update
                });

                // --- EMAIL SENDING LOGIC (will only work with verified domain) ---
                if (resendApiKey && userEmail) { // Now using the fetched userEmail
                    try {
                        const resendResponse = await fetchWithExponentialBackoff('https://api.resend.com/emails', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${resendApiKey}`,
                            },
                            body: JSON.stringify({
                                from: 'onboarding@resend.dev', // Placeholder: Replace with your verified domain email, e.g., 'alerts@yourdomain.com'
                                to: userEmail, // Use the fetched userEmail
                                subject: `MemoryDeck Alert: ${alertType.replace(/_/g, ' ').toUpperCase()}`,
                                html: `<p>${alertMessage}</p><p>Manage your certificates at your MemoryDeck app.</p>`,
                            }),
                        });

                        if (!resendResponse.ok) {
                            const errorBody = await resendResponse.json();
                            console.error(`Resend API Error for cert ${cert.id}:`, resendResponse.status, errorBody);
                        } else {
                            console.log(`Email alert sent for certificate ${cert.id} to ${userEmail} (${alertType})`);
                        }
                    } catch (emailError) {
                        console.error(`Failed to send email for certificate ${cert.id}:`, emailError);
                    }
                } else {
                    console.warn(`RESEND_API_KEY not found or user email missing for cert ${cert.id}. Email alerts will not be sent.`);
                }
                // --- END EMAIL SENDING LOGIC ---
            }
        }

        // Insert all new notifications into the database (batch insert)
        if (notificationsToCreate.length > 0) {
            const { error: insertNotificationError } = await supabase
                .from('notifications')
                .insert(notificationsToCreate);

            if (insertNotificationError) {
                console.error('Error inserting notifications:', insertNotificationError);
                return; // Exit if notification insertion fails
            }
            console.log(`Inserted ${notificationsToCreate.length} new in-app notifications.`);
        }

        // Update certificates to mark alerts as sent
        for (const update of certificatesToUpdate) {
            const { error: updateCertError } = await supabase
                .from('certificates')
                .update({ [update.updateField]: true })
                .eq('id', update.id);

            if (updateCertError) {
                console.error(`Error updating certificate ${update.id}:`, updateCertError);
            }
        }

        console.log('Alert generation script finished successfully.');

    } catch (error) {
        console.error('Unexpected error in generateAlerts script:', error);
    }
}

generateAlerts();
