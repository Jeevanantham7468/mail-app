import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
  Code,
  ExternalLink,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';
import { api } from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Realistic templates written by real humans
const REALISTIC_TEMPLATES = [
  {
    name: 'Campus Event Invite',
    subject: 'Invitation: Annual Tech Symposium & Hackathon 2026',
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
  <h2 style="color: #1e3a8a; margin-top: 0;">Annual Tech Symposium 2026 🎓</h2>
  <p style="color: #334155; line-height: 1.6;">Dear Student / Participant,</p>
  <p style="color: #334155; line-height: 1.6;">We are pleased to invite you to the upcoming <strong>Annual Tech Symposium & Hackathon</strong> happening on October 15th at the Main Auditorium.</p>
  <div style="background: #f1f5f9; padding: 16px; border-radius: 6px; margin: 16px 0;">
    <p style="margin: 0 0 8px 0; color: #0f172a; font-weight: bold;">Event Schedule:</p>
    <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.6;">
      <li>Keynote Speech: 09:30 AM</li>
      <li>Coding & Hackathon Round: 11:00 AM</li>
      <li>Project Exhibition & Awards: 03:00 PM</li>
    </ul>
  </div>
  <p style="text-align: center; margin: 24px 0;">
    <a href="https://example.com/register" style="background: #2563eb; color: #ffffff; padding: 10px 22px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Confirm Attendance</a>
  </p>
  <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">Best regards,<br/>Organizing Committee</p>
</div>`
  },
  {
    name: 'Placement / Interview',
    subject: 'Interview Call Letter: Technical Round Schedule',
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
  <h2 style="color: #0f172a; margin-top: 0;">Technical Interview Confirmation</h2>
  <p style="color: #334155; line-height: 1.6;">Dear Candidate,</p>
  <p style="color: #334155; line-height: 1.6;">Based on your performance in the initial screening, we are pleased to shortlist you for the <strong>Technical Round Interview</strong>.</p>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
    <tr>
      <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; width: 35%;">Role</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">Software Engineer Trainee</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Mode</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">Google Meet (Virtual)</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Date & Time</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">Friday, 10:00 AM IST</td>
    </tr>
  </table>
  <p style="color: #334155; line-height: 1.6;">Please join the meeting link 5 minutes prior to the scheduled slot with your updated resume ready.</p>
  <p style="color: #64748b; font-size: 13px;">Regards,<br/>Recruitment Team</p>
</div>`
  },
  {
    name: 'Weekly Update',
    subject: 'Weekly Team Digest: Sprint Progress & Updates',
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 6px; background: #ffffff;">
  <h3 style="color: #2563eb; margin-top: 0;">Weekly Project Summary</h3>
  <p style="color: #334155; line-height: 1.5;">Hi Team,</p>
  <p style="color: #334155; line-height: 1.5;">Here is a quick recap of what we completed this week:</p>
  <ul style="color: #475569; line-height: 1.6; padding-left: 20px;">
    <li>Completed MERN stack authentication and email logging.</li>
    <li>Resolved recipient batch delivery edge cases.</li>
    <li>Added CSV import support and statistics tracking.</li>
  </ul>
  <p style="color: #334155; line-height: 1.5;">Our next sprint planning will be on Monday at 10:00 AM.</p>
  <p style="color: #64748b; font-size: 13px;">Cheers,<br/>Project Lead</p>
</div>`
  }
];

export const MailComposer = ({
  initialSubject = '',
  initialBody = '',
  onEmailSent,
  addToast,
  currentSmtp,
  onOpenSmtp
}) => {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody || REALISTIC_TEMPLATES[0].body);
  const [recipientsInput, setRecipientsInput] = useState('');
  const [validRecipients, setValidRecipients] = useState([]);
  const [invalidRecipients, setInvalidRecipients] = useState([]);

  const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'preview'
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialSubject) setSubject(initialSubject);
    if (initialBody) setBody(initialBody);
  }, [initialSubject, initialBody]);

  // Parse recipient text
  useEffect(() => {
    if (!recipientsInput.trim()) {
      setValidRecipients([]);
      setInvalidRecipients([]);
      return;
    }

    const items = recipientsInput
      .split(/[,\n;\r\t]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    const valid = [];
    const invalid = [];

    items.forEach((email) => {
      if (EMAIL_REGEX.test(email)) {
        if (!valid.includes(email)) valid.push(email);
      } else {
        if (!invalid.includes(email)) invalid.push(email);
      }
    });

    setValidRecipients(valid);
    setInvalidRecipients(invalid);
  }, [recipientsInput]);

  // Insert sample test emails
  const handleAddSampleEmails = () => {
    const samples = [
      'student1@college.edu',
      'developer.john@gmail.com',
      'team.lead@company.org',
      'alex.karthi@example.com'
    ];
    const combined = Array.from(new Set([...validRecipients, ...samples]));
    setRecipientsInput(combined.join(', '));
    addToast({
      type: 'info',
      message: 'Added sample test recipient emails'
    });
  };

  // CSV/TXT file upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const matches = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
        if (matches && matches.length > 0) {
          const unique = Array.from(new Set(matches));
          const combined = Array.from(new Set([...validRecipients, ...unique]));
          setRecipientsInput(combined.join(', '));
          addToast({
            type: 'success',
            message: `Loaded ${unique.length} email addresses from ${file.name}`
          });
        } else {
          addToast({
            type: 'error',
            message: `Could not find valid emails in ${file.name}`
          });
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Apply a sample template
  const handleApplyTemplate = (tmpl) => {
    setSubject(tmpl.subject);
    setBody(tmpl.body);
    addToast({
      type: 'info',
      message: `Loaded "${tmpl.name}" template`
    });
  };

  // Quick HTML snippet insertion
  const handleInsertHtml = (type) => {
    let snippet = '';
    switch (type) {
      case 'b':
        snippet = '<b>Bold text</b>';
        break;
      case 'i':
        snippet = '<i>Italic text</i>';
        break;
      case 'btn':
        snippet = '<a href="https://example.com" style="background:#2563eb; color:#ffffff; padding:10px 18px; border-radius:4px; text-decoration:none; display:inline-block;">Click Here</a>';
        break;
      case 'list':
        snippet = '<ul>\n  <li>First point</li>\n  <li>Second point</li>\n</ul>';
        break;
      default:
        break;
    }
    setBody((prev) => `${prev}\n${snippet}`);
  };

  // Send email form submit
  const handleSend = async (e) => {
    e.preventDefault();

    if (!subject.trim()) {
      addToast({ type: 'error', message: 'Please enter an email subject' });
      return;
    }

    if (validRecipients.length === 0) {
      addToast({ type: 'error', message: 'Please enter at least one valid recipient' });
      return;
    }

    if (!body.trim()) {
      addToast({ type: 'error', message: 'Please write an email message' });
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const payload = {
        subject,
        body,
        recipients: validRecipients,
        smtpConfig: currentSmtp?.host ? currentSmtp : undefined
      };

      const res = await api.sendBulkMail(payload);
      setSendResult(res.data);

      addToast({
        type: 'success',
        title: 'Sent Successfully',
        message: res.message
      });

      if (onEmailSent) {
        onEmailSent(res.data);
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Sending Failed',
        message: err.message || 'Error occurred while sending emails'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* SMTP Mode Notification Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              currentSmtp?.host ? 'bg-green-500' : 'bg-blue-500'
            }`}
          />
          <span className="font-medium text-gray-700">
            {currentSmtp?.host ? (
              <>Using Custom SMTP ({currentSmtp.host})</>
            ) : (
              <>Ethereal Test Sandbox Active (Zero setup, sent mails generate online preview links)</>
            )}
          </span>
        </div>
        <button
          onClick={onOpenSmtp}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline self-start sm:self-auto"
        >
          Change SMTP Settings
        </button>
      </div>

      {/* Main Mail Compose Form */}
      <form onSubmit={handleSend} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-6">
        {/* 1. Subject */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-800">Subject</label>
            {/* Quick Templates */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>Use template:</span>
              {REALISTIC_TEMPLATES.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(t)}
                  className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Schedule for Technical Interview Round"
            className="w-full px-3.5 py-2.5 rounded-md border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* 2. Recipients */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-800">Recipients</label>
              {validRecipients.length > 0 && (
                <span className="text-xs bg-green-50 text-green-700 font-medium px-2 py-0.5 rounded border border-green-200">
                  {validRecipients.length} valid
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleAddSampleEmails}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Sample Emails</span>
              </button>

              <span className="text-gray-300">|</span>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-800 font-medium"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CSV / TXT</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.json"
                onChange={handleFileUpload}
                className="hidden"
              />

              {recipientsInput && (
                <>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setRecipientsInput('')}
                    className="text-gray-400 hover:text-red-600"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          <textarea
            rows={3}
            value={recipientsInput}
            onChange={(e) => setRecipientsInput(e.target.value)}
            placeholder="Enter recipient email addresses separated by commas, semicolons, or line breaks..."
            className="w-full px-3.5 py-2 rounded-md border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
          />

          {invalidRecipients.length > 0 && (
            <div className="mt-2 text-xs text-red-600 flex items-start gap-1.5 bg-red-50 p-2 rounded border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Skipping invalid email formats: <strong>{invalidRecipients.join(', ')}</strong>
              </span>
            </div>
          )}
        </div>

        {/* 3. Email Body & Live Preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-800">Email Message (HTML)</label>
              <div className="flex rounded-md border border-gray-200 bg-gray-50 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('editor')}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    viewMode === 'editor'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    viewMode === 'preview'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            {viewMode === 'editor' && (
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleInsertHtml('b')}
                  className="px-2 py-0.5 rounded border border-gray-200 hover:bg-gray-100 font-bold"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertHtml('i')}
                  className="px-2 py-0.5 rounded border border-gray-200 hover:bg-gray-100 italic"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertHtml('btn')}
                  className="px-2 py-0.5 rounded border border-gray-200 hover:bg-gray-100 text-blue-600 font-medium"
                >
                  + Button
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertHtml('list')}
                  className="px-2 py-0.5 rounded border border-gray-200 hover:bg-gray-100"
                >
                  + List
                </button>
              </div>
            )}
          </div>

          {viewMode === 'editor' ? (
            <textarea
              rows={12}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email body in HTML or plain text..."
              className="w-full px-3.5 py-2.5 rounded-md border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono leading-relaxed"
            />
          ) : (
            <div className="border border-gray-200 rounded-md p-6 bg-gray-50 min-h-[300px] flex justify-center">
              <div className="bg-white p-6 rounded border border-gray-200 shadow-sm w-full max-w-xl text-gray-800">
                <div
                  className="prose max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            {validRecipients.length > 0 ? (
              <span>
                Sending to <strong>{validRecipients.length}</strong> recipient(s).
              </span>
            ) : (
              <span>Enter recipients above to send.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={sending || validRecipients.length === 0}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition ${
              sending || validRecipients.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            }`}
          >
            {sending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending via Nodemailer...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Bulk Emails</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result feedback card */}
      {sendResult && (
        <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Campaign Sent Successfully!</h4>
                <p className="text-xs text-gray-600">
                  {sendResult.successCount} of {sendResult.recipientCount} emails delivered. Log saved in MongoDB.
                </p>
              </div>
            </div>

            {sendResult.previewUrl && (
              <a
                href={sendResult.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium border border-blue-200 transition"
              >
                <span>View Email Online</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
