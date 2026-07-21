const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

// Build the premium HTML email template
const buildEmailTemplate = ({
  userName,
  notificationTitle,
  notificationMessage,
  notificationType,
  currentDate,
  logoUrl = '',
}) => {
  // Type badge color mapping
  const typeColors = {
    information: { bg: 'rgba(6,182,212,0.15)', color: '#06B6D4', icon: 'ℹ️' },
    success: { bg: 'rgba(16,185,129,0.15)', color: '#10B981', icon: '✅' },
    warning: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', icon: '⚠️' },
    error: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', icon: '🚨' },
    promotion: { bg: 'rgba(168,85,247,0.15)', color: '#A855F7', icon: '🎉' },
    reminder: { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6', icon: '⏰' },
    system_update: { bg: 'rgba(139,92,246,0.15)', color: '#8B5CF6', icon: '⚙️' },
    event_update: { bg: 'rgba(236,72,153,0.15)', color: '#EC4899', icon: '📅' },
    booking_update: { bg: 'rgba(251,146,60,0.15)', color: '#FB923C', icon: '🎫' },
    payment_update: { bg: 'rgba(16,185,129,0.15)', color: '#10B981', icon: '💳' },
  };

  const tc = typeColors[notificationType] || typeColors.information;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notification from EventNexus</title>
</head>
<body style="margin:0;padding:0;background:#050816;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050816;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:linear-gradient(135deg,#0d0d1f 0%,#1a0a2e 100%);border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
          
          <!-- Header with Gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#4F46E5 0%,#7C3AED 50%,#A855F7 100%);padding:40px 40px 30px 40px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <!-- Logo placeholder -->
                    <div style="display:inline-block;width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.2);text-align:center;line-height:56px;font-size:28px;margin-bottom:12px;">
                      🎯
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0;letter-spacing:-0.5px;">EventNexus</h1>
                    <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:6px 0 0 0;text-transform:uppercase;letter-spacing:2px;">Notification Center</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notification Badge -->
          <tr>
            <td style="text-align:center;padding:0 40px;">
              <div style="display:inline-block;margin-top:-24px;padding:8px 24px;border-radius:20px;background:${tc.bg};border:1px solid ${tc.color}40;color:${tc.color};font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                ${tc.icon} ${notificationType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:30px 40px 10px 40px;">
              <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0;text-transform:uppercase;letter-spacing:1px;">Dear</p>
              <h2 style="color:#ffffff;font-size:24px;font-weight:700;margin:6px 0 0 0;">${userName}</h2>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:10px 40px;">
              <h3 style="color:#ffffff;font-size:20px;font-weight:600;margin:0;line-height:1.3;">${notificationTitle}</h3>
            </td>
          </tr>

          <!-- Message Card -->
          <tr>
            <td style="padding:8px 40px;">
              <div style="padding:20px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);backdrop-filter:blur(8px);">
                <p style="color:#d0d0e0;font-size:15px;line-height:1.7;margin:0;word-wrap:break-word;">
                  ${notificationMessage}
                </p>
              </div>
            </td>
          </tr>

          <!-- Date -->
          <tr>
            <td style="padding:8px 40px;">
              <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:0;">
                ${currentDate}
              </p>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td style="padding:20px 40px 30px 40px;text-align:center;">
              <a href="https://eventnexus.com/dashboard/notifications" target="_blank" style="display:inline-block;padding:14px 36px;border-radius:12px;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;box-shadow:0 8px 24px rgba(79,70,229,0.3);transition:all 0.3s ease;border:1px solid rgba(255,255,255,0.1);">
                View Notification →
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(to right,transparent,rgba(255,255,255,0.08),transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0;font-weight:500;">Need Help?</p>
                    <a href="mailto:support@eventnexus.com" style="color:#818cf8;font-size:14px;font-weight:600;text-decoration:none;">support@eventnexus.com</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:14px;">
                    <!-- Social Icons -->
                    <table cellpadding="0" cellspacing="0" style="display:inline-block;">
                      <tr>
                        <td style="padding:0 6px;">
                          <a href="https://twitter.com/eventnexus" style="display:inline-block;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.05);text-align:center;line-height:36px;color:rgba(255,255,255,0.5);font-size:16px;text-decoration:none;">𝕏</a>
                        </td>
                        <td style="padding:0 6px;">
                          <a href="https://linkedin.com/company/eventnexus" style="display:inline-block;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.05);text-align:center;line-height:36px;color:rgba(255,255,255,0.5);font-size:16px;text-decoration:none;">in</a>
                        </td>
                        <td style="padding:0 6px;">
                          <a href="https://instagram.com/eventnexus" style="display:inline-block;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.05);text-align:center;line-height:36px;color:rgba(255,255,255,0.5);font-size:16px;text-decoration:none;">IG</a>
                        </td>
                        <td style="padding:0 6px;">
                          <a href="https://facebook.com/eventnexus" style="display:inline-block;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.05);text-align:center;line-height:36px;color:rgba(255,255,255,0.5);font-size:16px;text-decoration:none;">fb</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="color:rgba(255,255,255,0.25);font-size:12px;margin:0;">
                      &copy; ${new Date().getFullYear()} EventNexus. All rights reserved.
                    </p>
                    <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:6px 0 0 0;">
                      This email was sent to you as a notification from EventNexus.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Send a single email
const sendEmail = async ({ to, subject, html, retries = 2 }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"EventNexus" <${process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@eventnexus.com'}>`,
    to,
    subject,
    html,
  };

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      lastError = error;
      console.error(`[Email Service] Attempt ${attempt}/${retries} failed for ${to}:`, error.message);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
  }
  return { success: false, error: lastError?.message || 'Failed to send email' };
};

// Send batch emails with concurrency control
const sendBatchEmails = async (emails, concurrency = 5) => {
  const results = [];
  const batches = [];

  // Split into batches
  for (let i = 0; i < emails.length; i += concurrency) {
    batches.push(emails.slice(i, i + concurrency));
  }

  for (const batch of batches) {
    const batchResults = await Promise.allSettled(
      batch.map((email) =>
        sendEmail({
          to: email.to,
          subject: email.subject,
          html: email.html,
        }).then((result) => ({
          ...result,
          userId: email.userId,
          recipientEmail: email.to,
        }))
      )
    );

    batchResults.forEach((r) => {
      if (r.status === 'fulfilled') {
        results.push(r.value);
      } else {
        results.push({
          success: false,
          error: r.reason?.message || 'Promise rejected',
          recipientEmail: 'unknown',
        });
      }
    });
  }

  return results;
};

module.exports = {
  sendEmail,
  sendBatchEmails,
  buildEmailTemplate,
};