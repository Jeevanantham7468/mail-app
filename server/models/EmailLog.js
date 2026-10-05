import mongoose from 'mongoose';

const recipientResultSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    status: {
      type: String,
      enum: ['sent', 'failed'],
      default: 'sent'
    },
    messageId: { type: String },
    error: { type: String },
    previewUrl: { type: String }
  },
  { _id: false }
);

const emailLogSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    body: {
      type: String,
      required: [true, 'Email body is required']
    },
    recipients: {
      type: [String],
      required: [true, 'Recipients list is required']
    },
    recipientCount: {
      type: Number,
      required: true,
      default: 0
    },
    successCount: {
      type: Number,
      default: 0
    },
    failureCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['sent', 'partial', 'failed', 'pending'],
      default: 'pending'
    },
    results: [recipientResultSchema],
    smtpUsed: {
      host: { type: String },
      user: { type: String },
      fromEmail: { type: String },
      isTestAccount: { type: Boolean, default: false }
    },
    previewUrl: {
      type: String
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Index for fast query on created time and status
emailLogSchema.index({ createdAt: -1 });
emailLogSchema.index({ status: 1 });

const EmailLog = mongoose.model('EmailLog', emailLogSchema);
export default EmailLog;
