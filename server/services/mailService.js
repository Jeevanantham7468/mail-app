import nodemailer from 'nodemailer';

// Store ethereal test account in memory so we don't recreate it every send
let etherealTestAccount = null;

// Helper to get or create nodemailer transporter
export const getTransporter = async (customConfig = null) => {
  // 1. Check if user provided custom SMTP in the settings modal
  if (customConfig && customConfig.host && customConfig.user && customConfig.pass) {
    const isSecure = customConfig.secure !== undefined
      ? Boolean(customConfig.secure)
      : Number(customConfig.port) === 465;

    return {
      transporter: nodemailer.createTransport({
        host: customConfig.host,
        port: Number(customConfig.port) || 587,
        secure: isSecure,
        auth: {
          user: customConfig.user,
          pass: customConfig.pass
        },
        tls: {
          rejectUnauthorized: false
        }
      }),
      fromEmail: customConfig.fromEmail || customConfig.user,
      fromName: customConfig.fromName || 'Bulk Mail Sender',
      isTestAccount: false,
      host: customConfig.host,
      user: customConfig.user
    };
  }

  // 2. Check if SMTP is configured in .env file
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isSecure = process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465;
    return {
      transporter: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: isSecure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      }),
      fromEmail: process.env.FROM_EMAIL || process.env.SMTP_USER,
      fromName: process.env.FROM_NAME || 'Bulk Mail Sender',
      isTestAccount: false,
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER
    };
  }

  // 3. Fallback: Automatically create an Ethereal test inbox for development/testing
  if (!etherealTestAccount) {
    etherealTestAccount = await nodemailer.createTestAccount();
    console.log('Using Ethereal test account:', etherealTestAccount.user);
  }

  return {
    transporter: nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: etherealTestAccount.user,
        pass: etherealTestAccount.pass
      }
    }),
    fromEmail: etherealTestAccount.user,
    fromName: process.env.FROM_NAME || 'Bulk Mail App (Test)',
    isTestAccount: true,
    host: 'smtp.ethereal.email',
    user: etherealTestAccount.user
  };
};

// Verify if SMTP credentials are valid
export const verifySmtpConnection = async (config) => {
  try {
    const { transporter, isTestAccount } = await getTransporter(config);
    await transporter.verify();
    return {
      success: true,
      isTestAccount,
      message: isTestAccount
        ? 'Connected to Ethereal Test Mailbox successfully'
        : 'SMTP connection verified successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Could not connect to SMTP server'
    };
  }
};

// Send bulk emails to list of recipients
export const sendBulkEmails = async ({ subject, body, recipients, smtpConfig = null }) => {
  const { transporter, fromEmail, fromName, isTestAccount, host, user } = await getTransporter(smtpConfig);

  const results = [];
  let primaryPreviewUrl = null;
  const sender = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;

  // Send in batches of 5 to avoid overloading the mail server
  const BATCH_SIZE = 5;
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (recipient) => {
      try {
        const info = await transporter.sendMail({
          from: sender,
          to: recipient.trim(),
          subject: subject,
          html: body,
          text: body.replace(/<[^>]*>?/gm, '') // Fallback plain text
        });

        let preview = null;
        if (isTestAccount) {
          preview = nodemailer.getTestMessageUrl(info);
          if (!primaryPreviewUrl && preview) {
            primaryPreviewUrl = preview;
          }
        }

        return {
          email: recipient.trim(),
          status: 'sent',
          messageId: info.messageId,
          previewUrl: preview || null
        };
      } catch (err) {
        return {
          email: recipient.trim(),
          status: 'failed',
          error: err.message || 'Sending failed'
        };
      }
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
  }

  const successCount = results.filter((r) => r.status === 'sent').length;
  const failureCount = results.filter((r) => r.status === 'failed').length;

  let overallStatus = 'failed';
  if (successCount === recipients.length) {
    overallStatus = 'sent';
  } else if (successCount > 0 && failureCount > 0) {
    overallStatus = 'partial';
  }

  return {
    results,
    successCount,
    failureCount,
    overallStatus,
    primaryPreviewUrl,
    smtpUsed: { host, user, fromEmail, isTestAccount }
  };
};
