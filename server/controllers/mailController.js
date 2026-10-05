import EmailLog from '../models/EmailLog.js';
import { sendBulkEmails, verifySmtpConnection } from '../services/mailService.js';

// Simple regex for email format validation
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Send bulk emails and record history in MongoDB
export const sendBulkMail = async (req, res) => {
  try {
    const { subject, body, recipients, smtpConfig } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Email subject is required' });
    }

    if (!body || !body.trim()) {
      return res.status(400).json({ success: false, message: 'Email body message is required' });
    }

    // Parse recipients list (support both array or comma/newline separated string)
    let emailList = [];
    if (Array.isArray(recipients)) {
      emailList = recipients;
    } else if (typeof recipients === 'string') {
      emailList = recipients.split(/[,\n;\r]+/).map((e) => e.trim()).filter(Boolean);
    }

    if (!emailList.length) {
      return res.status(400).json({ success: false, message: 'Please provide at least one recipient email' });
    }

    // Separate valid emails and filter out duplicates
    const validEmails = [];
    const invalidEmails = [];

    emailList.forEach((email) => {
      const clean = email.trim();
      if (isValidEmail(clean)) {
        if (!validEmails.includes(clean)) {
          validEmails.push(clean);
        }
      } else if (clean) {
        invalidEmails.push(clean);
      }
    });

    if (validEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid recipient email addresses found',
        invalidEmails
      });
    }

    // If user has saved custom SMTP, use that; otherwise use request config or default
    const activeSmtp = smtpConfig || (req.user?.smtpConfig ? req.user.smtpConfig : null);

    // Call mail service to send through nodemailer
    const {
      results,
      successCount,
      failureCount,
      overallStatus,
      primaryPreviewUrl,
      smtpUsed
    } = await sendBulkEmails({
      subject,
      body,
      recipients: validEmails,
      smtpConfig: activeSmtp
    });

    // Save history record to MongoDB
    const emailRecord = await EmailLog.create({
      subject,
      body,
      recipients: validEmails,
      recipientCount: validEmails.length,
      successCount,
      failureCount,
      status: overallStatus,
      results,
      smtpUsed,
      previewUrl: primaryPreviewUrl,
      sentBy: req.user ? req.user._id : null
    });

    res.status(200).json({
      success: true,
      message: `Sent ${successCount} of ${validEmails.length} emails successfully`,
      data: emailRecord,
      invalidEmails
    });
  } catch (error) {
    console.error('Error in sendBulkMail:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send bulk emails'
    });
  }
};

// Get sent email history from MongoDB
export const getMailHistory = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { recipients: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [emails, total] = await Promise.all([
      EmailLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('sentBy', 'name email'),
      EmailLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: emails
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single email details by ID
export const getMailById = async (req, res) => {
  try {
    const email = await EmailLog.findById(req.params.id).populate('sentBy', 'name email');
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email log not found' });
    }
    res.json({ success: true, data: email });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete single email history entry
export const deleteMailLog = async (req, res) => {
  try {
    const email = await EmailLog.findByIdAndDelete(req.params.id);
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email log not found' });
    }
    res.json({ success: true, message: 'Email record removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Test SMTP connection settings
export const verifySmtp = async (req, res) => {
  try {
    const result = await verifySmtpConnection(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get overall stats for dashboard
export const getStats = async (req, res) => {
  try {
    const totalCampaigns = await EmailLog.countDocuments();
    const aggregateData = await EmailLog.aggregate([
      {
        $group: {
          _id: null,
          totalEmails: { $sum: '$recipientCount' },
          totalSuccess: { $sum: '$successCount' },
          totalFailed: { $sum: '$failureCount' }
        }
      }
    ]);

    const stats = aggregateData[0] || {
      totalEmails: 0,
      totalSuccess: 0,
      totalFailed: 0
    };

    res.json({
      success: true,
      stats: {
        totalCampaigns,
        totalEmails: stats.totalEmails,
        totalSuccess: stats.totalSuccess,
        totalFailed: stats.totalFailed,
        successRate: stats.totalEmails > 0
          ? Math.round((stats.totalSuccess / stats.totalEmails) * 100)
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
